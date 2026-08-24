import {
  BookOpenCheck,
  ExternalLink,
  Info,
  Landmark,
  ShieldCheck,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react';
import { CORPUS_STATS, OFFICIAL_LAWS_URL } from '../lib/corpus-catalog';
import { COMPRANET_GOB_URL, COMPRANET_PORTAL_URL, DATOS_ABIERTOS_URL, LICITACIONES_STATS } from '../lib/licitaciones-catalog';
import { useSearchStore } from '../store/useSearchStore';
import { useUiStore } from '../store/useUiStore';

interface SearchInfoSheetProps {
  open: boolean;
  onClose: () => void;
}

export function SearchInfoSheet({ open, onClose }: SearchInfoSheetProps) {
  const { favorites, favoriteLicitaciones, clearAll } = useSearchStore();
  const { isOnline, notify } = useUiStore();
  if (!open) return null;

  const totalSaved = favorites.length + favoriteLicitaciones.length;

  const clearData = () => {
    if (!window.confirm('¿Eliminar todos los artículos y licitaciones guardadas de este navegador?')) return;
    clearAll();
    notify('Artículos y licitaciones guardadas eliminados.', 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 sm:items-center sm:p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <section
        aria-modal="true"
        role="dialog"
        aria-label="Información"
        className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Info size={20} />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-950">Acerca de Lex Corporativo PWA</h2>
              <p className="text-[11px] text-slate-500">Servicios limpios de consulta jurídica y licitaciones públicas</p>
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

        <div className="space-y-4 overflow-y-auto p-4">
          {/* Service 1: Open Tenders CompraNet — first because protagonist */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
              <Landmark size={18} className="text-blue-700" /> Licitaciones CompraNet
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Catálogo de contrataciones públicas federales y estatales vigentes en México ({LICITACIONES_STATS.total} procedimientos activos en {LICITACIONES_STATS.convocantes} instituciones convocantes como IMSS, CFE, PEMEX, SICT, SAT, etc.), con fechas críticas, montos estimados, fundamento en LAASSP/LOPSRM y enlace oficial al expediente de CompraNet.
            </p>
          </div>

          {/* Service 2: Legal Legislation */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
              <BookOpenCheck size={18} className="text-legal-golddark" /> Buscador Normativo Federal
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Corpus local estructurado con {CORPUS_STATS.provisions.toLocaleString('es-MX')} disposiciones en{' '}
              {CORPUS_STATS.instruments} leyes y reglamentos federales (Laboral, Mercantil, Fiscal, Aduanal y Comercio Exterior),
              con motor SQLite WASM de alta velocidad y enlaces directos a la Cámara de Diputados.
            </p>
          </div>

          {/* Privacy & No History */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
              {isOnline ? (
                <ShieldCheck size={18} className="text-emerald-600" />
              ) : (
                <WifiOff size={18} className="text-amber-600" />
              )}
              <span>Consulta privada sin rastreo</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Esta aplicación no recopila historial de navegación, consultas frecuentes ni datos personales. Las búsquedas y los elementos guardados se conservan exclusivamente en tu dispositivo.
            </p>
            <button
              type="button"
              onClick={clearData}
              disabled={totalSaved === 0}
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40 transition"
            >
              <Trash2 size={15} /> Borrar guardados ({totalSaved})
            </button>
          </div>

          {/* Official External Links */}
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={COMPRANET_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-xs font-bold text-blue-700 hover:bg-slate-50 transition"
            >
              Portal ComprasMX (CompraNet) <ExternalLink size={14} />
            </a>
            <a
              href={COMPRANET_GOB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-xs font-bold text-blue-700 hover:bg-slate-50 transition"
            >
              Portal gob.mx/compranet <ExternalLink size={14} />
            </a>
            <a
              href={DATOS_ABIERTOS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-xs font-bold text-blue-700 hover:bg-slate-50 transition"
            >
              Datos Abiertos México <ExternalLink size={14} />
            </a>
            <a
              href={OFFICIAL_LAWS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 px-4 text-xs font-bold text-blue-700 hover:bg-slate-50 transition"
            >
              Leyes Federales <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
