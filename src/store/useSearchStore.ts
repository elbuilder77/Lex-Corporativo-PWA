import { create } from 'zustand';
import type { LegalArticle } from '../types';

export interface SearchHistoryItem {
  id: string;
  query: string;
  lawCode: string;
  lawName: string;
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
  isFavorite: (articleId: string) => boolean;
  loadFromStorage: () => void;
}

const HISTORY_KEY = 'lex_pwa_search_history_v1';
const FAVORITES_KEY = 'lex_pwa_favorites_v1';
const MAX_HISTORY = 50;

export const useSearchStore = create<SearchStore>((set, get) => ({
  history: [],
  favorites: [],

  addToHistory: (item) => {
    const newItem: SearchHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    set((state) => {
      const filtered = state.history.filter((h) => h.query !== item.query || h.lawCode !== item.lawCode);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch { }
      return { history: updated };
    });
  },

  removeFromHistory: (id) => {
    set((state) => {
      const updated = state.history.filter((h) => h.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch { }
      return { history: updated };
    });
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch { }
    set({ history: [] });
  },

  addToFavorites: (article) => {
    const newFav: FavoriteArticle = {
      id: article.id,
      article,
      savedAt: Date.now(),
    };
    set((state) => {
      if (state.favorites.some((f) => f.id === article.id)) return state;
      const updated = [newFav, ...state.favorites];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch { }
      return { favorites: updated };
    });
  },

  removeFromFavorites: (id) => {
    set((state) => {
      const updated = state.favorites.filter((f) => f.id !== id);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch { }
      return { favorites: updated };
    });
  },

  isFavorite: (articleId) => {
    return get().favorites.some((f) => f.id === articleId);
  },

  loadFromStorage: () => {
    try {
      const hist = localStorage.getItem(HISTORY_KEY);
      const fav = localStorage.getItem(FAVORITES_KEY);
      if (hist) set({ history: JSON.parse(hist) });
      if (fav) set({ favorites: JSON.parse(fav) });
    } catch { }
  },
}));