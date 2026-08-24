import { useState } from 'react';
import {
  BookMarked,
  Building2,
  Calendar,
  Clock3,
  ExternalLink,
  Heart,
  Landmark,
  Scale,
  Trash2,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining, MATERIA_LABELS } from '../lib/licitaciones-catalog';
import { useSearchStore } from '../store/useSearchStore';

interface SearchLibrarySheetProps {
  open: boolean;
  onClose: () => void;
}

export function SearchLibrarySheet({ open, onClose }: SearchLibrarySheetProps) {
  const [tab, setTab] = useState<'articles' | 'licitaciones'>('articles');
  const [confirmClear, setConfirmClear] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);

  const {
    favorites,
    favoriteLicitaciones,
    removeFromFavorites,
    clearFavorites,
    removeFromFavoriteLicitaciones,
    clearFavoriteLicitaciones,
  } = useSearchStore();

  if (!open) return null;

  const empty = tab === 'articles' ? favorites.length === 0 : favoriteLicitaciones.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 sm:items-center sm:p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-label="Guardados"
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl transition-transform"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(e) => setDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => {
          if (dragStart === null) return;
          const delta = e.touches[0].clientY - dragStart;
          if (delta > 0) setDragDelta(delta);
        }}
        onTouchEnd={() => {
          if (dragDelta > 80) onClose();
          setDragStart(null);
          setDragDelta(0);
        }}
        style={dragDelta > 0 ? { transform: `translateY(${dragDelta}px)`, transition: 'none' } : {}}
      >
        {/* Drag handle - mobile only */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-0 shrink-0">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        <header className="flex items-center justify-between border-b border-slate-200 p-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BookMarked size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-950">Portafolio de Guardados</h2>
              <p className="text-[11px] text-slate-500">Almacenado localmente en este dispositivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 shrink-0">
          <button
            type="button"
            onClick={() => { setTab('articles'); setConfirmClear(false); }}
            className={`flex items-center justify-center gap-2 min-h-11 rounded-lg text-xs font-bold transition ${
              tab === 'articles' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale size={15} />
            <span>Artículos ({favorites.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('licitaciones'); setConfirmClear(false); }}
            className={`flex items-center justify-center gap-2 min-h-11 rounded-lg text-xs font-bold transition ${
              tab === 'licitaciones' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Landmark size={15} />
            <span>Licitaciones ({favoriteLicitaciones.length})</span>
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {/* Destructive action — with inline confirmation */}
          {!empty && (
            <div className="flex justify-end">
              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <Trash2 size={14} /> Borrar todos
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-xs font-bold text-red-600">
                    ¿Eliminar {tab === 'articles' ? 'artículos' : 'licitaciones'} guardados?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (tab === 'articles') clearFavorites();
                      else clearFavoriteLicitaciones();
                      setConfirmClear(false);
                    }}
                    className="inline-flex min-h-8 items-center rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="inline-flex min-h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State with navigation CTA */}
          {empty && (
            <div className="py-10 text-center">
              <Heart className="mx-auto text-slate-300" size={32} />
              <p className="mt-3 text-sm font-bold text-slate-800">
                {tab === 'articles' ? 'Sin artículos guardados' : 'Sin licitaciones en seguimiento'}
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {tab === 'articles'
                  ? 'Guarda artículos de leyes y reglamentos para consultarlos rápidamente sin conexión.'
                  : 'Guarda convocatorias y procedimientos de CompraNet para monitorear sus fechas de cierre.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95"
              >
                {tab === 'articles' ? 'Buscar legislación' : 'Explorar licitaciones'}
              </button>
            </div>
          )}

          {/* Tab 1: Saved Legal Articles */}
          {tab === 'articles' &&
            favorites.map(({ article }) => (
              <article key={article.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-extrabold text-white">
                        {article.lawCode}
                      </span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {article.articleNumber}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-extrabold text-slate-950">{article.lawName}</h3>
                    {article.title && <p className="text-xs font-medium text-slate-500">{article.title}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromFavorites(article.id)}
                    className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50"
                    aria-label="Quitar de favoritos"
                    title="Quitar de favoritos"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600 whitespace-pre-line">
                  {article.content}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    <ExternalLink size={13} /> {article.sourceName}
                  </a>
                </div>
              </article>
            ))}

          {/* Tab 2: Saved Licitaciones */}
          {tab === 'licitaciones' &&
            favoriteLicitaciones.map(({ licitacion }) => {
              const daysInfo = getDaysRemaining(licitacion.fechaLimitePropuestas);
              return (
                <article
                  key={licitacion.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-extrabold text-white">
                          {licitacion.siglasConvocante}
                        </span>
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900 border border-amber-200">
                          {licitacion.numeroProcedimiento}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                          {MATERIA_LABELS[licitacion.materia]}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-extrabold text-slate-950 leading-snug">
                        {licitacion.titulo}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <Building2 size={13} className="shrink-0" />
                        <span>{licitacion.convocante}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromFavoriteLicitaciones(licitacion.id)}
                      className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50"
                      aria-label="Quitar de seguimiento"
                      title="Quitar de seguimiento"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Límite: {formatDate(licitacion.fechaLimitePropuestas)}</span>
                      </div>
                      {licitacion.montoEstimado && (
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {formatCurrency(licitacion.montoEstimado, licitacion.moneda)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          daysInfo.badgeStyle === 'urgent'
                            ? 'bg-red-50 text-red-700'
                            : daysInfo.badgeStyle === 'warning'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        <Clock3 size={11} /> {daysInfo.label}
                      </span>
                      <a
                        href={licitacion.enlaceCompraNet}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-legal-gold px-3 text-xs font-bold text-slate-950 hover:bg-legal-goldhover"
                      >
                        ComprasMX <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </div>
  );
}
