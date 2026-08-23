import { create } from 'zustand';
import type { CorpusSearchScope, LegalArticle } from '../types';

export interface SearchHistoryItem {
  id: string;
  query: string;
  scope: CorpusSearchScope;
  scopeLabel: string;
  lawCode?: string;
  timestamp: number;
  resultCount: number;
}

export interface FavoriteArticle {
  id: string;
  article: LegalArticle;
  savedAt: number;
}

interface SearchStore {
  history: SearchHistoryItem[];
  favorites: FavoriteArticle[];
  addToHistory: (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  addToFavorites: (article: LegalArticle) => void;
  removeFromFavorites: (id: string) => void;
  clearFavorites: () => void;
  clearAll: () => void;
  isFavorite: (articleId: string) => boolean;
  loadFromStorage: () => void;
}

export const HISTORY_KEY = 'lex_pwa_search_history_v2';
export const FAVORITES_KEY = 'lex_pwa_favorites_v2';
const MAX_HISTORY = 50;

function writeStorage(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* almacenamiento no disponible */ }
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  history: [],
  favorites: [],

  addToHistory: (item) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    set((state) => {
      const filtered = state.history.filter(
        (historyItem) => historyItem.query !== item.query || historyItem.scopeLabel !== item.scopeLabel,
      );
      const history = [newItem, ...filtered].slice(0, MAX_HISTORY);
      writeStorage(HISTORY_KEY, history);
      return { history };
    });
  },

  removeFromHistory: (id) => {
    set((state) => {
      const history = state.history.filter((item) => item.id !== id);
      writeStorage(HISTORY_KEY, history);
      return { history };
    });
  },

  clearHistory: () => {
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
    set({ history: [] });
  },

  addToFavorites: (article) => {
    set((state) => {
      if (state.favorites.some((favorite) => favorite.id === article.id)) return state;
      const favorites = [{ id: article.id, article, savedAt: Date.now() }, ...state.favorites];
      writeStorage(FAVORITES_KEY, favorites);
      return { favorites };
    });
  },

  removeFromFavorites: (id) => {
    set((state) => {
      const favorites = state.favorites.filter((favorite) => favorite.id !== id);
      writeStorage(FAVORITES_KEY, favorites);
      return { favorites };
    });
  },

  clearFavorites: () => {
    try { localStorage.removeItem(FAVORITES_KEY); } catch { /* noop */ }
    set({ favorites: [] });
  },

  clearAll: () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(FAVORITES_KEY);
    } catch { /* noop */ }
    set({ history: [], favorites: [] });
  },

  isFavorite: (articleId) => get().favorites.some((favorite) => favorite.id === articleId),

  loadFromStorage: () => {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      const favorites = localStorage.getItem(FAVORITES_KEY);
      if (history) set({ history: JSON.parse(history) as SearchHistoryItem[] });
      if (favorites) set({ favorites: JSON.parse(favorites) as FavoriteArticle[] });
    } catch {
      set({ history: [], favorites: [] });
    }
  },
}));
