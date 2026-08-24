import { useMemo, useState, type FormEvent } from 'react';
import {
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileSearch,
  Heart,
  LoaderCircle,
  RotateCcw,
  Scale,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  WifiOff,
  Zap,
} from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import logoLockup from '../assets/logo-lockup-transparent.png';
import { AREA_LABELS, CORPUS_STATS, getLawsForScope } from '../lib/corpus-catalog';
import { executeCorpusSearch, type CorpusSearchResult } from '../services/corpus-search';
import { useSearchStore } from '../store/useSearchStore';
import { useUiStore } from '../store/useUiStore';
import type { CorpusSearchScope, LegalArticle } from '../types';

const scopes = Object.entries(AREA_LABELS) as Array<[CorpusSearchScope, string]>;

const SUGGESTED_LEGAL_SEARCHES = [
  { label: 'Rescisión laboral', query: 'rescisión laboral', scope: 'laboral' as const },
  { label: 'Artículo 47 LFT', query: 'artículo 47', scope: 'laboral' as const, lawCode: 'LFT' },
  { label: 'Prescripción fiscal', query: 'prescripción fiscal', scope: 'fiscal' as const },
  { label: 'Asamblea de accionistas', query: 'asamblea de accionistas', scope: 'mercantil' as const, lawCode: 'LGSM' },
  { label: 'Despacho aduanero', query: 'despacho aduanero', scope: 'aduanal' as const },
  { label: 'Acreditamiento IVA', query: 'acreditamiento del impuesto', scope: 'fiscal' as const, lawCode: 'LIVA' },
  { label: 'Títulos de crédito', query: 'pagaré endoso', scope: 'mercantil' as const, lawCode: 'LGTOC' },
  { label: 'Prácticas desleales', query: 'discriminación de precios', scope: 'comercio_exterior' as const, lawCode: 'LCE' },
];

function articlePlainText(article: LegalArticle): string {
  return `${article.lawName}\n${article.articleNumber}\n\n${article.content}\n\nFuente oficial para cotejo: ${article.sourceUrl}`;
}

