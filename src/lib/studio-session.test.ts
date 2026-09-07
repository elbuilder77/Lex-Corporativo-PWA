import { afterEach, expect, it, vi } from 'vitest';
import { createStudioDocument, createStudioSession } from './studio-session';
import type { LegalArticle, StudioDocument } from '../types';

afterEach(() => vi.useRealTimers());
function memory(documents: StudioDocument[] = []) {
  const docs = new Map(documents.map((doc) => [doc.id, doc]));
  let lastOpened: string | null | undefined;
  return {
    list: vi.fn(async () => [...docs.values()]),
    save: vi.fn(async (doc: StudioDocument) => { docs.set(doc.id, doc); lastOpened = doc.id; }),
    remove: vi.fn(async (id: string) => { docs.delete(id); if (lastOpened === id) lastOpened = null; }),
    lastOpened: async () => lastOpened,
    remember: async (id: string | null) => { lastOpened = id; },
  };
}
const noCitation = { read: () => null, acknowledge: () => {} };
const article: LegalArticle = { id: 'LFT47', lawCode: 'LFT', lawName: 'Ley Federal del Trabajo', articleNumber: '47', title: 'Rescisión', content: 'Texto de prueba', area: 'laboral', sourceKind: 'ley', sourceName: 'Cámara de Diputados', sourceUrl: 'https://example.test/lft' };

it('guarda A antes de abrir B y recupera el último abierto sin guardar sólo por leer', async () => {
  const a = createStudioDocument({ title: 'A' }), b = createStudioDocument({ title: 'B' });
  const storage = memory([a, b]);
  const session = createStudioSession(storage, noCitation);
  await session.initialize();
  expect(storage.save).not.toHaveBeenCalled();
  session.update((doc) => ({ ...doc, title: 'A editado' }));
  await session.replace(b);
  const reopened = createStudioSession(storage, noCitation);
  await reopened.initialize();
  expect(reopened.getSnapshot().document.id).toBe(b.id);
  expect(reopened.getSnapshot().documents.find((doc) => doc.id === a.id)?.title).toBe('A editado');
});

it('eliminar activo invalida autoguardado y guardar no resucita su id', async () => {
  vi.useFakeTimers();
  const document = createStudioDocument({ title: 'Eliminar' });
  const storage = memory([document]);
  const session = createStudioSession(storage, noCitation);
  await session.initialize();
  session.update((doc) => ({ ...doc, title: 'Pendiente de eliminar' }));
  expect(await session.remove(document.id)).toBe(true);
  await session.flush();
  await vi.advanceTimersByTimeAsync(1000);
  expect(session.getSnapshot().document.id).not.toBe(document.id);
  expect(session.getSnapshot().documents).toEqual([]);
  const reopened = createStudioSession(storage, noCitation);
  await reopened.initialize();
  expect(reopened.getSnapshot().documents).toEqual([]);
});

it('conserva cita pendiente hasta guardar sobre el borrador recuperado', async () => {
  const saved = createStudioDocument({ title: 'Con cita' });
  const storage = memory([saved]);
  let value: string | null = JSON.stringify(article);
  const pending = { read: () => value, acknowledge: () => { value = null; } };
  const session = createStudioSession(storage, pending);
  storage.save.mockRejectedValueOnce(new DOMException('Sin espacio', 'QuotaExceededError'));
  expect(await session.receivePendingCitation()).toBe(false);
  expect(value).not.toBeNull();
  expect(session.getSnapshot().document.id).toBe(saved.id);
  expect(session.getSnapshot().document.citations).toHaveLength(1);
  expect(session.getSnapshot().error).toContain('espacio');
  expect(await session.retry()).toBe(true);
  expect(value).toBeNull();
  const reopened = createStudioSession(storage, pending);
  await reopened.initialize();
  expect(reopened.getSnapshot().document.citations).toHaveLength(1);
});

it('una cita como único cambio del documento inicial también se persiste', async () => {
  const storage = memory();
  const session = createStudioSession(storage, { read: () => JSON.stringify(article), acknowledge: () => {} });
  await session.receivePendingCitation();
  const reopened = createStudioSession(storage, noCitation);
  await reopened.initialize();
  expect(reopened.getSnapshot().document.citations[0].articleId).toBe(article.id);
});

it('una escritura anterior no confirma una edición más reciente', async () => {
  const storage = memory();
  const session = createStudioSession(storage, noCitation);
  await session.initialize();
  let complete!: () => void;
  storage.save.mockImplementationOnce(() => new Promise<void>((resolve) => { complete = resolve; }));
  session.update((doc) => ({ ...doc, title: 'Revisión 1' }));
  const saving = session.flush();
  await vi.waitFor(() => expect(complete).toBeTypeOf('function'));
  session.update((doc) => ({ ...doc, title: 'Revisión 2' }));
  storage.save.mockRejectedValueOnce(new Error('Escritura segunda fallida'));
  complete();
  expect(await saving).toBe(false);
  expect(session.hasPendingChanges()).toBe(true);
  expect(session.getSnapshot().status).toBe('error');
  expect(session.getSnapshot().document.title).toBe('Revisión 2');
  expect(await session.flush()).toBe(true);
  expect(session.hasPendingChanges()).toBe(false);
});

it('un fallo de almacenamiento impide reemplazar trabajo y permite reintentar', async () => {
  const storage = memory();
  const session = createStudioSession(storage, noCitation);
  await session.initialize();
  session.update((doc) => ({ ...doc, title: 'No perder' }));
  storage.save.mockRejectedValueOnce(new Error('No disponible'));
  expect(await session.replace(createStudioDocument({ title: 'Nuevo' }))).toBe(false);
  expect(session.getSnapshot().document.title).toBe('No perder');
  expect(await session.prepareToLeave()).toBe(true);
  expect(session.getSnapshot().status).toBe('saved');
});

it('un guardado exitoso no depende de volver a listar el almacenamiento', async () => {
  const storage = memory();
  const session = createStudioSession(storage, noCitation);
  await session.initialize();
  storage.list.mockRejectedValue(new Error('Lectura fallida'));
  session.update((doc) => ({ ...doc, title: 'Guardado' }));
  expect(await session.flush()).toBe(true);
  expect(session.getSnapshot().status).toBe('saved');
  expect(session.getSnapshot().error).toBeNull();
});

it('una segunda sesión sin permiso de escritura no puede modificar ni guardar', async () => {
  const storage = memory();
  const acquire = vi.fn().mockResolvedValue(false);
  const session = createStudioSession(storage, noCitation, acquire);
  expect(await session.initialize()).toBe(false);
  const original = session.getSnapshot().document;
  session.update((doc) => ({ ...doc, title: 'No autorizado' }));
  expect(session.getSnapshot().document).toBe(original);
  expect(storage.save).not.toHaveBeenCalled();
  acquire.mockResolvedValue(true);
  expect(await session.retry()).toBe(true);
  expect(session.getSnapshot().locked).toBe(false);
});
