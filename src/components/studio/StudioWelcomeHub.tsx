import { BookOpen, FilePlus2, FolderOpen, Sparkles, Upload, X } from 'lucide-react';
import type { StudioDocument } from '../../types';

interface StudioWelcomeHubProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCatalog: () => void;
  onSelectBlank: () => void;
  onTriggerImport: () => void;
  recentDraft: StudioDocument | null;
  onOpenDraft: (doc: StudioDocument) => void;
}

export function StudioWelcomeHub({
  isOpen,
  onClose,
  onOpenCatalog,
  onSelectBlank,
  onTriggerImport,
  recentDraft,
  onOpenDraft,
}: StudioWelcomeHubProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Inicio de Estudio Jurídico"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl animate-slideUp sm:animate-fadeIn">
        {/* Mobile Handle */}
        <div className="flex justify-center pb-0 pt-2.5 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-legal-gold shadow-md">
              <Sparkles size={22} />
            </span>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-950">
                Estudio Jurídico & Redacción
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona cómo deseas comenzar tu documento legal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="studio-icon-button"
            aria-label="Cerrar inicio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          {recentDraft && (
            <div className="rounded-2xl border-2 border-legal-gold/40 bg-amber-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 shrink-0">
                  <FolderOpen size={20} />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-legal-golddark">
                    Continuar Borrador Activo
                  </span>
                  <h3 className="text-sm font-bold text-slate-950 truncate max-w-md">
                    {recentDraft.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Última actualización: {new Date(recentDraft.updatedAt).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenDraft(recentDraft);
                  onClose();
                }}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-amber-300 hover:bg-slate-800 active:scale-95 transition shadow-xs cursor-pointer"
              >
                Abrir Borrador →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Template Catalog */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCatalog();
              }}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-legal-gold hover:shadow-md active:scale-98 cursor-pointer"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-legal-gold group-hover:bg-legal-gold group-hover:text-slate-950 transition">
                  <BookOpen size={20} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-950 group-hover:text-legal-golddark transition">
                  Plantilla Jurídica
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Pagarés, contratos mercantiles, laborales y actas con asistente de variables.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center text-xs font-extrabold text-legal-golddark group-hover:underline">
                Explorar Catálogo →
              </span>
            </button>

            {/* Card 2: Upload Own Document */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onTriggerImport();
              }}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-400 hover:shadow-md active:scale-98 cursor-pointer"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Upload size={20} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-950 group-hover:text-blue-600 transition">
                  Subir Documento
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Importa un archivo .docx, .pdf o .txt para auditarlo y fundamentar sus cláusulas.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center text-xs font-extrabold text-blue-600 group-hover:underline">
                Cargar Archivo →
              </span>
            </button>

            {/* Card 3: Blank Canvas */}
            <button
              type="button"
              onClick={() => {
                onSelectBlank();
                onClose();
              }}
              className="group flex flex-col justify-between rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-left transition hover:border-slate-400 hover:bg-slate-50/80 active:scale-98 cursor-pointer"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition">
                  <FilePlus2 size={20} />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-950">
                  Lienzo en Blanco
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Comienza desde cero en hoja membretada con el asistente SQLite WASM.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center text-xs font-extrabold text-slate-700 group-hover:underline">
                Iniciar en Blanco →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
