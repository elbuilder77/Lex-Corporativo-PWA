import { BookOpenCheck, ExternalLink, Info, ShieldCheck, Trash2, WifiOff, X } from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import { CORPUS_STATS, OFFICIAL_LAWS_URL, OFFICIAL_REGULATIONS_URL } from '../lib/corpus-catalog';
import { useSearchStore } from '../store/useSearchStore';
import { useUiStore } from '../store/useUiStore';

interface SearchInfoSheetProps { open: boolean; onClose: () => void; }

export function SearchInfoSheet({ open, onClose }: SearchInfoSheetProps) {
  const { history, favorites, clearAll } = useSearchStore();
  const { isOnline, notify } = useUiStore();
  if (!open) return null;

  const clearData = () => {
    if (!window.confirm('¿Eliminar el historial y todos los favoritos de este navegador?')) return;
    clearAll();
    notify('Datos locales eliminados.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 sm:items-center sm:p-4" onClick={onClose}>
      <section aria-modal="true" role="dialog" aria-label="Información" className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-slate-200 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Info size={20} /></span><div><h2 className="text-sm font-extrabold text-slate-950">Acerca de Lex Corporativo</h2><p className="text-[11px] text-slate-500">Consulta federal con fuentes oficiales</p></div></div><button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Cerrar"><X size={19} /></button></header>
        <div className="space-y-4 overflow-y-auto p-4">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-extrabold text-slate-950"><BookOpenCheck size={18} className="text-legal-golddark" /> Legislación disponible</div><p className="mt-2 text-xs leading-5 text-slate-600">{CORPUS_STATS.provisions.toLocaleString('es-MX')} artículos y disposiciones de {CORPUS_STATS.instruments} leyes y reglamentos, organizados en {CORPUS_STATS.areas} áreas.</p></div>
          <div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">{isOnline ? <ShieldCheck size={18} className="text-emerald-600" /> : <WifiOff size={18} className="text-amber-600" />} Tu consulta es privada</div><p className="mt-2 text-xs leading-5 text-slate-600">Las búsquedas se realizan en este dispositivo. Tu historial y tus favoritos también permanecen aquí.</p><button type="button" onClick={clearData} disabled={!history.length && !favorites.length} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 size={15} /> Borrar mis datos</button></div>
          <div className="grid gap-2 sm:grid-cols-2"><a href={OFFICIAL_LAWS_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-xs font-bold text-blue-700">Leyes Federales <ExternalLink size={14} /></a><a href={OFFICIAL_REGULATIONS_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-xs font-bold text-blue-700">Reglamentos <ExternalLink size={14} /></a></div>
          <div className="rounded-2xl border border-legal-gold/20 bg-legal-shell p-4 text-white">
            <div className="flex items-start gap-3">
              <img src={logoMark} alt="" className="h-12 w-12 shrink-0 rounded-xl border border-legal-gold/20 object-cover" />
              <div><h3 className="font-serif text-base font-bold">Lex Corporativo Desktop</h3><p className="mt-1 text-xs leading-5 text-slate-300">El espacio profesional para organizar asuntos, trabajar documentos y profundizar en el análisis jurídico. Actualmente en desarrollo.</p></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
