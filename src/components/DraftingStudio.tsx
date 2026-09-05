import { useEffect, useMemo, useRef, useState } from 'react';
import Handlebars from 'handlebars';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  ExternalLink,
  FilePenLine,
  FileText,
  FolderOpen,
  Italic,
  List,
  LoaderCircle,
  Lock,
  Plus,
  Redo2,
  Search,
  Share2,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import { loadTemplateRegistry } from '../lib/template-registry';
import { deleteStudioDocument, listStudioDocuments, saveStudioDocument } from '../lib/studio-storage';
import { downloadTextCopy, exportPreservedDocxCopy, importUserDocument } from '../lib/document-import';
import { exportDocumentDocx } from '../lib/docx-export';
import { exportDocumentPdf } from '../lib/pdf-export';
import { executeCorpusSearch } from '../services/corpus-search';
import { useUiStore } from '../store/useUiStore';
import { TemplateCatalogModal } from './studio/TemplateCatalogModal';
import { StudioWelcomeHub } from './studio/StudioWelcomeHub';
import { EditorBubbleMenu } from './studio/EditorBubbleMenu';
import { FootnotesAppendix } from './studio/FootnotesAppendix';
import { ClauseAuditorDrawer } from './studio/ClauseAuditorDrawer';
import { DesktopFeatureLockModal, type LockedFeatureType } from './studio/DesktopFeatureLockModal';
import type {
  CorpusSearchScope,
  LegalArticle,
  LegalCitation,
  LegalTemplate,
  StudioDocument,
} from '../types';

