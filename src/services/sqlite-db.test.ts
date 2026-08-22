import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchInSingleLaw, searchInAreaLaws, getSqliteDb, LegalArticle } from '../services/sqlite-db';

describe('sqlite-db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('getSqliteDb', () => {
    it('should initialize database and return instance', async () => {
      const db = await getSqliteDb();
      expect(db).toBeDefined();
      expect(typeof db.run).toBe('function');
      expect(typeof db.prepare).toBe('function');
    });

    it('should return cached instance on subsequent calls', async () => {
      const db1 = await getSqliteDb();
      const db2 = await getSqliteDb();
      expect(db1).toBe(db2);
    });
  });

  describe('searchInSingleLaw', () => {
    it('should return empty array when no results', async () => {
      const results = await searchInSingleLaw({
        targetLawCode: 'NONEXISTENT',
        searchTerms: 'test',
        limit: 5,
      });
      expect(results).toEqual([]);
    });

    it('should search with correct parameters', async () => {
      const results = await searchInSingleLaw({
        targetLawCode: 'LFT',
        searchTerms: 'rescisión',
        limit: 10,
      });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('searchInAreaLaws', () => {
    it('should search across all areas when area is todos', async () => {
      const results = await searchInAreaLaws({
        area: 'todos',
        searchTerms: 'trabajo',
        limit: 5,
      });
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search within specific area', async () => {
      const results = await searchInAreaLaws({
        area: 'laboral',
        searchTerms: 'rescisión',
        limit: 5,
      });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('LegalArticle type', () => {
    it('should match LegalArticle interface', () => {
      const article: LegalArticle = {
        id: 'test-1',
        lawCode: 'LFT',
        lawName: 'Ley Federal del Trabajo',
        articleNumber: 'Art. 1',
        title: 'Test',
        content: 'Content',
        area: 'laboral',
        score: 100,
      };
      expect(article.id).toBe('test-1');
      expect(article.score).toBe(100);
    });
  });
});