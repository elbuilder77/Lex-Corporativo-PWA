import { openDB, type DBSchema } from 'idb';
import type { StudioDocument } from '../types';

interface StudioDatabase extends DBSchema {
  documents: {
    key: string;
    value: StudioDocument;
    indexes: { 'by-updated': string };
  };
}

const DATABASE_NAME = 'lex-corporativo-estudio';
const DATABASE_VERSION = 1;

const database = () =>
  openDB<StudioDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('documents', { keyPath: 'id' });
      store.createIndex('by-updated', 'updatedAt');
    },
  });

export async function saveStudioDocument(document: StudioDocument): Promise<void> {
  const db = await database();
  await db.put('documents', document);
}

export async function listStudioDocuments(): Promise<StudioDocument[]> {
  const db = await database();
  const documents = await db.getAllFromIndex('documents', 'by-updated');
  return documents.reverse();
}

export async function deleteStudioDocument(id: string): Promise<void> {
  const db = await database();
  await db.delete('documents', id);
}