const EMPTY_DOCUMENT: StudioDocument = {
  id: 'new-document',
  title: 'Documento Jurídico sin Título',
  sourceKind: 'blank',
  editorHtml: '<h2>INSTRUMENTO JURÍDICO</h2><p>Comienza a redactar tu contrato, convenio o escrito aquí…</p>',
  citations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

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

export interface DraftingStudioProps {
  onNavigateToDesktop?: () => void;
}

export function DraftingStudio({ onNavigateToDesktop }: DraftingStudioProps = {}) {
  const { notify } = useUiStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const exportDetailsRef = useRef<HTMLDetailsElement>(null);

  // States
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [currentDocument, setCurrentDocument] = useState<StudioDocument>(() => createDocument({}));
  const [documents, setDocuments] = useState<StudioDocument[]>([]);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');

  // Modals and Drawers
  const [showWelcomeHub, setShowWelcomeHub] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showAuditorDrawer, setShowAuditorDrawer] = useState(false);
  const [showAssistantDrawer, setShowAssistantDrawer] = useState(false);
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [lockedFeatureModal, setLockedFeatureModal] = useState<LockedFeatureType>(null);

  // Foundation Search
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
        class: 'studio-editor min-h-[480px] outline-none leading-relaxed text-slate-800 text-sm sm:text-base',
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

  const checkPendingCitation = () => {
    const pending = sessionStorage.getItem('lex_studio_pending_citation');
    if (pending) {
      try {
        const pendingArticle = JSON.parse(pending) as LegalArticle;
        addCitation(pendingArticle);
        sessionStorage.removeItem('lex_studio_pending_citation');
        notify('Fundamento recibido desde Legislación.', 'success');
      } catch {
        sessionStorage.removeItem('lex_studio_pending_citation');
      }
    }
  };

  useEffect(() => {
    let active = true;
    checkPendingCitation();
    loadTemplateRegistry().then((registry) => {
      if (!active) return;
      setTemplates(registry);
    });
    listStudioDocuments().then((storedDocs) => {
      if (!active) return;
      setDocuments(storedDocs);
      const hubSeen = sessionStorage.getItem('lex_studio_hub_seen');
      if (!hubSeen && storedDocs.length === 0) {
        setShowWelcomeHub(true);
        sessionStorage.setItem('lex_studio_hub_seen', 'true');
      } else if (storedDocs.length > 0) {
        const latest = storedDocs[0];
        setCurrentDocument(latest);
        editor?.commands.setContent(latest.editorHtml, { emitUpdate: false });
      }
    }).catch(() => undefined);

    window.addEventListener('focus', checkPendingCitation);
    return () => {
      active = false;
      window.removeEventListener('focus', checkPendingCitation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCatalogModal(false);
        setShowAuditorDrawer(false);
        setShowAssistantDrawer(false);
        setShowVariablesModal(false);
        setShowDraftsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!editor || editor.isDestroyed || editor.getHTML() === currentDocument.editorHtml) return;
    editor.commands.setContent(currentDocument.editorHtml, { emitUpdate: false });
  }, [currentDocument.editorHtml, currentDocument.id, editor]);

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

  useEffect(() => {
    let wakeLock: { release?: () => Promise<void> } | null = null;
    const requestWakeLock = async () => {
      if (
        typeof navigator !== 'undefined' &&
        'wakeLock' in navigator &&
        typeof (navigator as unknown as { wakeLock?: { request?: (type: string) => Promise<{ release?: () => Promise<void> }> } }).wakeLock?.request === 'function' &&
        document.visibilityState === 'visible'
      ) {
        try {
          wakeLock = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release?: () => Promise<void> }> } }).wakeLock.request('screen');
        } catch {
          // Ignore silently on unsupported or battery-restricted environments
        }
      }
    };
    requestWakeLock();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLock && typeof wakeLock.release === 'function') {
        wakeLock.release().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().includes('MAC');
      const isModifier = isMac ? e.metaKey : e.ctrlKey;

      if (isModifier && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveStudioDocument(currentDocument).then(() => {
          setSaveState('saved');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
          }
          notify('Borrador guardado localmente (Ctrl+S).', 'success');
        });
      } else if (isModifier && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setLockedFeatureModal('fundamentar');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
      } else if (isModifier && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setLockedFeatureModal('auditar');
      } else if (isModifier && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowCatalogModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setLockedFeatureModal(null);
        setShowAssistantDrawer(false);
        setShowAuditorDrawer(false);
        setShowCatalogModal(false);
        setShowVariablesModal(false);
        setShowDraftsModal(false);
        setShowWelcomeHub(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDocument, notify]);

  function applyTemplateVariables(template: LegalTemplate, data: Record<string, string>) {
    try {
      const generated = Handlebars.compile(template.templateHandlebars)({
        ...data,
        ...(template.toggles ?? []).reduce<Record<string, string>>((values, toggle) => {
          values[`toggle_${toggle.id}`] = toggle.defaultActive ? toggle.content : '';
          return values;
        }, {}),
      });
      const editorHtml = textToHtml(generated);
      editor?.commands.setContent(editorHtml, { emitUpdate: false });
      setCurrentDocument(createDocument({
        title: template.title,
        sourceKind: 'template',
        templateId: template.id,
        editorHtml,
      }));
      setSaveState('saving');
      setShowVariablesModal(false);
      setShowWelcomeHub(false);
      notify('Instrumento generado con variables aplicadas.', 'success');
    } catch {
      notify('La plantilla no pudo compilarse. Revisa los datos capturados.', 'error');
    }
  }

  function selectTemplate(template: LegalTemplate) {
    const values = Object.fromEntries(
      template.fields.map((field) => [
        field.id,
        field.defaultValue ?? (field.type === 'date' ? '' : `[${field.label.toLocaleUpperCase('es-MX')}]`),
      ]),
    );
    setSelectedTemplate(template);
    setFormData(values);
    setShowCatalogModal(false);
    setShowWelcomeHub(false);

    if (template.fields.length > 0) {
      setShowVariablesModal(true); // Open Step 2: Variables wizard
    } else {
      applyTemplateVariables(template, values);
    }
  }

  function selectBlank() {
    setSelectedTemplate(null);
    const blank = createDocument({});
    setCurrentDocument(blank);
    editor?.commands.setContent(blank.editorHtml, { emitUpdate: false });
    setShowVariablesModal(false);
    setShowWelcomeHub(false);
    notify('Lienzo en blanco iniciado.', 'info');
  }

  function openDocument(document: StudioDocument) {
    setSelectedTemplate(null);
    setCurrentDocument(document);
    editor?.commands.setContent(document.editorHtml, { emitUpdate: false });
    setShowDraftsModal(false);
    setShowVariablesModal(false);
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
    exportDetailsRef.current?.removeAttribute('open');
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
    exportDetailsRef.current?.removeAttribute('open');
    if (!editor) return;
    await exportDocumentPdf(currentDocument.title, editor.getText({ blockSeparator: '\n\n' }));
    notify('Copia PDF exportada.', 'success');
  }

  async function exportTxt() {
    exportDetailsRef.current?.removeAttribute('open');
    if (!editor) return;
    downloadTextCopy(editor.getText({ blockSeparator: '\n\n' }), currentDocument.sourceFileName ?? currentDocument.title);
  }

  async function shareDocument() {
    if (!editor) return;
    const text = editor.getText({ blockSeparator: '\n\n' });
    const shareData = {
      title: currentDocument.title,
      text: `${currentDocument.title}\n\n${text}\n\n---\nGenerado en Lex Corporativo Estudio`,
    };
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        notify('Documento compartido.', 'success');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareData.text);
          notify('Texto del documento copiado al portapapeles.', 'success');
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.text);
      notify('Texto del documento copiado al portapapeles.', 'success');
    }
  }

  async function runCorpusSearch(query: string, scope: CorpusSearchScope = foundationScope) {
    if (!query.trim()) return;
    setFoundationSearching(true);
    setFoundationError('');
    setShowAssistantDrawer(true);
    setFoundationQuery(query);
    try {
      const result = await executeCorpusSearch({ query, scope, limit: 6 });
      setFoundationResults(result.articles);
    } catch {
      setFoundationError('No fue posible consultar el corpus local.');
    } finally {
      setFoundationSearching(false);
    }
  }

  async function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    await runCorpusSearch(foundationQuery, foundationScope);
  }

  function addCitation(article: LegalArticle) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setCurrentDocument((document) => {
      if (document.citations.some((citation) => citation.articleId === article.id)) return document;
      return {
        ...document,
        citations: [...document.citations, citationFromArticle(article)],
        updatedAt: new Date().toISOString(),
      };
    });
  }

  // Opción C: Insert Footnote with Superscript [N] linked to Appendix
  function insertFootnote(article: LegalArticle) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    let citationIndex = currentDocument.citations.findIndex((c) => c.articleId === article.id);
    if (citationIndex === -1) {
      const newCitation = citationFromArticle(article);
      citationIndex = currentDocument.citations.length;
      setCurrentDocument((doc) => ({
        ...doc,
        citations: [...doc.citations, newCitation],
        updatedAt: new Date().toISOString(),
      }));
    }

    const footnoteNumber = citationIndex + 1;
    editor?.chain().focus().insertContent(` <sup>[${footnoteNumber}]</sup> `).run();
    notify(`Nota al pie [${footnoteNumber}] insertada y vinculada al apéndice.`, 'success');
  }

  // Insert Full Blockquote
  function insertBlockquote(article: LegalArticle) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    editor?.chain().focus().insertContent(
      `<blockquote><p><strong>${escapeHtml(article.lawName)}, ${escapeHtml(article.articleNumber)}.</strong> ${escapeHtml(article.content)}</p><p>Fuente oficial: <a href="${escapeHtml(article.sourceUrl)}">${escapeHtml(article.sourceName)}</a></p></blockquote>`,
    ).run();
    addCitation(article);
    notify('Cita textual en bloque insertada.', 'success');
  }

  function removeCitation(citationId: string) {
    setCurrentDocument((doc) => ({
      ...doc,
      citations: doc.citations.filter((c) => c.id !== citationId),
      updatedAt: new Date().toISOString(),
    }));
    notify('Cita retirada de las notas al pie.', 'info');
  }

  const documentPlainText = useMemo(() => {
    if (editor && !editor.isDestroyed) {
      const editorText = editor.getText();
      if (editorText.trim()) return `${currentDocument.title}\n\n${editorText}`;
    }
    const strippedHtml = currentDocument.editorHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    return `${currentDocument.title}\n\n${strippedHtml}`;
  }, [editor, currentDocument.editorHtml, currentDocument.title]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-100/70 text-slate-950">
      {/* Top Main Navigation Bar */}
      <section className="sticky top-0 z-40 border-b border-slate-200/90 bg-white shadow-xs">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Title and Module Brand */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-legal-gold/30 bg-legal-gold/10 text-legal-golddark shrink-0">
              <FilePenLine size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
                  Estudio Jurídico
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                    saveState === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {saveState === 'saving' ? (
                    <LoaderCircle size={11} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={11} />
                  )}
                  {saveState === 'saving'
                    ? 'Guardando…'
                    : saveState === 'error'
                      ? 'Error al guardar'
                      : 'Bóveda local'}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500">
                Redacción documental con fundamentación directa del corpus federal
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Nuevo Documento Trigger */}
            <button
              type="button"
              onClick={() => setShowWelcomeHub(true)}
              className="studio-action gap-1.5 font-extrabold text-slate-900 border-slate-300 hover:border-legal-gold"
              title="Iniciar nuevo documento o abrir asistente de inicio"
            >
              <Plus size={15} className="text-legal-gold" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>

            {/* Catalog Button */}
            <button
              type="button"
              onClick={() => setShowCatalogModal(true)}
              className="studio-primary gap-1.5"
              title="Abrir catálogo de plantillas e instrumentos"
            >
              <BookOpen size={15} />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {selectedTemplate ? selectedTemplate.title : 'Instrumentos'}
              </span>
              <ChevronDown size={13} className="opacity-70" />
            </button>

            {/* Template Variables Trigger (if active) */}
            {selectedTemplate && (
              <button
                type="button"
                onClick={() => setShowVariablesModal(true)}
                className="studio-action text-amber-800 border-amber-300 bg-amber-50/70 hover:bg-amber-100"
                title="Configurar variables de la plantilla activa"
              >
                <SlidersHorizontal size={15} />
                <span>Variables</span>
                <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                  {selectedTemplate.fields.length}
                </span>
              </button>
            )}

            {/* Opción D: Auditor de Fundamentación Trigger (Locked for Desktop) */}
            <button
              type="button"
              onClick={() => setLockedFeatureModal('auditar')}
              className="studio-action text-slate-800 hover:border-amber-400 gap-1.5"
              title="Auditoría Contractual (Exclusivo de Lex Corporativo Desktop)"
            >
              <Lock size={13} className="text-amber-500" />
              <span>Auditar</span>
              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-900 uppercase">
                Desktop
              </span>
            </button>

            {/* Opción A & C: Assistant Trigger (Locked for Desktop) */}
            <button
              type="button"
              onClick={() => setLockedFeatureModal('fundamentar')}
              className="studio-action text-slate-800 hover:border-slate-400 gap-1.5"
              title="Fundamentación y Citas (Exclusivo de Lex Corporativo Desktop)"
            >
              <Lock size={13} className="text-slate-400" />
              <span>Fundamentar</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-extrabold text-slate-600 uppercase">
                Desktop
              </span>
            </button>

            {/* Borradores */}
            <button
              type="button"
              onClick={() => setShowDraftsModal(true)}
              className="studio-action"
              title="Ver borradores locales"
            >
              <FolderOpen size={15} />
              <span className="hidden sm:inline">Borradores</span>
              {documents.length > 0 && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                  {documents.length}
                </span>
              )}
            </button>

            {/* Import Button */}
            <input
              ref={fileInput}
              className="hidden"
              type="file"
              accept=".docx,.txt,.pdf,text/plain,application/pdf"
              onChange={(event) => handleImport(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="studio-action"
              title="Importar DOCX, PDF o TXT"
            >
              <Upload size={15} />
              <span className="hidden md:inline">Importar</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={shareDocument}
              className="studio-action"
              title="Compartir documento o copiar texto"
            >
              <Share2 size={15} />
            </button>

            {/* Export Dropdown */}
            <details ref={exportDetailsRef} className="relative">
              <summary className="studio-action cursor-pointer list-none gap-1 bg-slate-900 text-white border-slate-900 hover:bg-slate-800">
                <Download size={15} />
                <span>Exportar</span>
                <ChevronDown size={13} />
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-dialog">
                <button type="button" onClick={exportDocx} className="studio-menu-item">
                  Copia Word (.docx)
                </button>
                <button type="button" onClick={exportPdf} className="studio-menu-item">
                  Copia PDF Membretada
                </button>
                <button type="button" onClick={exportTxt} className="studio-menu-item">
                  Texto plano (.txt)
                </button>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Main Workspace: Clean Centered Canvas */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-4 sm:px-6 sm:py-8 pb-28 sm:pb-12">
        {/* Paper Sheet */}
        <article className="legal-letterhead mx-auto flex w-full flex-col justify-between rounded-2xl bg-white px-6 py-8 shadow-sm transition-all sm:px-12 sm:py-10 border border-slate-200/90">
          {/* Institutional Letterhead Header */}
          <header className="border-t-2 border-legal-gold border-b-2 border-slate-900 pb-4 pt-1 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-950 p-1.5 shadow-xs">
                  <img src={logoMark} alt="Lex Corporativo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <span className="font-serif text-xs sm:text-sm font-extrabold tracking-[0.2em] text-slate-950 block">
                    LEX CORPORATIVO
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Estudio de Ingeniería y Redacción Jurídica
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-[10px] font-bold text-slate-400 space-y-0.5">
                <p className="text-slate-900 font-extrabold tracking-wide">
                  FOLIO · {currentDocument.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="uppercase text-slate-500">
                  MÉXICO · {new Date(currentDocument.updatedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <span className="inline-block rounded bg-amber-50 border border-amber-200/60 px-2 py-0.2 text-[9px] font-black text-amber-900 uppercase">
                  Borrador de Trabajo
                </span>
              </div>
            </div>
          </header>

          {/* Quick Format & Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            {/* Document Title Input */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                aria-label="Título del documento"
                value={currentDocument.title}
                onChange={(event) =>
                  setCurrentDocument((doc) => ({ ...doc, title: event.target.value, updatedAt: new Date().toISOString() }))
                }
                className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm sm:text-base font-extrabold text-slate-900 outline-none transition focus:border-legal-gold focus:bg-slate-50"
                placeholder="Título del documento o contrato…"
              />
            </div>

            {/* In-Editor Quick Toolbar */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                className="studio-icon-button h-7 w-7 min-h-7 min-w-7 text-slate-600"
                title="Deshacer"
              >
                <Undo2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                className="studio-icon-button h-7 w-7 min-h-7 min-w-7 text-slate-600"
                title="Rehacer"
              >
                <Redo2 size={13} />
              </button>
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`studio-icon-button h-7 w-7 min-h-7 min-w-7 ${editor?.isActive('bold') ? 'bg-slate-900 text-amber-300' : 'text-slate-600'}`}
                title="Negrita"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`studio-icon-button h-7 w-7 min-h-7 min-w-7 ${editor?.isActive('italic') ? 'bg-slate-900 text-amber-300' : 'text-slate-600'}`}
                title="Cursiva"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`studio-icon-button h-7 w-7 min-h-7 min-w-7 ${editor?.isActive('bulletList') ? 'bg-slate-900 text-amber-300' : 'text-slate-600'}`}
                title="Lista con viñetas"
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Opción A: TipTap Bubble Menu for Selection */}
          <EditorBubbleMenu
            editor={editor}
            onFundamentar={(query) => {
              setFoundationQuery(query);
              setLockedFeatureModal('fundamentar');
            }}
          />

          {/* TipTap Document Content */}
          <div className="py-2">
            <EditorContent editor={editor} />
          </div>

          {/* Opción C: Footnotes & Appendix Component at Bottom */}
          <FootnotesAppendix citations={currentDocument.citations} onRemoveCitation={removeCitation} />

          {/* Institutional Letterhead Footer */}
          <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[9px] text-slate-400">
            <span>Lex Corporativo PWA · Bóveda local cifrada en navegador · Cero telemetría externa</span>
            <span className="font-extrabold uppercase text-slate-500">
              Hoja 1 de 1 · Revisión legal requerida
            </span>
          </footer>
        </article>
      </main>

      {/* Opción A & C: Assistant Drawer for Foundation Search & Insertion */}
      {showAssistantDrawer && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-stretch sm:justify-end bg-slate-950/30 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Asistente de Fundamentación Legal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAssistantDrawer(false);
          }}
        >
          <aside
            className="flex max-h-[88vh] sm:max-h-full h-auto sm:h-full w-full max-w-lg sm:max-w-md flex-col rounded-t-3xl sm:rounded-none bg-white shadow-2xl border-t sm:border-t-0 sm:border-l border-slate-200 animate-slideUp sm:animate-slideLeft"
          >
            {/* Mobile Pull Handle */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50 rounded-t-3xl sm:rounded-none">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-300">
                  <Search size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-sm font-bold text-slate-950">Asistente de Fundamentación</h2>
                    <kbd className="hidden sm:inline-block rounded bg-slate-200/80 px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-600">
                      Ctrl+K
                    </kbd>
                  </div>
                  <p className="text-[10px] text-slate-500">Consulta en vivo del corpus federal oficial</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssistantDrawer(false)}
                className="studio-icon-button"
                aria-label="Cerrar asistente"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-slate-100 bg-white space-y-2.5">
              <div className="relative">
                <input
                  type="search"
                  aria-label="Buscar fundamento"
                  value={foundationQuery}
                  onChange={(e) => setFoundationQuery(e.target.value)}
                  placeholder="Buscar artículo, término o seleccionar texto…"
                  className="studio-input pl-9 text-base sm:text-xs"
                />
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  aria-label="Área jurídica"
                  value={foundationScope}
                  onChange={(e) => setFoundationScope(e.target.value as CorpusSearchScope)}
                  className="studio-input h-8 text-xs font-bold flex-1"
                >
                  <option value="todos">Todas las materias</option>
                  <option value="mercantil">Mercantil</option>
                  <option value="laboral">Laboral</option>
                  <option value="fiscal">Fiscal</option>
                  <option value="comercio_exterior">Comercio exterior</option>
                  <option value="aduanal">Aduanal</option>
                </select>
                <button
                  type="submit"
                  disabled={foundationSearching}
                  className="studio-primary h-8 px-3 text-xs"
                >
                  {foundationSearching ? <LoaderCircle size={13} className="animate-spin" /> : 'Consultar'}
                </button>
              </div>
            </form>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {foundationError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {foundationError}
                </div>
              )}

              {foundationSearching && (
                <div className="flex items-center justify-center p-8 text-xs font-bold text-slate-400 gap-2">
                  <LoaderCircle size={16} className="animate-spin text-legal-gold" />
                  <span>Buscando en corpus local…</span>
                </div>
              )}

              {!foundationSearching && foundationResults.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  <BookOpen size={24} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-xs font-bold">Busca cualquier concepto o selecciona texto en el editor.</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Podrás insertar el fundamento como nota al pie <sup>[1]</sup> o cita en bloque.
                  </p>
                </div>
              )}

              {foundationResults.map((article) => {
                const isAlreadyCited = currentDocument.citations.some((c) => c.articleId === article.id);
                return (
                  <article
                    key={article.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-300">
                          {article.lawCode}
                        </span>
                        <strong className="ml-1.5 text-xs font-extrabold text-slate-900">
                          {article.articleNumber}
                        </strong>
                      </div>
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-legal-golddark hover:underline flex items-center gap-0.5"
                      >
                        <span>DOF</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-slate-700 line-clamp-4">
                      {article.content}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => insertFootnote(article)}
                        className="flex-1 rounded-lg bg-slate-900 px-2 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-slate-800 active:scale-95 shadow-xs flex items-center justify-center gap-1"
                      >
                        <Plus size={11} className="text-amber-300" />
                        <span>Nota al Pie <sup>[N]</sup></span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBlockquote(article)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-700 transition hover:bg-slate-100 active:scale-95"
                        title="Insertar como cita textual en bloque"
                      >
                        Cita en Bloque
                      </button>
                      <button
                        type="button"
                        onClick={() => addCitation(article)}
                        disabled={isAlreadyCited}
                        className={`rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${
                          isAlreadyCited
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Guardar en apéndice de citas"
                      >
                        {isAlreadyCited ? 'Guardada' : 'Guardar'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="border-t border-slate-200 p-3 bg-slate-50 flex items-center justify-between text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 size={13} className="text-emerald-600" /> Motor Local SQLite WASM Activo
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <Database size={12} className="text-slate-400" /> Corpus Federal en Memoria
              </span>
            </div>
          </aside>
        </div>
      )}

      {/* Studio Welcome / Launcher Hub */}
      <StudioWelcomeHub
        isOpen={showWelcomeHub}
        onClose={() => setShowWelcomeHub(false)}
        onOpenCatalog={() => setShowCatalogModal(true)}
        onSelectBlank={selectBlank}
        onTriggerImport={() => fileInput.current?.click()}
        recentDraft={documents[0] ?? null}
        onOpenDraft={openDocument}
      />

      {/* Catalog Modal */}
      <TemplateCatalogModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={selectTemplate}
        onSelectBlank={selectBlank}
      />

      {/* Desktop Feature Lock Modal (Exclusivo Desktop) */}
      <DesktopFeatureLockModal
        isOpen={lockedFeatureModal !== null}
        onClose={() => setLockedFeatureModal(null)}
        feature={lockedFeatureModal}
        onNavigateToDesktop={onNavigateToDesktop}
      />

      {/* Opción D: Clause Auditor Drawer */}
      <ClauseAuditorDrawer
        isOpen={showAuditorDrawer}
        onClose={() => setShowAuditorDrawer(false)}
        documentText={documentPlainText}
        citations={currentDocument.citations}
        onQuickSearch={(query) => runCorpusSearch(query)}
      />

      {/* Template Variables Modal */}
      {showVariablesModal && selectedTemplate && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Variables de la plantilla"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVariablesModal(false);
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-dialog sm:rounded-2xl">
            <div className="flex justify-center pb-0 pt-2.5 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="font-serif text-base font-bold text-slate-950">Variables del Instrumento</h2>
                <p className="text-xs text-slate-500">{selectedTemplate.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVariablesModal(false)}
                className="studio-icon-button"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {selectedTemplate.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.id] ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="studio-input p-2.5 text-base sm:text-xs"
                    />
                  ) : (
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={formData[field.id] ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="studio-input text-base sm:text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowVariablesModal(false)}
                className="studio-action text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => applyTemplateVariables(selectedTemplate, formData)}
                className="studio-primary px-5 py-2 text-xs font-bold"
              >
                Generar Documento en Editor →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Drafts Modal */}
      {showDraftsModal && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Borradores locales"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDraftsModal(false);
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-dialog sm:rounded-2xl">
            <div className="flex justify-center pb-0 pt-2.5 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-slate-950">Borradores locales</h2>
                <p className="text-xs text-slate-500">Guardados en IndexedDB en este dispositivo.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftsModal(false)}
                className="studio-icon-button"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {documents.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  Todavía no hay borradores guardados.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition">
                      <FileText size={18} className="text-slate-400 shrink-0" />
                      <button type="button" onClick={() => openDocument(doc)} className="min-w-0 flex-1 text-left">
                        <strong className="block truncate text-sm text-slate-950">{doc.title}</strong>
                        <span className="text-[10px] text-slate-500">
                          {doc.sourceKind.toUpperCase()} · {new Date(doc.updatedAt).toLocaleString('es-MX')} · {doc.citations?.length ?? 0} notas
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteStudioDocument(doc.id);
                          setDocuments(await listStudioDocuments());
                        }}
                        className="studio-icon-button text-red-600"
                        aria-label={`Eliminar ${doc.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
