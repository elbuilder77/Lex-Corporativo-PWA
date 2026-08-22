import React, { useState } from 'react';
import {
  FileSignature,
  Sparkles,
  Download,
  Share2,
  Save,
  Loader2,
  Eye,
  Edit3,
  FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCaseStore } from '../store/useCaseStore';
import { useUiStore } from '../store/useUiStore';
import { useAuthStore } from '../store/useAuthStore';
import { draftLegalDocument } from '../services/ai';
import { exportDocumentToPDF, exportDocumentToDocx } from '../services/document-export';
import type { LegalEngineeringArea } from '../types';

interface TemplateItem {
  id: string;
  title: string;
  area: LegalEngineeringArea;
  description: string;
  body: string;
}

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    id: 'laboral_indeterminado',
    title: 'Contrato Individual de Trabajo (Tiempo Indeterminado)',
    area: 'laboral',
    description: 'Conforme a los Arts. 20, 25 y 47 de la Ley Federal del Trabajo.',
    body: `# CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDETERMINADO

CONTRATO INDIVIDUAL DE TRABAJO QUE CELEBRAN POR UNA PARTE **[NOMBRE DEL PATRÓN O RAZÓN SOCIAL]**, REPRESENTADA POR **[REPRESENTANTE LEGAL]**, EN LO SUCESIVO EL "PATRÓN", Y POR OTRA PARTE **[NOMBRE DEL TRABAJADOR]**, EN LO SUCESIVO EL "TRABAJADOR", AL TENOR DE LAS SIGUIENTES DECLARACIONES Y CLÁUSULAS:

## DECLARACIONES

I. Declara el **PATRÓN**:
a) Ser una sociedad legalmente constituida conforme a las leyes de la República Mexicana.
b) Tener su domicilio fiscal y laboral ubicado en [DOMICILIO DEL PATRÓN].
c) Requerir los servicios de una persona calificada para desempeñar el puesto de [PUESTO/CATEGORÍA].

II. Declara el **TRABAJADOR**:
a) Ser de nacionalidad mexicana, mayor de edad, con RFC [RFC] y CURP [CURP].
b) Tener su domicilio particular en [DOMICILIO DEL TRABAJADOR].
c) Tener la capacidad y conocimientos necesarios para desempeñar el puesto solicitado.

## CLÁUSULAS

**PRIMERA. OBJETO Y PUESTO.** El TRABAJADOR se obliga a prestar sus servicios personales subordinados al PATRÓN consistentes en [DESCRIPCIÓN DE FUNCIONES].

**SEGUNDA. JORNADA DE TRABAJO.** La jornada será de carácter [DIURNA/MIXTA/NOCTURNA], con un horario de [HORARIO], contando con [MINUTOS] minutos para descanso y alimentos, conforme a los artículos 59 a 68 de la Ley Federal del Trabajo.

**TERCERA. SALARIO Y PAGO.** El TRABAJADOR percibirá un salario diario de $[MONTO] pesos ([MONTO CON LETRA]), pagadero de forma [SEMANAL/QUINCENAL], más las prestaciones de ley.

**CUARTA. PRESTACIONES DE LEY.** El PATRÓN otorgará al TRABAJADOR aguinaldo anual mínimo de 15 días (Art. 87 LFT), vacaciones y prima vacacional del 25% conforme al Art. 76 y 80 de la LFT.

**QUINTA. RESCISIÓN.** Son causas de rescisión de este contrato sin responsabilidad para las partes las establecidas en los artículos 47 y 51 de la Ley Federal del Trabajo.

Leído que fue por ambas partes, se firma en dos ejemplares en la Ciudad de [CIUDAD], el día [FECHA].

__________________________                  __________________________
EL PATRÓN                                   EL TRABAJADOR`,
  },
  {
    id: 'mercantil_compraventa',
    title: 'Contrato de Compraventa Mercantil',
    area: 'mercantil',
    description: 'Conforme a los Arts. 75, 371 y 376 del Código de Comercio.',
    body: `# CONTRATO DE COMPRAVENTA MERCANTIL

CONTRATO DE COMPRAVENTA MERCANTIL QUE CELEBRAN POR UNA PARTE **[NOMBRE DEL VENDEDOR]**, EN LO SUCESIVO EL "VENDEDOR", Y POR OTRA PARTE **[NOMBRE DEL COMPRADOR]**, EN LO SUCESIVO EL "COMPRADOR", AL TENOR DE LO SIGUIENTE:

## DECLARACIONES
I. Declara el VENDEDOR ser propietario legítimo de las mercancías consistentes en [DESCRIPCIÓN DE MERCANCÍAS O BIENES].
II. Declara el COMPRADOR tener el interés y la capacidad económica para adquirir dichas mercancías.

## CLÁUSULAS
**PRIMERA. OBJETO.** El VENDEDOR vende y el COMPRADOR adquiere libre de todo gravamen las mercancías antes descritas.
**SEGUNDA. PRECIO.** El precio pactado es de $[MONTO] M.N., más el Impuesto al Valor Agregado aplicable.
**TERCERA. ENTREGA Y RIESGO.** La entrega de los bienes se realizará en [LUGAR DE ENTREGA], transmitiéndose el riesgo de conformidad con el artículo 377 del Código de Comercio.
**CUARTA. JURISDICCIÓN.** Para la interpretación y cumplimiento, las partes se someten a los Tribunales competentes de [CIUDAD], renunciando a cualquier otro fuero.

Suscrito en [CIUDAD], a los [DÍA] días de [MES] de [AÑO].

__________________________                  __________________________
VENDEDOR                                    COMPRADOR`,
  },
  {
    id: 'mercantil_pagare',
    title: 'Pagaré Mercantil Ejecutivo',
    area: 'mercantil',
    description: 'Conforme al Art. 170 de la Ley General de Títulos y Operaciones de Crédito.',
    body: `# PAGARÉ MERCANTIL

**PAGARÉ NÚMERO:** 01/01
**BUENO POR:** $[MONTO] M.N.
**LUGAR Y FECHA DE SUSCRIPCIÓN:** [CIUDAD], a [FECHA]

Debo y pagaré incondicionalmente por este Pagaré a la orden de **[NOMBRE DEL ACREEDOR/BENEFICIARIO]**, en el domicilio ubicado en [DOMICILIO DE PAGO], el día **[FECHA DE VENCIMIENTO]**, la cantidad de:

**$[MONTO] PESOS ([MONTO EN LETRA] M.N.)**

Valor recibido a mi entera satisfacción. Desde la fecha de vencimiento hasta el día de su liquidación total, este pagaré causará un interés moratorio del [TASA]% mensual, pagadero juntamente con el principal.

El presente pagaré se rige por la Ley General de Títulos y Operaciones de Crédito en sus artículos 170 al 174 y demás relativos.

**DATOS DEL SUSCRIPTOR / DEUDOR:**
Nombre: [NOMBRE DEL DEUDOR]
Domicilio: [DOMICILIO]
RFC / Teléfono: [DATOS]

____________________________________
FIRMA DEL SUSCRIPTOR`,
  },
];

