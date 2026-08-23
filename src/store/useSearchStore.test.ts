import { act, renderHook } from '@testing-library/react';
import { FAVORITES_KEY, HISTORY_KEY, useSearchStore } from './useSearchStore';
import type { LegalArticle } from '../types';

const mockArticle: LegalArticle = {
  id: 'lft-47',
  lawCode: 'LFT',
  lawName: 'Ley Federal del Trabajo',
  articleNumber: '47',
  title: 'Rescisión',
  content: 'Texto de prueba',
  area: 'laboral',
  sourceKind: 'ley',
  sourceName: 'Cámara de Diputados · Leyes Federales',
  sourceUrl: 'https://www.diputados.gob.mx/LeyesBiblio/index.htm',
};

describe('useSearchStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchStore.setState({ history: [], favorites: [] });
  });

  it('guarda y deduplica búsquedas por consulta y alcance', () => {
    const { result } = renderHook(() => useSearchStore());
    const item = { query: 'rescisión', scope: 'laboral' as const, scopeLabel: 'Laboral', resultCount: 8 };
    act(() => result.current.addToHistory(item));
    act(() => result.current.addToHistory({ ...item, resultCount: 4 }));

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({ query: 'rescisión', scope: 'laboral', resultCount: 4 });
    expect(localStorage.setItem).toHaveBeenCalledWith(HISTORY_KEY, expect.any(String));
  });

  it('limita el historial a 50 consultas', () => {
    const { result } = renderHook(() => useSearchStore());
    for (let index = 0; index < 60; index += 1) {
      act(() => result.current.addToHistory({ query: `consulta ${index}`, scope: 'todos', scopeLabel: 'Todos los ordenamientos incluidos', resultCount: 1 }));
    }
    expect(result.current.history).toHaveLength(50);
  });

  it('guarda favoritos sin duplicarlos y permite eliminarlos', () => {
    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.addToFavorites(mockArticle));
    act(() => result.current.addToFavorites(mockArticle));
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(mockArticle.id)).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, expect.any(String));

    act(() => result.current.removeFromFavorites(mockArticle.id));
    expect(result.current.isFavorite(mockArticle.id)).toBe(false);
  });

  it('carga historial y favoritos desde el navegador', () => {
    const history = [{ id: 'h1', query: 'artículo 47', scope: 'laboral' as const, scopeLabel: 'Laboral', resultCount: 1, timestamp: 1 }];
    const favorites = [{ id: mockArticle.id, article: mockArticle, savedAt: 1 }];
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === HISTORY_KEY) return JSON.stringify(history);
      if (key === FAVORITES_KEY) return JSON.stringify(favorites);
      return null;
    });

    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.loadFromStorage());
    expect(result.current.history).toEqual(history);
    expect(result.current.favorites).toEqual(favorites);
  });

  it('borra todos los datos personales de la PWA', () => {
    useSearchStore.setState({ history: [{ id: 'h1', query: 'iva', scope: 'fiscal', scopeLabel: 'Fiscal', resultCount: 2, timestamp: 1 }], favorites: [{ id: mockArticle.id, article: mockArticle, savedAt: 1 }] });
    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.clearAll());
    expect(result.current.history).toEqual([]);
    expect(result.current.favorites).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith(HISTORY_KEY);
    expect(localStorage.removeItem).toHaveBeenCalledWith(FAVORITES_KEY);
  });
});
