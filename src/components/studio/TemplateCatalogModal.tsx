import { useMemo, useState } from 'react';
import { BookOpen, Check, FilePlus2, Search, X } from 'lucide-react';
import { PWA_MODULE_CONFIG } from '../../lib/pwa-constants';
import type { LegalModule, LegalTemplate } from '../../types';

interface TemplateCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: LegalTemplate[];
  selectedTemplate: LegalTemplate | null;
  onSelectTemplate: (template: LegalTemplate) => void;
  onSelectBlank: () => void;
}

const MODULES: LegalModule[] = [
  'mercantil',
  'laboral',
  'fiscal',
  'comercio_exterior',
  'aduanal',
];

export function TemplateCatalogModal({
  isOpen,
  onClose,
  templates,
  selectedTemplate,
  onSelectTemplate,
  onSelectBlank,
}: TemplateCatalogModalProps) {
  const [search, setSearch] = useState('');
  const [activeModule, setActiveModule] = useState<LegalModule | 'all'>('all');

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-MX');
    return templates.filter((template) => {
      const moduleMatches = activeModule === 'all' || template.module === activeModule;
      const queryMatches =
        !query ||
        `${template.title} ${template.description} ${template.intentGroup}`
          .toLocaleLowerCase('es-MX')
          .includes(query);
      return moduleMatches && queryMatches;
    });
  }, [templates, activeModule, search]);

  const moduleCounts = useMemo(
    () =>
      templates.reduce<Record<string, number>>((counts, template) => {
        counts[template.module] = (counts[template.module] ?? 0) + 1;
        return counts;
      }, {}),
    [templates],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo de instrumentos y plantillas"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-dialog sm:rounded-2xl">
        {/* Mobile handle */}
        <div className="flex justify-center pb-0 pt-2.5 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-legal-gold">
              <BookOpen size={20} />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-950">Biblioteca de Instrumentos</h2>
              <p className="text-xs text-slate-500">
                Selecciona una plantilla o instrumento estructurado para tu redacción jurídica.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="studio-icon-button"
            aria-label="Cerrar catálogo"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search and Blank Option */}
        <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:px-6 sm:py-3">
          <label className="relative flex-1">
            <span className="sr-only">Buscar plantilla</span>
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por contrato, pagaré, acta, materia o palabras clave…"
              className="studio-input pl-10 text-base sm:text-xs"
              autoFocus
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onSelectBlank();
              onClose();
            }}
            className="studio-action shrink-0 border-dashed border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            <FilePlus2 size={16} /> Documento en blanco
          </button>
        </div>

        {/* Module Filter Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 px-6 py-2 gap-1.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveModule('all')}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
              activeModule === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            Todas las materias ({templates.length})
          </button>
          {MODULES.map((module) => (
            <button
              key={module}
              type="button"
              onClick={() => setActiveModule(module)}
              className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                activeModule === module
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>{PWA_MODULE_CONFIG[module].shortLabel}</span>
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] ${
                  activeModule === module ? 'bg-slate-800 text-amber-300' : 'bg-white text-slate-500'
                }`}
              >
                {moduleCounts[module] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[55vh]">
          {filteredTemplates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-sm font-semibold text-slate-600">No se encontraron instrumentos que coincidan con la búsqueda.</p>
              <p className="mt-1 text-xs text-slate-400">Intenta buscar con otros términos o cambia la materia seleccionada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTemplates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
                      isSelected
                        ? 'border-legal-gold bg-amber-50/60 shadow-md ring-2 ring-legal-gold/20'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {PWA_MODULE_CONFIG[template.module].shortLabel}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-legal-gold px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                            <Check size={12} /> Activa
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-extrabold text-slate-950">{template.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{template.description}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-400">
                      <span>{template.fields.length} variables dinámicas</span>
                      <span className="text-legal-golddark font-extrabold">Cargar instrumento →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
