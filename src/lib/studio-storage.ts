import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StudioDocument } from '../types';

interface StudioDatabase extends DBSchema {
  documents: { key: string; value: StudioDocument; indexes: { 'by-updated': string } };
  preferences: { key: string; value: string | null };
}

async function database() {
  if (typeof indexedDB === 'undefined') {
    throw new Error('El almacenamiento local no está disponible. Conserva una copia descargada antes de salir.');
  }
  return new Promise<IDBPDatabase<StudioDatabase>>((resolve, reject) => {
    let blocked = false;
    const opening = openDB<StudioDatabase>('lex-corporativo-estudio', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' });
          store.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('preferences')) db.createObjectStore('preferences');
      },
      blocked() {
        blocked = true;
        reject(new Error('Cierra las otras pestañas de Lex Corporativo y pulsa Reintentar para actualizar los borradores locales.'));
      },
      blocking() { void opening.then((db) => db.close()); },
    });
    opening.then((db) => {
      // IndexedDB cannot cancel an open request. Close a late result after the
      // caller received the actionable error, so a retry owns its connection.
      if (blocked) db.close();
      else resolve(db);
    }, reject);
  });
}

export async function saveStudioDocument(document: StudioDocument): Promise<void> {
  const db = await database();
  try {
    const tx = db.transaction(['documents', 'preferences'], 'readwrite');
    await Promise.all([tx.objectStore('documents').put(document),
      tx.objectStore('preferences').put(document.id, 'last-opened'), tx.done]);
  } finally { db.close(); }
}

export async function listStudioDocuments(): Promise<StudioDocument[]> {
  const db = await database();
  try { return (await db.getAllFromIndex('documents', 'by-updated')).reverse(); }
  finally { db.close(); }
}

export async function getLastOpenedStudioDocument(): Promise<string | null | undefined> {
  const db = await database();
  try { return await db.get('preferences', 'last-opened'); }
  finally { db.close(); }
}

export async function setLastOpenedStudioDocument(id: string | null): Promise<void> {
  const db = await database();
  try { await db.put('preferences', id, 'last-opened'); }
  finally { db.close(); }
}

export async function deleteStudioDocument(id: string): Promise<void> {
  const db = await database();
  try {
    const tx = db.transaction(['documents', 'preferences'], 'readwrite');
    const preferences = tx.objectStore('preferences');
    const lastOpened = await preferences.get('last-opened');
    await Promise.all([tx.objectStore('documents').delete(id),
      lastOpened === id ? preferences.put(null, 'last-opened') : Promise.resolve(), tx.done]);
  } finally { db.close(); }
}

export const studioStorage = {
  list: listStudioDocuments, save: saveStudioDocument, remove: deleteStudioDocument,
  lastOpened: getLastOpenedStudioDocument, remember: setLastOpenedStudioDocument,
};
