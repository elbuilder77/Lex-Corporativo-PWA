import { vi } from 'vitest';
import { extractExplicitArticle, executeCorpusSearch } from './corpus-search';
import { searchInAreaLaws, searchInSingleLaw } from './sqlite-db';

vi.mock('./sqlite-db', () => ({
  searchInAreaLaws: vi.fn().mockResolvedValue([]),
  searchInSingleLaw: vi.fn().mockResolvedValue([]),
}));

describe('corpus-search', () => {
  beforeEach(() => vi.clearAllMocks());

  it('extrae solamente referencias explícitas a artículos', () => {
    expect(extractExplicitArticle('rescisión artículo 47')).toBe('47');
    expect(extractExplicitArticle('consulta art. 12 Bis')).toBe('12 bis');
    expect(extractExplicitArticle('47')).toBe('47');
    expect(extractExplicitArticle('tasa del 16 por ciento')).toBeUndefined();
  });

  it('busca localmente en un área sin seleccionar ley', async () => {
    const result = await executeCorpusSearch({ query: ' impuesto ', scope: 'fiscal' });
    expect(searchInAreaLaws).toHaveBeenCalledWith(expect.objectContaining({ area: 'fiscal', searchTerms: 'impuesto' }));
    expect(result).toMatchObject({ query: 'impuesto', scopeLabel: 'Fiscal', engine: 'sqlite_wasm_local' });
  });

  it('limita la búsqueda a un ordenamiento cuando se selecciona', async () => {
    const result = await executeCorpusSearch({ query: 'artículo 47', scope: 'laboral', lawCode: 'LFT' });
    expect(searchInSingleLaw).toHaveBeenCalledWith(expect.objectContaining({ targetLawCode: 'LFT', candidateArticleNumber: '47' }));
    expect(result.scopeLabel).toBe('Ley Federal del Trabajo');
  });
});
