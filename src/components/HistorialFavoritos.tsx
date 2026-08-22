import React, { useEffect, useState } from 'react';
import {
  History,
  Star,
  Trash2,
  Clock,
  ArrowRight,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { useSearchStore } from '../store/useSearchStore';
import { useUiStore } from '../store/useUiStore';
import { useCaseStore } from '../store/useCaseStore';
import { navigate } from '../lib/router';
import { HistorySkeleton, CaseSkeleton } from './ui/Skeleton';
import type { LegalArticle } from '../types';

export const HistorialFavoritos: React.FC = () => {
  const { notify } = useUiStore();
  const { history, favorites, removeFromHistory, clearHistory, removeFromFavorites, loadFromStorage } = useSearchStore();
  const { cases: savedCases, loadCases, loadCaseById, deleteCaseById } = useCaseStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
    loadCases().finally(() => setIsLoading(false));
  }, [loadFromStorage, loadCases]);

  const handleOpenHistorySearch = (item: { query: string; lawCode: string }) => {
    navigate(`/buscador?query=${encodeURIComponent(item.query)}&law=${item.lawCode}`);
  };

  const handleOpenFavorite = (article: LegalArticle) => {
    navigate(`/buscador?article=${article.id}&law=${article.lawCode}`);
  };

  const handleDeleteCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Deseas eliminar este documento guardado de tu Bóveda local?')) {
      await deleteCaseById(id);
      notify('Documento eliminado.', 'info');
    }
  };

  const handleOpenCase = async (id: string) => {
    await loadCaseById(id);
    notify('Documento cargado.', 'info');
    navigate('/buscador');
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600">
              <History size={22} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-950">Historial & Favoritos</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Búsquedas recientes y artículos guardados
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Limpiar todo el historial de búsquedas?')) clearHistory();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Limpiar historial</span>
            </button>
          )}
        </div>

        {/* Favoritos */}
        {isLoading ? (
          <HistorySkeleton />
        ) : favorites.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Star size={14} fill="currentColor" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Artículos favoritos ({favorites.length})
                </h3>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleOpenFavorite(fav.article)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-amber-400 transition space-y-3 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0 rounded-lg bg-amber-500/10 text-amber-600 font-mono px-2.5 py-1 text-xs font-extrabold">
                        {fav.article.articleNumber}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[200px]">
                          {fav.article.title}
                        </h3>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                          {fav.article.lawCode}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(fav.id);
                        notify('Eliminado de favoritos', 'info');
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                      title="Quitar de favoritos"
                    >
                      <Star size={14} fill="currentColor" className="text-amber-400 group-hover:text-red-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(fav.savedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 group-hover:text-amber-500 font-semibold transition">
                      Abrir <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial de Búsquedas */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <History size={14} />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Búsquedas recientes ({history.length})
                </h3>
              </div>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenHistorySearch(item)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center justify-between gap-3 hover:border-blue-300 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <Search size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{item.query}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {item.lawCode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.resultCount} resultados
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                      title="Eliminar del historial"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Documentos guardados (Bóveda) */}
        {isLoading ? (
          <CaseSkeleton />
        ) : savedCases.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FileText size={14} />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Documentos en Bóveda ({savedCases.length})
                </h3>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleOpenCase(c.id)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-400 transition space-y-3 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <FileText size={16} />
                      </span>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[200px]">
                          {c.title}
                        </h3>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                          {c.area}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCase(c.id, e)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                      title="Eliminar documento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 group-hover:text-emerald-500 font-semibold transition">
                      Abrir <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!isLoading && history.length === 0 && favorites.length === 0 && savedCases.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
              <History size={28} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Sin actividad aún</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tus búsquedas, artículos favoritos y documentos guardados aparecerán aquí.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buscador')}
              className="inline-flex items-center gap-2 rounded-xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 font-bold px-4 py-2 text-xs transition shadow-xs cursor-pointer mx-auto"
            >
              <Search size={14} />
              <span>Ir al Buscador</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};