import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DraftingStudio } from './DraftingStudio';
import { createStudioDocument, createStudioSession } from '../lib/studio-session';

afterEach(() => vi.useRealTimers());
function setup(list = vi.fn().mockResolvedValue([])) {
  const storage = { list, save: vi.fn().mockResolvedValue(undefined), remove: vi.fn().mockResolvedValue(undefined),
    lastOpened: vi.fn().mockResolvedValue(undefined), remember: vi.fn().mockResolvedValue(undefined) };
  const session = createStudioSession(storage, { read: () => null, acknowledge: () => {} });
  return { session, storage };
}

it('una recuperación tardía no sustituye el título escrito mientras se carga', async () => {
  let resolve!: (documents: ReturnType<typeof createStudioDocument>[]) => void;
  const { session } = setup(vi.fn(() => new Promise((done) => { resolve = done; })));
  await act(async () => { render(<DraftingStudio session={session} />); });
  fireEvent.change(screen.getByLabelText('Título del documento'), { target: { value: 'Trabajo nuevo' } });
  await act(async () => { resolve([createStudioDocument({ title: 'Anterior' })]); });
  expect(screen.getByLabelText('Título del documento')).toHaveValue('Trabajo nuevo');
  await act(async () => { await session.flush(); });
});

it('un error de recuperación muestra reintento y no finge borradores vacíos', async () => {
  const { session } = setup(vi.fn().mockRejectedValue(new Error('Lectura denegada')));
  render(<DraftingStudio session={session} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Lectura denegada');
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('status', { name: 'Estado del borrador' })).toHaveTextContent('Requiere atención');
});

it('anuncia título pendiente y lo conserva al desmontar antes del autoguardado', async () => {
  const { session, storage } = setup();
  const view = render(<DraftingStudio session={session} />);
  const catalog = await screen.findByRole('dialog', { name: 'Catálogo de instrumentos y plantillas' });
  fireEvent.click(within(catalog).getByRole('button', { name: 'Cerrar catálogo' }));
  vi.useFakeTimers();
  fireEvent.change(screen.getByLabelText('Título del documento'), { target: { value: 'Cambio pendiente' } });
  expect(screen.getByRole('status', { name: 'Estado del borrador' })).toHaveTextContent('Cambios pendientes');
  view.unmount();
  await act(async () => { await vi.advanceTimersByTimeAsync(650); });
  expect(storage.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cambio pendiente' }));
  expect(session.getSnapshot().status).toBe('saved');
});
