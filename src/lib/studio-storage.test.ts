import { describe, it, expect, beforeEach } from 'vitest';
import { saveStudioDocument, listStudioDocuments, deleteStudioDocument } from './studio-storage';
import type { StudioDocument } from '../types';

describe('Studio Storage (IndexedDB)', () => {
  beforeEach(() => {
    // Reset any state
  });

  it('no arroja excepciones cuando indexedDB no está disponible en entorno no-browser', async () => {
    const original = globalThis.indexedDB;
    // @ts-expect-error test fallback
    delete globalThis.indexedDB;

    const doc: StudioDocument = {
      id: 'doc-test-1',
      title: 'Contrato de Prueba',
      sourceKind: 'blank',
      editorHtml: '<p>Texto de prueba</p>',
      citations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await expect(saveStudioDocument(doc)).resolves.toBeUndefined();
    await expect(listStudioDocuments()).resolves.toEqual([]);
    await expect(deleteStudioDocument('doc-test-1')).resolves.toBeUndefined();

    globalThis.indexedDB = original;
  });
});
