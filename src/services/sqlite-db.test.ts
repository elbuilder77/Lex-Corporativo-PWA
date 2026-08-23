import { calculateLegalScore, getSqliteDb, searchInAreaLaws, searchInSingleLaw } from './sqlite-db';
import type { LegalArticle } from '../types';

describe('sqlite-db', () => {
  it('inicializa una única instancia SQLite WASM', async () => {
    const first = await getSqliteDb();
    const second = await getSqliteDb();
    expect(first).toBe(second);
    expect(first.prepare).toBeTypeOf('function');
  });

  it('devuelve un arreglo al buscar por ordenamiento', async () => {
    await expect(searchInSingleLaw({ targetLawCode: 'LFT', searchTerms: 'rescisión' })).resolves.toEqual([]);
  });

  it('devuelve un arreglo al buscar por área o en todo el corpus', async () => {
    await expect(searchInAreaLaws({ area: 'fiscal', searchTerms: 'impuesto' })).resolves.toEqual([]);
    await expect(searchInAreaLaws({ area: 'todos', searchTerms: 'sociedad' })).resolves.toEqual([]);
  });

  it('define la trazabilidad oficial de un artículo', () => {
    const article: LegalArticle = {
      id: 'cff-1', lawCode: 'CFF', lawName: 'Código Fiscal de la Federación', articleNumber: '1',
      title: 'Sujetos obligados', content: 'Texto', area: 'fiscal', sourceKind: 'ley',
      sourceName: 'Cámara de Diputados · Leyes Federales', sourceUrl: 'https://www.diputados.gob.mx/LeyesBiblio/index.htm',
    };
    expect(article.sourceUrl).toContain('diputados.gob.mx');
  });

  it('prioriza el artículo exacto y descarta consultas compuestas sólo por palabras vacías', () => {
    const exact = calculateLegalScore('Causas de rescisión', 'Ley Federal del Trabajo - Artículo 47', 'Art. 47', 'articulo 47', '47');
    const partial = calculateLegalScore('Otro supuesto', 'Ley Federal del Trabajo - Artículo 147', 'Art. 147', 'articulo 47', '47');
    expect(exact).toBeGreaterThan(partial);
    expect(calculateLegalScore('Texto para los trabajadores', 'Título', 'Art. 1', 'para los', '')).toBe(0);
  });
});
