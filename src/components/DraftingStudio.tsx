import { useEffect, useMemo, useRef, useState } from 'react';
import Handlebars from 'handlebars';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  ExternalLink,
  FilePenLine,
  FileText,
  FolderOpen,
  Library,
  List,
  LoaderCircle,
  Plus,
  Redo2,
  Search,
  ShieldCheck,
  Trash2,
  Undo2,
  Upload,
  WifiOff,
  X,
} from 'lucide-react';
import logoLockup from '../assets/logo-lockup-transparent.png';
import { PWA_MODULE_CONFIG } from '../lib/pwa-constants';
import { loadTemplateRegistry } from '../lib/template-registry';
import { deleteStudioDocument, listStudioDocuments, saveStudioDocument } from '../lib/studio-storage';
import { downloadTextCopy, exportPreservedDocxCopy, importUserDocument } from '../lib/document-import';
import { exportDocumentDocx } from '../lib/docx-export';
import { exportDocumentPdf } from '../lib/pdf-export';
import { executeCorpusSearch } from '../services/corpus-search';
import { useUiStore } from '../store/useUiStore';
import type {
  CorpusSearchScope,
  LegalArticle,
  LegalCitation,
  LegalModule,
  LegalTemplate,
  StudioDocument,
} from '../types';

const EMPTY_DOCUMENT: StudioDocument = {
  id: 'new-document',
  title: 'Documento sin título',
  sourceKind: 'blank',
  editorHtml: '<p>Comienza a redactar aquí.</p>',
  citations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MODULES: LegalModule[] = [
  'mercantil',
  'laboral',
  'fiscal',
  'comercio_exterior',
  'aduanal',
];

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const textToHtml = (value: string) =>
  value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');

const citationFromArticle = (article: LegalArticle): LegalCitation => ({
  id: crypto.randomUUID(),
  articleId: article.id,
  lawCode: article.lawCode,
  lawName: article.lawName,
  articleNumber: article.articleNumber,
  title: article.title,
  content: article.content,
  sourceName: article.sourceName,
  sourceUrl: article.sourceUrl,
  createdAt: new Date().toISOString(),
});

function createDocument(partial: Partial<StudioDocument>): StudioDocument {
  const now = new Date().toISOString();
  return {
    ...EMPTY_DOCUMENT,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function DraftingStudio() {
  const { notify } = useUiStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogModule, setCatalogModule] = useState<LegalModule | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentDocument, setCurrentDocument] = useState<StudioDocument>(() => createDocument({}));
  const [documents, setDocuments] = useState<StudioDocument[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [mobilePanel, setMobilePanel] = useState<'document' | 'foundation' | 'citations'>('document');
  const [foundationQuery, setFoundationQuery] = useState('');
  const [foundationScope, setFoundationScope] = useState<CorpusSearchScope>('todos');
  const [foundationResults, setFoundationResults] = useState<LegalArticle[]>([]);
  const [foundationSearching, setFoundationSearching] = useState(false);
  const [foundationError, setFoundationError] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentDocument.editorHtml,
    editorProps: {
      attributes: {
        class: 'studio-editor min-h-[620px] outline-none',
        'aria-label': 'Contenido editable del documento',
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      setCurrentDocument((document) => ({
        ...document,
        editorHtml: activeEditor.getHTML(),
        updatedAt: new Date().toISOString(),
      }));
      setSaveState('saving');
    },
  });

  useEffect(() => {
    let active = true;
    let pendingArticle: LegalArticle | null = null;
    const pending = sessionStorage.getItem('lex_studio_pending_citation');
    if (pending) {
      try {
        pendingArticle = JSON.parse(pending) as LegalArticle;
      } catch {
        sessionStorage.removeItem('lex_studio_pending_citation');
      }
    }
    loadTemplateRegistry().then((registry) => {
      if (!active) return;
      setTemplates(registry);
      if (registry[0]) {
        selectTemplate(registry[0]);
        setShowVariables(false);
      }
      if (pendingArticle) {
        addCitation(pendingArticle);
        sessionStorage.removeItem('lex_studio_pending_citation');
        notify('Fundamento recibido desde Legislación.', 'success');
      }
    });
    listStudioDocuments().then(setDocuments).catch(() => undefined);
    return () => { active = false; };
    // selectTemplate is intentionally initialized from the loaded registry once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.getHTML() === currentDocument.editorHtml) return;
    editor.commands.setContent(currentDocument.editorHtml, { emitUpdate: false });
  }, [currentDocument.editorHtml, currentDocument.id, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || !selectedTemplate) return;
    try {
      const generated = Handlebars.compile(selectedTemplate.templateHandlebars)({
        ...formData,
        ...(selectedTemplate.toggles ?? []).reduce<Record<string, string>>((values, toggle) => {
          values[`toggle_${toggle.id}`] = toggle.defaultActive ? toggle.content : '';
          return values;
        }, {}),
      });
      const editorHtml = textToHtml(generated);
      editor.commands.setContent(editorHtml, { emitUpdate: false });
      setCurrentDocument((document) => ({ ...document, editorHtml, updatedAt: new Date().toISOString() }));
      setSaveState('saving');
    } catch {
      notify('La plantilla no pudo compilarse. Revisa los datos capturados.', 'error');
    }
  }, [formData, selectedTemplate, editor, notify]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        await saveStudioDocument(currentDocument);
        setSaveState('saved');
        setDocuments(await listStudioDocuments());
      } catch {
        setSaveState('error');
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [currentDocument]);

  const filteredTemplates = useMemo(() => {
    const query = catalogSearch.trim().toLocaleLowerCase('es-MX');
    return templates.filter((template) => {
      const moduleMatches = catalogModule === 'all' || template.module === catalogModule;
      const queryMatches = !query || `${template.title} ${template.description}`.toLocaleLowerCase('es-MX').includes(query);
      return moduleMatches && queryMatches;
    });
  }, [templates, catalogModule, catalogSearch]);

  const moduleCounts = useMemo(
    () => templates.reduce<Record<string, number>>((counts, template) => {
      counts[template.module] = (counts[template.module] ?? 0) + 1;
      return counts;
    }, {}),
    [templates],
  );

  function selectTemplate(template: LegalTemplate) {
    const values = Object.fromEntries(
      template.fields.map((field) => [
        field.id,
        field.defaultValue ?? (field.type === 'date' ? '' : `[${field.label.toLocaleUpperCase('es-MX')}]`),
      ]),
    );
    setSelectedTemplate(template);
    setFormData(values);
    setCurrentDocument(createDocument({
      title: template.title,
      sourceKind: 'template',
      templateId: template.id,
      editorHtml: '<p>Cargando plantilla…</p>',
    }));
    setShowVariables(true);
    setMobilePanel('document');
  }

  function openDocument(document: StudioDocument) {
    setSelectedTemplate(document.templateId ? templates.find((template) => template.id === document.templateId) ?? null : null);
    setCurrentDocument(document);
    editor?.commands.setContent(document.editorHtml, { emitUpdate: false });
    setShowDrafts(false);
    setShowVariables(false);
  }

  async function handleImport(file?: File) {
    if (!file) return;
    try {
      const imported = await importUserDocument(file);
      const document = createDocument({
        title: imported.title,
        sourceKind: imported.sourceKind,
        sourceFileName: imported.sourceFileName,
        sourceMimeType: imported.sourceMimeType,
        sourceBuffer: imported.sourceBuffer,
        editorHtml: textToHtml(imported.text),
      });
      setSelectedTemplate(null);
      setCurrentDocument(document);
      editor?.commands.setContent(document.editorHtml, { emitUpdate: false });
      notify(
        imported.sourceKind === 'docx'
          ? 'DOCX abierto. El original permanece intacto; exportaremos una copia editada.'
          : imported.sourceKind === 'pdf'
            ? 'PDF extraído a una copia textual editable. El original no se modifica.'
            : 'Archivo de texto abierto en el Estudio.',
        'success',
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible importar el archivo.', 'error');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function exportDocx() {
    if (!editor) return;
    try {
      if (currentDocument.sourceKind === 'docx' && currentDocument.sourceBuffer && currentDocument.sourceFileName) {
        await exportPreservedDocxCopy(
          currentDocument.sourceBuffer,
          editor.getText({ blockSeparator: '\n\n' }),
          currentDocument.citations,
          currentDocument.sourceFileName,
        );
      } else {
        await exportDocumentDocx(currentDocument.title, editor.getText({ blockSeparator: '\n\n' }));
      }
      notify('Copia DOCX exportada.', 'success');
    } catch {
      notify('No fue posible exportar la copia DOCX.', 'error');
    }
  }

  async function exportPdf() {
    if (!editor) return;
    await exportDocumentPdf(currentDocument.title, editor.getText({ blockSeparator: '\n\n' }));
    notify('Copia PDF exportada.', 'success');
  }

  function exportTxt() {
    if (!editor) return;
    downloadTextCopy(editor.getText({ blockSeparator: '\n\n' }), currentDocument.sourceFileName ?? currentDocument.title);
  }

  async function searchFoundations(event: React.FormEvent) {
    event.preventDefault();
    if (!foundationQuery.trim()) return;
    setFoundationSearching(true);
    setFoundationError('');
    try {
      const result = await executeCorpusSearch({ query: foundationQuery, scope: foundationScope, limit: 6 });
      setFoundationResults(result.articles);
    } catch {
      setFoundationError('No fue posible consultar el corpus local.');
    } finally {
      setFoundationSearching(false);
    }
  }

  function addCitation(article: LegalArticle) {
    setCurrentDocument((document) => {
      if (document.citations.some((citation) => citation.articleId === article.id)) return document;
      return { ...document, citations: [...document.citations, citationFromArticle(article)], updatedAt: new Date().toISOString() };
    });
  }

  function insertCitation(citation: LegalCitation) {
    editor?.chain().focus().insertContent(
      `<blockquote><p><strong>${escapeHtml(citation.lawName)}, ${escapeHtml(citation.articleNumber)}.</strong> ${escapeHtml(citation.content)}</p><p>Fuente oficial: <a href="${escapeHtml(citation.sourceUrl)}">${escapeHtml(citation.sourceName)}</a></p></blockquote>`,
    ).run();
    setMobilePanel('document');
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-legal-gold/15 text-legal-golddark"><FilePenLine size={19} /></span>
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight">Estudio jurídico</h1>
              <p className="text-[11px] text-slate-500">Redacción documental con consulta del corpus federal oficial</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold ${saveState === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {saveState === 'saving' ? <LoaderCircle size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {saveState === 'saving' ? 'Autoguardando…' : saveState === 'error' ? 'No se pudo guardar' : 'Autoguardado local'}
            </span>
            <button type="button" onClick={() => setShowDrafts(true)} className="studio-action"><FolderOpen size={16} /> Borradores</button>
            <input ref={fileInput} className="hidden" type="file" accept=".docx,.txt,.pdf,text/plain,application/pdf" onChange={(event) => handleImport(event.target.files?.[0])} />
            <button type="button" onClick={() => fileInput.current?.click()} className="studio-action"><Upload size={16} /> Importar <span className="hidden sm:inline">DOCX · TXT · PDF</span></button>
            <details className="relative">
              <summary className="studio-primary cursor-pointer list-none"><Download size={16} /> Exportar <ChevronDown size={14} /></summary>
              <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-dialog">
                <button type="button" onClick={exportDocx} className="studio-menu-item">Copia DOCX</button>
                <button type="button" onClick={exportPdf} className="studio-menu-item">Copia PDF</button>
                <button type="button" onClick={exportTxt} className="studio-menu-item">Texto plano</button>
              </div>
            </details>
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {([
            ['document', FileText, 'Documento'],
            ['foundation', BookOpenCheck, 'Fundamentar'],
            ['citations', Library, 'Citas'],
          ] as const).map(([panel, Icon, label]) => (
            <button key={panel} type="button" onClick={() => setMobilePanel(panel)} className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-bold ${mobilePanel === panel ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 grid-cols-1 lg:h-[calc(100vh-134px)] lg:grid-cols-[250px_minmax(480px,1fr)_330px]">
        <aside className="hidden min-h-0 border-r border-slate-200 bg-white lg:flex lg:flex-col" aria-label="Catálogo de instrumentos">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between"><h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700">Instrumentos</h2><button type="button" onClick={() => { setSelectedTemplate(null); setCurrentDocument(createDocument({})); }} className="studio-icon-button" aria-label="Crear documento"><Plus size={18} /></button></div>
            <label className="relative mt-2 block"><span className="sr-only">Buscar plantilla</span><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Buscar plantilla" className="studio-input pl-9" /></label>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {selectedTemplate && (
              <button type="button" onClick={() => setShowVariables(true)} className="mb-4 w-full rounded-xl border border-legal-gold bg-amber-50 p-3 text-left shadow-sm">
                <strong className="block text-xs font-extrabold text-slate-950">{selectedTemplate.title}</strong>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500">Borrador abierto · completar variables</span>
              </button>
            )}
            <p className="mb-2 px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Catálogo por materia</p>
            <div className="space-y-1">
              {MODULES.map((module) => (
                <button key={module} type="button" onClick={() => setCatalogModule(catalogModule === module ? 'all' : module)} className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-xs font-bold ${catalogModule === module ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                  <span>{PWA_MODULE_CONFIG[module].shortLabel}</span><span className="text-[10px] opacity-60">{moduleCounts[module] ?? 0}</span>
                </button>
              ))}
            </div>
            {(catalogModule !== 'all' || catalogSearch.trim()) && <p className="mb-2 mt-5 px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{filteredTemplates.length} instrumentos únicos</p>}
            {(catalogModule !== 'all' || catalogSearch.trim()) && <div className="space-y-1.5">
              {filteredTemplates.filter((template) => template.id !== selectedTemplate?.id).map((template) => (
                <button key={template.id} type="button" onClick={() => selectTemplate(template)} className={`w-full rounded-xl border p-3 text-left ${selectedTemplate?.id === template.id ? 'border-legal-gold bg-amber-50 shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                  <strong className="block text-xs font-extrabold text-slate-950">{template.title}</strong><span className="mt-1 block text-[10px] leading-4 text-slate-500">{template.intentGroup}</span>
                </button>
              ))}
            </div>}
          </div>
          <div className="border-t border-slate-200 p-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800"><ShieldCheck size={16} /> Privacidad local</div><p className="mt-1 text-[10px] leading-4 text-emerald-700">Los documentos permanecen en este dispositivo. Requieren revisión profesional.</p></div></div>
        </aside>

        <section className={`${mobilePanel === 'document' ? 'flex' : 'hidden'} min-w-0 flex-col bg-slate-100 lg:flex`} aria-label="Editor de documento">
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => editor?.chain().focus().undo().run()} className="studio-icon-button" aria-label="Deshacer"><Undo2 size={17} /></button>
              <button type="button" onClick={() => editor?.chain().focus().redo().run()} className="studio-icon-button" aria-label="Rehacer"><Redo2 size={17} /></button>
              <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
              <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`studio-icon-button font-serif font-bold ${editor?.isActive('bold') ? 'bg-slate-900 text-white' : ''}`} aria-label="Negritas">B</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`studio-icon-button ${editor?.isActive('bulletList') ? 'bg-slate-900 text-white' : ''}`} aria-label="Lista"><List size={17} /></button>
              {selectedTemplate && <button type="button" onClick={() => setShowVariables((value) => !value)} className="ml-1 min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">Variables</button>}
            </div>
            <label className="flex min-w-0 items-center gap-2"><span className="sr-only">Título del documento</span><input value={currentDocument.title} onChange={(event) => setCurrentDocument((document) => ({ ...document, title: event.target.value, updatedAt: new Date().toISOString() }))} className="max-w-52 border-0 bg-transparent text-right text-xs font-bold text-slate-600 outline-none" /></label>
          </div>

          {showVariables && selectedTemplate && (
            <div className="max-h-64 overflow-y-auto border-b border-amber-200 bg-amber-50/80 p-4">
              <div className="mx-auto max-w-[720px]"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-xs font-extrabold text-slate-900">Completar variables</h2><p className="text-[10px] text-slate-500">El documento se actualiza localmente mientras capturas.</p></div><button type="button" onClick={() => setShowVariables(false)} className="studio-icon-button" aria-label="Cerrar variables"><X size={16} /></button></div>
                <div className="grid gap-3 sm:grid-cols-2">{selectedTemplate.fields.map((field) => <label key={field.id} className={`text-[11px] font-bold text-slate-700 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>{field.label}{field.type === 'textarea' ? <textarea value={formData[field.id] ?? ''} onChange={(event) => setFormData((values) => ({ ...values, [field.id]: event.target.value }))} className="studio-input mt-1 min-h-24 py-2" /> : <input type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} value={formData[field.id] ?? ''} onChange={(event) => setFormData((values) => ({ ...values, [field.id]: event.target.value }))} className="studio-input mt-1" />}</label>)}</div>
              </div>
            </div>
          )}

          <div className="h-[calc(100vh-247px)] overflow-y-auto p-3 sm:p-6 lg:h-[calc(100vh-181px)]">
            <article className="legal-letterhead mx-auto min-h-[720px] w-full max-w-[720px] rounded-xl px-6 py-8 sm:px-12 sm:py-10">
              <div className="flex items-start justify-between border-b border-slate-200 pb-5"><div><img src={logoLockup} alt="Lex Corporativo" className="h-auto w-32 rounded-lg bg-legal-shell object-contain px-2 py-1" /><p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Instrumento jurídico privado</p></div><div className="text-right text-[10px] leading-4 text-slate-400"><span className="block font-bold text-slate-600">BORRADOR</span>Revisión profesional requerida</div></div>
              <EditorContent editor={editor} className="mt-8" />
              <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-900">Este borrador no constituye validación legal. Confirma vigencia, reformas, datos y fuentes oficiales antes de firmar o citar.</div>
            </article>
          </div>
        </section>

        <aside className={`${mobilePanel === 'document' ? 'hidden' : 'flex'} min-h-0 flex-col border-l border-slate-200 bg-white lg:flex`} aria-label="Fundamentador y biblioteca de citas">
          {mobilePanel !== 'citations' && <div className="border-b border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><div><h2 className="font-serif text-base font-semibold">Fundamentador</h2><p className="text-[10px] text-slate-500">Consulta determinista del corpus federal</p></div><span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-blue-700">Corpus local</span></div>
            <form onSubmit={searchFoundations} className="mt-3"><label htmlFor="foundation-query" className="text-[11px] font-bold text-slate-700">Buscar fundamento</label><div className="relative mt-1.5"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="foundation-query" type="search" value={foundationQuery} onChange={(event) => setFoundationQuery(event.target.value)} placeholder="Concepto o artículo" className="studio-input pl-9" /></div><div className="mt-2 grid grid-cols-[1fr_auto] gap-2"><select aria-label="Área jurídica" value={foundationScope} onChange={(event) => setFoundationScope(event.target.value as CorpusSearchScope)} className="studio-input px-2 text-xs font-bold"><option value="todos">Todas las materias</option><option value="mercantil">Mercantil</option><option value="laboral">Laboral</option><option value="fiscal">Fiscal</option><option value="comercio_exterior">Comercio exterior</option><option value="aduanal">Aduanal</option></select><button type="submit" className="min-h-11 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white hover:bg-blue-700">{foundationSearching ? <LoaderCircle size={15} className="animate-spin" /> : 'Buscar'}</button></div>{foundationError && <p role="alert" className="mt-2 text-xs text-red-700">{foundationError}</p>}</form></div>}
          <div className="flex-1 overflow-y-auto p-4">
            {mobilePanel !== 'citations' && <div className="space-y-2">{foundationResults.length === 0 ? <div className="rounded-xl border border-blue-200 bg-blue-50 p-3"><div className="flex items-start gap-2"><BookOpenCheck size={18} className="mt-0.5 shrink-0 text-blue-700" /><div><p className="text-xs font-extrabold text-blue-950">Resultados con fuente oficial</p><p className="mt-1 text-[10px] leading-4 text-blue-800">Busca un concepto para consultar disposiciones del corpus local.</p></div></div></div> : foundationResults.map((article) => <article key={article.id} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-1.5"><span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white">{article.lawCode}</span><span className="text-[10px] font-bold text-blue-700">{article.articleNumber}</span></div><h3 className="mt-1.5 text-xs font-extrabold leading-4">{article.lawName}</h3><p className="mt-1 line-clamp-3 text-[10px] leading-4 text-slate-600">{article.content}</p><div className="mt-2 flex items-center justify-between"><a href={article.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-700"><ExternalLink size={11} className="inline" /> Fuente</a><button type="button" onClick={() => addCitation(article)} className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-extrabold text-white">Guardar cita</button></div></article>)}</div>}
            <div className={`${mobilePanel === 'citations' ? '' : 'mt-5'}`}><div className="flex items-center justify-between"><h3 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Biblioteca de citas</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{currentDocument.citations.length} citas</span></div>
              {currentDocument.citations.length === 0 ? <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><Library size={20} className="mx-auto text-slate-400" /><p className="mt-2 text-xs font-bold text-slate-700">Sin citas guardadas</p><p className="mt-1 text-[10px] leading-4 text-slate-500">Guarda resultados para insertarlos y conservar su fuente.</p></div> : <div className="mt-2 space-y-2">{currentDocument.citations.map((citation) => <article key={citation.id} className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-extrabold">{citation.lawCode} · {citation.articleNumber}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">{citation.content}</p><div className="mt-2 flex gap-1.5"><button type="button" onClick={() => insertCitation(citation)} className="flex-1 rounded-lg bg-legal-gold px-2 py-1.5 text-[10px] font-extrabold text-slate-950">Insertar</button><button type="button" onClick={() => setCurrentDocument((document) => ({ ...document, citations: document.citations.filter((item) => item.id !== citation.id) }))} className="studio-icon-button h-8 min-h-8 w-8 min-w-8" aria-label="Eliminar cita"><Trash2 size={13} /></button></div></article>)}</div>}
            </div>
          </div>
          <div className="border-t border-slate-200 p-4"><div className="flex items-center justify-between text-[10px] font-bold text-slate-500"><span className="inline-flex items-center gap-1.5"><WifiOff size={13} className="text-amber-600" /> Consulta local</span><span className="inline-flex items-center gap-1.5"><Database size={13} className="text-emerald-600" /> Corpus cargado</span></div></div>
        </aside>
      </section>

      {showDrafts && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Borradores locales"><div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-dialog"><div className="flex items-center justify-between border-b border-slate-200 p-4"><div><h2 className="font-serif text-lg font-semibold">Borradores locales</h2><p className="text-xs text-slate-500">Guardados en IndexedDB en este dispositivo.</p></div><button type="button" onClick={() => setShowDrafts(false)} className="studio-icon-button" aria-label="Cerrar"><X size={18} /></button></div><div className="max-h-[60vh] overflow-y-auto p-4">{documents.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Todavía no hay borradores.</p> : <div className="space-y-2">{documents.map((document) => <div key={document.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><FileText size={18} className="text-slate-400" /><button type="button" onClick={() => openDocument(document)} className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm">{document.title}</strong><span className="text-[10px] text-slate-500">{document.sourceKind.toUpperCase()} · {new Date(document.updatedAt).toLocaleString('es-MX')}</span></button><button type="button" onClick={async () => { await deleteStudioDocument(document.id); setDocuments(await listStudioDocuments()); }} className="studio-icon-button text-red-600" aria-label={`Eliminar ${document.title}`}><Trash2 size={16} /></button></div>)}</div>}</div></div></div>}
    </div>
  );
}
