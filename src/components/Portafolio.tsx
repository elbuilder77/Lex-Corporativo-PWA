import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Trash2,
  Clock,
  ArrowRight,
  FileSignature,
  Plus,
} from 'lucide-react';
import { useCaseStore } from '../store/useCaseStore';
import { useUiStore } from '../store/useUiStore';

export const Portafolio: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useUiStore();
  const { cases, loadCases, loadCaseById, deleteCaseById, resetDraft } = useCaseStore();

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  const handleOpenCase = async (id: string) => {
    await loadCaseById(id);
    notify('Documento cargado en el Redactor.', 'info');
    navigate('/redactor');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Deseas eliminar este documento guardado de tu Bóveda local?')) {
      await deleteCaseById(id);
      notify('Documento eliminado.', 'info');
    }
  };

  const handleCreateNew = () => {
    resetDraft();
    navigate('/redactor');
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600">
              <FolderOpen size={22} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-950">Portafolio & Bóveda Local</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Historial de contratos y documentos jurídicos guardados en tu dispositivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={14} className="text-legal-gold" />
            <span className="hidden sm:inline">Nuevo Documento</span>
          </button>
        </div>

        {/* Lista de Casos */}
        {cases.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">No hay documentos guardados</h3>
              <p className="text-xs text-slate-500 mt-1">
                Los contratos y escritos redactados que guardes aparecerán aquí.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 rounded-xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 font-bold px-4 py-2 text-xs transition shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Iniciar nuevo documento</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => handleOpenCase(c.id)}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-legal-gold transition space-y-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <FileSignature size={16} />
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
                    onClick={(e) => handleDelete(c.id, e)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition cursor-pointer"
                    title="Eliminar caso"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700 group-hover:text-legal-gold font-semibold transition">
                    Abrir <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
