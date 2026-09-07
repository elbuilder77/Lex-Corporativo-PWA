import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { openDB } from 'idb';
import { studioStorage } from './studio-storage';
import { createStudioDocument } from './studio-session';

beforeEach(() => vi.stubGlobal('indexedDB', new IDBFactory()));
afterEach(() => vi.unstubAllGlobals());

it('guarda y recupera DOCX con original y contexto, luego elimina y limpia último abierto', async () => {
  const document = createStudioDocument({ title: 'Contrato', sourceKind: 'docx', sourceBuffer: new Uint8Array([1, 2, 3]).buffer,
    templateId: 'pagare_mercantil', templateValues: { monto: '100' } });
  await studioStorage.save(document);
  expect(await studioStorage.list()).toEqual([document]);
  expect(await studioStorage.lastOpened()).toBe(document.id);
  await studioStorage.remove(document.id);
  expect(await studioStorage.list()).toEqual([]);
  expect(await studioStorage.lastOpened()).toBeNull();
});

it('migra borradores existentes de versión 1 sin perder contenido', async () => {
  const legacy = await openDB('lex-corporativo-estudio', 1, { upgrade(db) {
    const documents = db.createObjectStore('documents', { keyPath: 'id' });
    documents.createIndex('by-updated', 'updatedAt');
  } });
  const document = createStudioDocument({ title: 'Anterior al release', editorHtml: '<p>Conservar</p>' });
  await legacy.put('documents', document);
  legacy.close();
  expect(await studioStorage.list()).toEqual([document]);
  expect(await studioStorage.lastOpened()).toBeUndefined();
  await studioStorage.remember(document.id);
  expect(await studioStorage.lastOpened()).toBe(document.id);
});

it('rechaza operaciones sin IndexedDB en vez de anunciar éxito falso', async () => {
  vi.stubGlobal('indexedDB', undefined);
  await expect(studioStorage.save(createStudioDocument())).rejects.toThrow('no está disponible');
  await expect(studioStorage.list()).rejects.toThrow('no está disponible');
  await expect(studioStorage.remove('un-documento')).rejects.toThrow('no está disponible');
});

it('explica una migración bloqueada por una pestaña antigua y permite reintentar', async () => {
  const legacy = await openDB('lex-corporativo-estudio', 1, { upgrade(db) {
    db.createObjectStore('documents', { keyPath: 'id' }).createIndex('by-updated', 'updatedAt');
  } });
  try {
    await expect(studioStorage.list()).rejects.toThrow('Cierra las otras pestañas');
  } finally { legacy.close(); }
  expect(await studioStorage.list()).toEqual([]);
});