export function BuscadorLegal() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [scope, setScope] = useState<CorpusSearchScope>(
    (searchParams.get('scope') as CorpusSearchScope) || 'todos',
  );
  const [lawCode, setLawCode] = useState(searchParams.get('law') ?? '');
  const [result, setResult] = useState<CorpusSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { isOnline, notify } = useUiStore();
  const { addToFavorites, removeFromFavorites, isFavorite } = useSearchStore();

  const availableLaws = useMemo(() => getLawsForScope(scope), [scope]);
  const activeLawCode = availableLaws.some((law) => law.code === lawCode) ? lawCode : '';

  const performSearch = async (
    requestedQuery: string,
    requestedScope: CorpusSearchScope,
    requestedLawCode?: string,
  ) => {
    const normalizedQuery = requestedQuery.trim();
    if (normalizedQuery.length < 2) {
      setError('Escribe al menos dos caracteres para buscar.');
      return;
    }

    setError('');
    setIsSearching(true);
    setExpanded(new Set());
    try {
      const nextResult = await executeCorpusSearch({
        query: normalizedQuery,
        scope: requestedScope,
        lawCode: requestedLawCode || undefined,
        limit: 30,
      });
      setResult(nextResult);

      const url = new URL(window.location.href);
      url.searchParams.set('q', normalizedQuery);
      url.searchParams.set('scope', requestedScope);
      if (requestedLawCode) url.searchParams.set('law', requestedLawCode);
      else url.searchParams.delete('law');
      window.history.replaceState(null, '', url);
    } catch {
      setError('No pudimos cargar la legislación. Recarga la aplicación e inténtalo de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  const runSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    await performSearch(query, scope, activeLawCode || undefined);
  };

  const handleSuggestionClick = (sugQuery: string, sugScope: CorpusSearchScope, sugLawCode?: string) => {
    setQuery(sugQuery);
    setScope(sugScope);
    setLawCode(sugLawCode ?? '');
    void performSearch(sugQuery, sugScope, sugLawCode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetSearch = () => {
    setQuery('');
    setScope('todos');
    setLawCode('');
    setResult(null);
    setError('');
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('scope');
    url.searchParams.delete('law');
    window.history.replaceState(null, '', url);
  };

  const copyArticle = async (article: LegalArticle) => {
    try {
      await navigator.clipboard.writeText(articlePlainText(article));
      setCopiedId(article.id);
      window.setTimeout(() => setCopiedId(null), 1600);
      notify('Artículo copiado al portapapeles.', 'success');
    } catch {
      notify('El navegador no permitió copiar el texto.', 'error');
    }
  };

  const shareArticle = async (article: LegalArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${article.lawCode} · ${article.articleNumber}`,
          text: articlePlainText(article),
        });
      } else {
        await copyArticle(article);
      }
    } catch (shareError) {
      if ((shareError as Error).name !== 'AbortError') {
        notify('No fue posible compartir el artículo.', 'error');
      }
    }
  };

  const toggleFavorite = (article: LegalArticle) => {
    if (isFavorite(article.id)) {
      removeFromFavorites(article.id);
      notify('Artículo eliminado de guardados.', 'info');
    } else {
      addToFavorites(article);
      notify('Artículo guardado en este dispositivo.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-legal-shell text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              {/* Brand Logo Lockup & Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2.5 rounded-xl border border-legal-gold/30 bg-black/60 px-3 py-1.5 backdrop-blur-xs">
                  <img
                    src={logoMark}
                    alt="Lex Corporativo"
                    className="h-7 w-7 rounded-md object-cover border border-legal-gold/20"
                  />
                  <span className="font-serif text-sm font-bold tracking-wide text-white">
                    Lex Corporativo
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-legal-gold/40 bg-legal-gold/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-legal-gold">
                  <BookOpenCheck size={14} /> Legislación Federal Gratuita
                </div>
              </div>

              <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl text-white">
                Consulta la legislación federal con respaldo oficial
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Encuentra artículos y disposiciones entre {CORPUS_STATS.provisions.toLocaleString('es-MX')} registros
                de {CORPUS_STATS.instruments} leyes y reglamentos, con acceso directo a la fuente oficial en la Cámara
                de Diputados.
              </p>
            </div>

            <div
              className={`inline-flex min-h-11 items-center gap-2 self-start lg:self-center rounded-full border px-4 text-xs font-bold ${
                isOnline
                  ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-amber-700/60 bg-amber-950/40 text-amber-200'
              }`}
            >
              {isOnline ? <ShieldCheck size={16} /> : <WifiOff size={16} />}
              {isOnline ? 'Consulta privada' : 'Disponible sin conexión'}
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={runSearch}
            className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-3 shadow-2xl shadow-black/20 sm:p-4"
          >
            <label htmlFor="legal-query" className="mb-2 block text-xs font-bold text-slate-200">
              ¿Qué necesitas consultar?
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  id="legal-query"
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ej. rescisión laboral, prescripción fiscal o artículo 47"
                  autoComplete="off"
                  className="min-h-12 w-full rounded-xl border border-slate-600 bg-slate-950 py-3 pl-11 pr-4 text-base text-white placeholder:text-slate-500 focus:border-legal-gold focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-legal-gold px-6 text-sm font-extrabold text-slate-950 transition hover:bg-legal-goldhover disabled:cursor-wait disabled:opacity-60"
              >
                {isSearching ? <LoaderCircle size={18} className="animate-spin" /> : <FileSearch size={18} />} Buscar
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-300">
                Área
                <select
                  value={scope}
                  onChange={(event) => {
                    setScope(event.target.value as CorpusSearchScope);
                    setLawCode('');
                  }}
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-base text-white focus:border-legal-gold focus:outline-none sm:text-sm"
                >
                  {scopes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-300">
                Ley o reglamento <span className="font-normal text-slate-500">(opcional)</span>
                <select
                  value={activeLawCode}
                  onChange={(event) => setLawCode(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-base text-white focus:border-legal-gold focus:outline-none sm:text-sm"
                >
                  <option value="">Todas las leyes y reglamentos del área</option>
                  {availableLaws.map((law) => (
                    <option key={law.code} value={law.code}>
                      {law.code} · {law.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && (
              <p role="alert" className="mt-3 rounded-xl border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Results Area or Home Screen */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Initial Home Screen with Logo and Features */}
        {!result && !isSearching && (
          <div className="space-y-6">
            {/* Branded Home Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-legal-gold/40 bg-slate-950 p-1 shadow-xl shadow-legal-gold/10">
                    <img src={logoMark} alt="Lex Corporativo" className="h-full w-full rounded-xl object-cover" />
                  </div>
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-legal-gold text-slate-950 shadow-md">
                    <Scale size={14} />
                  </span>
                </div>

                <div className="max-w-xl">
                  <img
                    src={logoLockup}
                    alt="Lex Corporativo"
                    className="mx-auto h-9 object-contain mb-2"
                  />
                  <h2 className="font-serif text-xl font-bold text-slate-900 sm:text-2xl">
                    Buscador Jurídico Federal
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">
                    Herramienta de consulta normativa rápida y determinista. Búsqueda instantánea en el dispositivo
                    mediante SQLite WASM sobre las principales materias del derecho corporativo y fiscal mexicano.
                  </p>
                </div>

                {/* Feature Badges */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <Zap size={14} className="text-amber-600" /> SQLite WASM Local
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <ShieldCheck size={14} className="text-emerald-600" /> Consulta 100% Privada
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <BookOpenCheck size={14} className="text-blue-600" /> 5,011 Disposiciones
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <ExternalLink size={14} className="text-purple-600" /> Cámara de Diputados
                  </span>
                </div>
              </div>

              {/* Quick Search Chips */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-legal-golddark" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Sugerencias de consulta jurídica:
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_LEGAL_SEARCHES.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(item.query, item.scope, item.lawCode)}
                      className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-legal-gold hover:bg-amber-50/60 hover:text-slate-950 transition"
                    >
                      <Search size={13} className="text-slate-400 group-hover:text-legal-golddark" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {result && (
          <div className="space-y-4" aria-live="polite">
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-950">
                  {result.articles.length} {result.articles.length === 1 ? 'resultado' : 'resultados'} para “{result.query}”
                </p>
                <p className="mt-1 text-xs text-slate-500">Área consultada: {result.scopeLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetSearch}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw size={13} /> Nueva consulta
                </button>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <ShieldCheck size={14} /> Consulta local SQLite WASM
                </span>
              </div>
            </div>

            {result.articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <FileSearch className="mx-auto text-slate-400" size={32} />
                <h2 className="mt-3 text-sm font-extrabold text-slate-900">No encontramos coincidencias</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Prueba con menos palabras, elige otra área o consulta todas las leyes y reglamentos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.articles.map((article) => {
                  const isExpanded = expanded.has(article.id);
                  const favorite = isFavorite(article.id);
                  return (
                    <article
                      key={article.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-extrabold text-white">
                                {article.lawCode}
                              </span>
                              <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                                {article.articleNumber}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                {article.sourceKind}
                              </span>
                            </div>
                            <h2 className="mt-2 text-sm font-extrabold leading-5 text-slate-950 sm:text-base">
                              {article.lawName}
                            </h2>
                            {article.title && (
                              <p className="mt-1 text-xs font-semibold text-slate-500">{article.title}</p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => copyArticle(article)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              aria-label="Copiar artículo"
                              title="Copiar artículo"
                            >
                              {copiedId === article.id ? (
                                <Check size={18} className="text-emerald-600" />
                              ) : (
                                <Copy size={18} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => shareArticle(article)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              aria-label="Compartir artículo"
                              title="Compartir artículo"
                            >
                              <Share2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(article)}
                              className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl hover:bg-rose-50 ${
                                favorite ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                              }`}
                              aria-label={favorite ? 'Quitar de guardados' : 'Guardar en este dispositivo'}
                              title={favorite ? 'Quitar de guardados' : 'Guardar en este dispositivo'}
                            >
                              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>

                        <p
                          className={`mt-4 max-w-[78ch] whitespace-pre-line text-sm leading-7 text-slate-700 ${
                            isExpanded ? '' : 'line-clamp-5'
                          }`}
                        >
                          {article.content}
                        </p>

                        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl text-xs font-bold text-blue-700 hover:text-blue-900"
                          >
                            <ExternalLink size={15} /> {article.sourceName}
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((current) => {
                                const next = new Set(current);
                                if (next.has(article.id)) next.delete(article.id);
                                else next.add(article.id);
                                return next;
                              })
                            }
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {isExpanded ? 'Contraer texto' : 'Ver texto completo'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
              Antes de citar o tomar una decisión, confirma la reforma, vigencia y publicación en la fuente oficial.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
