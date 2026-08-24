import { create } from 'zustand';
import type { LegalArticle, LicitacionPublica } from '../types';

export interface FavoriteArticle {
  id: string;
  article: LegalArticle;
  savedAt: number;
}

export interface FavoriteLicitacion {
  id: string;
  licitacion: LicitacionPublica;
  savedAt: number;
}

interface SearchStore {
  favorites: FavoriteArticle[];
  favoriteLicitaciones: FavoriteLicitacion[];

  // Legal Articles favorites
  addToFavorites: (article: LegalArticle) => void;
  removeFromFavorites: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (articleId: string) => boolean;

  // Licitaciones favorites
  addToFavoriteLicitaciones: (licitacion: LicitacionPublica) => void;
  removeFromFavoriteLicitaciones: (id: string) => void;
  clearFavoriteLicitaciones: () => void;
  isFavoriteLicitacion: (licitacionId: string) => boolean;

  // Global actions
  clearAll: () => void;
  loadFromStorage: () => void;
}

export const FAVORITES_KEY = 'lex_pwa_favorites_v2';
export const FAVORITES_LICITACIONES_KEY = 'lex_pwa_fav_licitaciones_v2';

function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  favorites: [],
  favoriteLicitaciones: [],

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
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch {
      /* noop */
    }
    set({ favorites: [] });
  },

  isFavorite: (articleId) => get().favorites.some((favorite) => favorite.id === articleId),

  addToFavoriteLicitaciones: (licitacion) => {
    set((state) => {
      if (state.favoriteLicitaciones.some((item) => item.id === licitacion.id)) return state;
      const favoriteLicitaciones = [
        { id: licitacion.id, licitacion, savedAt: Date.now() },
        ...state.favoriteLicitaciones,
      ];
      writeStorage(FAVORITES_LICITACIONES_KEY, favoriteLicitaciones);
      return { favoriteLicitaciones };
    });
  },

  removeFromFavoriteLicitaciones: (id) => {
    set((state) => {
      const favoriteLicitaciones = state.favoriteLicitaciones.filter((item) => item.id !== id);
      writeStorage(FAVORITES_LICITACIONES_KEY, favoriteLicitaciones);
      return { favoriteLicitaciones };
    });
  },

  clearFavoriteLicitaciones: () => {
    try {
      localStorage.removeItem(FAVORITES_LICITACIONES_KEY);
    } catch {
      /* noop */
    }
    set({ favoriteLicitaciones: [] });
  },

  isFavoriteLicitacion: (licitacionId) =>
    get().favoriteLicitaciones.some((item) => item.id === licitacionId),

  clearAll: () => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(FAVORITES_LICITACIONES_KEY);
    } catch {
      /* noop */
    }
    set({ favorites: [], favoriteLicitaciones: [] });
  },

  loadFromStorage: () => {
    try {
      const favorites = localStorage.getItem(FAVORITES_KEY);
      const favoriteLicitaciones = localStorage.getItem(FAVORITES_LICITACIONES_KEY);
      if (favorites) set({ favorites: JSON.parse(favorites) as FavoriteArticle[] });
      if (favoriteLicitaciones) {
        set({ favoriteLicitaciones: JSON.parse(favoriteLicitaciones) as FavoriteLicitacion[] });
      }
    } catch {
      set({ favorites: [], favoriteLicitaciones: [] });
    }
  },
}));