export const DraftingWorkspace: React.FC = () => {
  const { notify } = useUiStore();
  const { isConfigured, setShowTutorialModal } = useAuthStore();
  const {
    draftContent,
    draftTitle,
    activeArea,
    setDraftContent,
    setDraftTitle,
    setActiveArea,
    saveCurrentCase,
  } = useCaseStore();

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [requirements, setRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTemplates = DEFAULT_TEMPLATES.filter((t) => t.area === activeArea || activeArea === 'mercantil');

  const handleSelectTemplate = (t: TemplateItem) => {
    setSelectedTemplate(t);
    setDraftTitle(t.title);
    setDraftContent(t.body);
    notify(`Plantilla "${t.title}" cargada en el editor.`, 'info');
  };

  const handleGenerateWithAi = async () => {
    if (!requirements.trim()) {
      notify('Por favor escribe los requerimientos o ajustes que deseas aplicar al documento.', 'warning');
      return;
    }

    if (!isConfigured) {
      setShowTutorialModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await draftLegalDocument({
        requirements,
        area: activeArea,
        templateBody: draftContent || selectedTemplate?.body,
      });

      setDraftContent(generated);
      setViewMode('preview');
      notify('Documento jurídico redactado y fundamentado con éxito.', 'success');
    } catch (err: any) {
      notify(err?.message || 'Error al generar el documento con IA.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToVault = async () => {
    setIsSaving(true);
    try {
      await saveCurrentCase();
      notify('Caso guardado en tu Bóveda local.', 'success');
    } catch {
      notify('Error al guardar en la base de datos local.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (!draftContent.trim()) {
      notify('El documento está vacío.', 'warning');
      return;
    }
    exportDocumentToPDF(draftTitle || 'Documento_Juridico', draftContent);
    notify('PDF formal generado y descargado.', 'success');
  };

  const handleExportDocx = async () => {
    if (!draftContent.trim()) {
      notify('El documento está vacío.', 'warning');
      return;
    }
    await exportDocumentToDocx(draftTitle || 'Documento_Juridico', draftContent);
    notify('Documento Word (.docx) descargado.', 'success');
  };

  const handleShare = async () => {
    if (!draftContent.trim()) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: draftTitle,
          text: draftContent,
        });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(draftContent);
      notify('Texto legal copiado al portapapeles.', 'success');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Top Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-legal-gold/30 bg-legal-gold/10 text-legal-gold">
              <FileSignature size={22} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-950">Redactor & Plantillas</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Edición rápida de contratos y actas con fundamentación jurídica aplicable
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleSaveToVault}
              disabled={isSaving || !draftContent.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Save size={14} className="text-legal-gold" />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download size={14} className="text-legal-gold" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportDocx}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <FileText size={14} className="text-blue-400" />
              <span>Word</span>
            </button>
          </div>
        </div>

        {/* Selector de Materias */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {(['laboral', 'mercantil', 'fiscal', 'aduanal', 'comercio_exterior'] as LegalEngineeringArea[]).map((area) => {
            const active = area === activeArea;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setActiveArea(area)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition capitalize cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {area.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {/* Carrusel / Lista de Plantillas Rápidas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Plantillas oficiales sugeridas:
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {filteredTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-legal-gold hover:shadow-xs transition space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate">{t.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Zona de Redacción & Asistente IA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Instrucciones / Datos para adaptar el documento con fundamentación legal:
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Ej: Modifica las partes, fija salario de $25,000 mensuales con jornada de lunes a viernes y fundamenta la rescisión conforme a la LFT."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-legal-gold focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 px-4 py-2 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>Fundamentar y Redactar con IA</span>
              </button>

              {/* Toggle Editor / Hoja Membretada */}
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Edit3 size={13} />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Eye size={13} />
                  <span>Hoja Formal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lienzo Documental */}
          {viewMode === 'editor' ? (
            <div className="space-y-2">
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 focus:border-legal-gold focus:outline-none"
                placeholder="Título del documento..."
              />
              <textarea
                rows={16}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="El contenido del documento legal aparecerá aquí..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs text-slate-800 leading-relaxed focus:border-legal-gold focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6 overflow-x-auto">
              <div className="mx-auto max-w-2xl bg-white p-6 sm:p-10 shadow-md legal-letterhead min-h-[500px]">
                <div className="border-b border-legal-gold/40 pb-2 mb-6 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Lex Corporativo</p>
                  <h2 className="font-serif font-bold text-base text-slate-900 uppercase mt-1">{draftTitle}</h2>
                </div>
                <div className="prose-legal text-xs leading-relaxed text-slate-800">
                  <ReactMarkdown>{draftContent || '*El documento está vacío.*'}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
