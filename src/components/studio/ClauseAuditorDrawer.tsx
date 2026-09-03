import { useMemo } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, FileCheck, ShieldAlert, Sparkles, X } from 'lucide-react';
import type { LegalCitation } from '../../types';

export interface AuditRule {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  suggestedLawCode: string;
  suggestedArticle: string;
  explanation: string;
  searchQuery: string;
}

const MEXICAN_LEGAL_RULES: AuditRule[] = [
  {
    id: 'pagare_requisitos',
    name: 'Requisitos de Validez del Pagaré',
    category: 'Mercantil',
    keywords: ['pagaré', 'pagare', 'pagaré incondicionalmente', 'a la orden de', 'suscriptor'],
    suggestedLawCode: 'LGTOC',
    suggestedArticle: 'Art. 170',
    explanation: 'El pagaré debe contener mención expresa de ser pagaré y la promesa incondicional de pagar una suma determinada.',
    searchQuery: 'Articulo 170 pagaré promesa incondicional',
  },
  {
    id: 'intereses_moratorios',
    name: 'Intereses Moratorios y Pacto de Interés',
    category: 'Mercantil',
    keywords: ['moratorio', 'interés moratorio', 'intereses moratorios', 'tasa de interés', 'usura'],
    suggestedLawCode: 'CCom',
    suggestedArticle: 'Art. 362',
    explanation: 'Los deudores que demoren el pago de sus deudas deben satisfacer desde el día siguiente al vencimiento el interés pactado o el legal.',
    searchQuery: 'Articulo 362 préstamos mercantiles interés demora',
  },
  {
    id: 'jurisdiccion_expresa',
    name: 'Sumisión Expresa a Tribunales',
    category: 'Procesal Mercantil',
    keywords: ['jurisdicción', 'jurisdiccion', 'tribunales competentes', 'sumisión expresa', 'fuero'],
    suggestedLawCode: 'CCom',
    suggestedArticle: 'Art. 1093',
    explanation: 'La sumisión es expresa cuando los interesados renuncian formalmente al fuero de su domicilio y designan tribunal competente.',
    searchQuery: 'Articulo 1093 sumision expresa tribunales fuero',
  },
  {
    id: 'clausula_penal',
    name: 'Cláusula Penal por Incumplimiento',
    category: 'Civil / Contratos',
    keywords: ['pena convencional', 'cláusula penal', 'penalización', 'en caso de incumplimiento pagará'],
    suggestedLawCode: 'CCF',
    suggestedArticle: 'Art. 1840',
    explanation: 'Pueden los contratantes estipular cierta prestación como pena para el caso de que la obligación no se cumpla.',
    searchQuery: 'Articulo 1840 clausula penal prestacion incumplimiento',
  },
  {
    id: 'rescision_laboral',
    name: 'Causales de Rescisión Laboral',
    category: 'Laboral',
    keywords: ['rescisión', 'rescision laboral', 'sin responsabilidad para el patrón', 'despido justificado'],
    suggestedLawCode: 'LFT',
    suggestedArticle: 'Art. 47',
    explanation: 'Las causas de rescisión de la relación de trabajo sin responsabilidad patronal exigen aviso escrito motivado.',
    searchQuery: 'Articulo 47 rescision relacion de trabajo patron',
  },
  {
    id: 'comprobantes_fiscales',
    name: 'Obligación de Emisión de CFDI',
    category: 'Fiscal',
    keywords: ['cfdi', 'factura', 'facturación', 'comprobante fiscal', 'retención de iva', 'retencion'],
    suggestedLawCode: 'CFF',
    suggestedArticle: 'Art. 29',
    explanation: 'Los contribuyentes que deban expedir comprobantes fiscales por los actos que realicen deben emitir CFDI por internet.',
    searchQuery: 'Articulo 29 comprobantes fiscales digitales CFDI',
  },
  {
    id: 'confidencialidad_industrial',
    name: 'Secreto Industrial y Confidencialidad',
    category: 'Propiedad Intelectual',
    keywords: ['secreto industrial', 'información confidencial', 'confidencialidad', 'no divulgación'],
    suggestedLawCode: 'LFPPI',
    suggestedArticle: 'Art. 163',
    explanation: 'Se considera secreto industrial a toda información de aplicación industrial o comercial de carácter confidencial.',
    searchQuery: 'Articulo 163 secreto industrial informacion confidencial',
  },
];

