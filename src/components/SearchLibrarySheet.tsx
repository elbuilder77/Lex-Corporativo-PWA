import { useState } from 'react';
import { BookMarked, Clock3, ExternalLink, Heart, RotateCcw, Trash2, X } from 'lucide-react';
import { useSearchStore, type SearchHistoryItem } from '../store/useSearchStore';

interface SearchLibrarySheetProps {
  open: boolean;
  onClose: () => void;
  onRepeat: (item: SearchHistoryItem) => void;
}

export function SearchLibrarySheet({ open, onClose, onRepeat }: SearchLibrarySheetProps) {
  const [tab, setTab] = useState<'history' | 'favorites'>('history');
  const { history, favorites, removeFromHistory, clearHistory, removeFromFavorites, clearFavorites } = useSearchStore();

  if (!open) return null;
  const empty = tab === 'history' ? history.length === 0 : favorites.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 sm:items-center sm:p-4" onClick={onClose}>
      <section aria-modal="true" role="dialog" aria-label="Guardados" className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><BookMarked size={20} /></span><div><h2 className="text-sm font-extrabold text-slate-950">Guardados</h2><p className="text-[11px] text-slate-500">Sólo en este navegador</p></div></div>
          <button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Cerrar"><X size={19} /></button>
        </header>

        <div className="grid grid-cols-2 bg-slate-100 p-1">
          <button type="button" onClick={() => setTab('history')} className={`min-h-11 rounded-lg text-xs font-bold ${tab === 'history' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Historial ({history.length})</button>
          <button type="button" onClick={() => setTab('favorites')} className={`min-h-11 rounded-lg text-xs font-bold ${tab === 'favorites' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Favoritos ({favorites.length})</button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!empty && <div className="flex justify-end"><button type="button" onClick={tab === 'history' ? clearHistory : clearFavorites} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={15} /> Limpiar</button></div>}

          {empty && <div className="py-12 text-center"><Heart className="mx-auto text-slate-300" size={32} /><p className="mt-3 text-sm font-bold text-slate-800">Nada guardado todavía</p><p className="mt-1 text-xs text-slate-500">Tus consultas y artículos favoritos aparecerán aquí.</p></div>}

          {tab === 'history' && history.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-extrabold text-slate-950">“{item.query}”</p>
              <p className="mt-1 text-[11px] text-slate-500">{item.scopeLabel} · {item.resultCount} resultados</p>
              <div className="mt-3 flex items-center justify-between gap-2"><span className="inline-flex items-center gap-1 text-[10px] text-slate-400"><Clock3 size={12} /> {new Date(item.timestamp).toLocaleDateString('es-MX')}</span><div className="flex gap-1"><button type="button" onClick={() => onRepeat(item)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white"><RotateCcw size={14} /> Repetir</button><button type="button" onClick={() => removeFromHistory(item.id)} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar"><Trash2 size={16} /></button></div></div>
            </article>
          ))}

          {tab === 'favorites' && favorites.map(({ article }) => (
            <article key={article.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold text-blue-700">{article.lawCode} · {article.articleNumber}</p><h3 className="mt-1 text-sm font-extrabold text-slate-950">{article.lawName}</h3></div><button type="button" onClick={() => removeFromFavorites(article.id)} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50" aria-label="Quitar de favoritos"><Heart size={17} fill="currentColor" /></button></div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{article.content}</p>
              <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-blue-700"><ExternalLink size={14} /> Fuente oficial</a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
