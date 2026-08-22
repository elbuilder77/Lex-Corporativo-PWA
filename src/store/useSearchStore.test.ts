import { act, renderHook } from '@testing-library/react';
import { useSearchStore } from '../store/useSearchStore';

describe('useSearchStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useSearchStore.setState({
      history: [],
      favorites: [],
    });
  });

  describe('initial state', () => {
    it('should have empty history and favorites', () => {
      const { result } = renderHook(() => useSearchStore());
      expect(result.current.history).toEqual([]);
      expect(result.current.favorites).toEqual([]);
    });
  });

  describe('addToHistory', () => {
    it('should add item to history with timestamp and id', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToHistory({
        query: 'test query',
        lawCode: 'LFT',
        lawName: 'Ley Federal del Trabajo',
        resultCount: 5,
      }));
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].query).toBe('test query');
      expect(result.current.history[0].lawCode).toBe('LFT');
      expect(result.current.history[0].id).toMatch(/^hist_\d+/);
      expect(result.current.history[0].timestamp).toBeDefined();
    });

    it('should deduplicate by query and lawCode', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToHistory({
        query: 'test query',
        lawCode: 'LFT',
        lawName: 'Ley Federal del Trabajo',
        resultCount: 5,
      }));
      act(() => result.current.addToHistory({
        query: 'test query',
        lawCode: 'LFT',
        lawName: 'Ley Federal del Trabajo',
        resultCount: 3,
      }));
      expect(result.current.history).toHaveLength(1);
    });

    it('should limit history to MAX_HISTORY items', () => {
      const { result } = renderHook(() => useSearchStore());
      for (let i = 0; i < 60; i++) {
        act(() => result.current.addToHistory({
          query: `query ${i}`,
          lawCode: 'LFT',
          lawName: 'Ley Federal del Trabajo',
          resultCount: 1,
        }));
      }
      expect(result.current.history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('removeFromHistory', () => {
    it('should remove item by id', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToHistory({
        query: 'test query',
        lawCode: 'LFT',
        lawName: 'Ley Federal del Trabajo',
        resultCount: 5,
      }));
      const id = result.current.history[0].id;
      act(() => result.current.removeFromHistory(id));
      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToHistory({
        query: 'test query',
        lawCode: 'LFT',
        lawName: 'Ley Federal del Trabajo',
        resultCount: 5,
      }));
      act(() => result.current.clearHistory());
      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('favorites', () => {
    const mockArticle = {
      id: 'art-1',
      lawCode: 'LFT',
      lawName: 'Ley Federal del Trabajo',
      articleNumber: 'Art. 1',
      title: 'Test Article',
      content: 'Content',
      area: 'laboral' as const,
    };

    it('should add article to favorites', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToFavorites(mockArticle));
      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].article).toEqual(mockArticle);
      expect(result.current.isFavorite('art-1')).toBe(true);
    });

    it('should not duplicate favorites', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToFavorites(mockArticle));
      act(() => result.current.addToFavorites(mockArticle));
      expect(result.current.favorites).toHaveLength(1);
    });

    it('should remove from favorites', () => {
      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.addToFavorites(mockArticle));
      act(() => result.current.removeFromFavorites('art-1'));
      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.isFavorite('art-1')).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should load from localStorage', () => {
      const savedHistory = [{
        id: 'hist-1',
        query: 'saved query',
        lawCode: 'CCom',
        lawName: 'Código de Comercio',
        resultCount: 3,
        timestamp: Date.now(),
      }];
      const savedFavorites = [{
        id: 'art-1',
        article: { id: 'art-1', lawCode: 'CCom', lawName: 'Código de Comercio', articleNumber: 'Art. 1', title: 'Saved', content: '', area: 'mercantil' as const },
        savedAt: Date.now(),
      }];
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'lex_pwa_search_history_v1') return JSON.stringify(savedHistory);
        if (key === 'lex_pwa_favorites_v1') return JSON.stringify(savedFavorites);
        return null;
      });

      const { result } = renderHook(() => useSearchStore());
      act(() => result.current.loadFromStorage());
      expect(result.current.history).toEqual(savedHistory);
      expect(result.current.favorites).toEqual(savedFavorites);
    });
  });
});