interface ClauseAuditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  citations: LegalCitation[];
  onQuickSearch: (query: string) => void;
}

export function ClauseAuditorDrawer({
  isOpen,
  onClose,
  documentText,
  citations,
  onQuickSearch,
}: ClauseAuditorDrawerProps) {
  const auditResults = useMemo(() => {
    const textLower = documentText.toLocaleLowerCase('es-MX');

    return MEXICAN_LEGAL_RULES.map((rule) => {
      const isDetected = rule.keywords.some((kw) => textLower.includes(kw.toLocaleLowerCase('es-MX')));
      const isFundamented = citations.some(
        (cit) =>
          cit.lawCode.toLocaleLowerCase('es-MX').includes(rule.suggestedLawCode.toLocaleLowerCase('es-MX')) ||
          cit.articleNumber.toLocaleLowerCase('es-MX').includes(rule.suggestedArticle.toLocaleLowerCase('es-MX')),
      );

      return {
        ...rule,
        isDetected,
        isFundamented,
      };
    });
  }, [documentText, citations]);

  const detectedClauses = useMemo(
    () => auditResults.filter((r) => r.isDetected),
    [auditResults],
  );

  const missingFundamentation = useMemo(
    () => detectedClauses.filter((r) => !r.isFundamented),
    [detectedClauses],
  );

  const score = useMemo(() => {
    if (detectedClauses.length === 0) return 100;
    const fundedCount = detectedClauses.filter((r) => r.isFundamented).length;
    return Math.round((fundedCount / detectedClauses.length) * 100);
  }, [detectedClauses]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Auditor de Fundamentación Legal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="font-serif text-base font-bold text-slate-950">Auditor de Fundamentación</h2>
              <p className="text-[11px] text-slate-500">Escaneo semántico de cláusulas legales</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="studio-icon-button"
            aria-label="Cerrar auditor"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score & Summary Banner */}
        <div className="border-b border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Salud de Fundamentación</span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${score === 100 ? 'text-emerald-700' : score > 50 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {score}%
                </span>
                <span className="text-xs text-slate-500">
                  ({detectedClauses.length - missingFundamentation.length} de {detectedClauses.length} cláusulas con sustento)
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                missingFundamentation.length === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {missingFundamentation.length === 0 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {missingFundamentation.length === 0 ? 'Óptimo' : `${missingFundamentation.length} Sugerencias`}
            </span>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                score === 100 ? 'bg-emerald-500' : score > 50 ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Clauses List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {detectedClauses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <FileCheck size={28} className="mx-auto text-slate-400" />
              <p className="mt-2 text-xs font-bold">No se detectaron cláusulas complejas en el texto actual.</p>
              <p className="mt-1 text-[11px] text-slate-400">
                A medida que redactes términos como pagaré, intereses, jurisdicción o finiquitos, el auditor te sugerirá los artículos aplicables.
              </p>
            </div>
          ) : (
            detectedClauses.map((rule) => (
              <div
                key={rule.id}
                className={`rounded-xl border p-3.5 text-left transition ${
                  rule.isFundamented
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-amber-200/90 bg-amber-50/40 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {rule.isFundamented ? (
                      <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                    ) : (
                      <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                    )}
                    <h3 className="text-xs font-bold text-slate-950">{rule.name}</h3>
                  </div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                    {rule.category}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                  {rule.explanation}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                  <span className="font-extrabold text-slate-900">
                    {rule.suggestedLawCode} · {rule.suggestedArticle}
                  </span>

                  {rule.isFundamented ? (
                    <span className="text-[10px] font-bold text-emerald-700">Fundamentada en notas ✅</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onQuickSearch(rule.searchQuery);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-legal-gold px-2.5 py-1 text-[10px] font-extrabold text-slate-950 transition hover:bg-legal-goldhover active:scale-95 shadow-xs"
                    >
                      <span>Fundamentar</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
