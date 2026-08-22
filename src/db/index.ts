import Dexie, { type Table } from 'dexie';
import type { SavedCase } from '../types';

export class LexDatabase extends Dexie {
  cases!: Table<SavedCase, string>;

  constructor() {
    super('LexCorporativoPwaDB');
    this.version(1).stores({
      cases: 'id, title, area, createdAt, updatedAt',
    });
  }
}

export const db = new LexDatabase();
