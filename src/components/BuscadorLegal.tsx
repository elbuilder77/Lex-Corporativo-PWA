import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSearch,
  Scale,
  BriefcaseBusiness,
  Globe2,
  ShipWheel,
  ReceiptText,
  Search,
  Loader2,
  Sparkles,
  Check,
  Copy,
  Share2,
  FileSignature,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Cpu,
  Zap,
  Star,
  Sun,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { executeHybridWasmSearch, type HybridSearchResult } from '../services/hybrid-search';
import { getSqliteDb } from '../services/sqlite-db';
import { useUiStore } from '../store/useUiStore';
import { useCaseStore } from '../store/useCaseStore';
import { useSearchStore } from '../store/useSearchStore';
import { requestWakeLock, releaseWakeLock } from '../lib/wake-lock';
import { SearchResultSkeleton } from './ui/Skeleton';
import type { LegalEngineeringArea, LegalArticle } from '../types';

interface LawOption {
  code: string;
  name: string;
  shortName: string;
  area: LegalEngineeringArea;
  icon: React.ReactNode;
  activeColor: string;
}

const LAWS_OPTIONS: LawOption[] = [
  { code: 'LFT', name: 'Ley Federal del Trabajo', shortName: 'LFT (Laboral)', area: 'laboral', icon: <BriefcaseBusiness size={15} />, activeColor: 'border-amber-500 bg-amber-500/10 text-amber-300' },
  { code: 'CCom', name: 'Código de Comercio', shortName: 'CCom (Mercantil)', area: 'mercantil', icon: <Scale size={15} />, activeColor: 'border-blue-500 bg-blue-500/10 text-blue-300' },
  { code: 'LGSM', name: 'Ley General de Sociedades Mercantiles', shortName: 'LGSM (Sociedades)', area: 'mercantil', icon: <Scale size={15} />, activeColor: 'border-blue-500 bg-blue-500/10 text-blue-300' },
  { code: 'LGTOC', name: 'Ley General de Títulos y Operaciones de Crédito', shortName: 'LGTOC (Pagarés)', area: 'mercantil', icon: <Scale size={15} />, activeColor: 'border-blue-500 bg-blue-500/10 text-blue-300' },
  { code: 'CFF', name: 'Código Fiscal de la Federación', shortName: 'CFF (Fiscal)', area: 'fiscal', icon: <ReceiptText size={15} />, activeColor: 'border-teal-500 bg-teal-500/10 text-teal-300' },
  { code: 'LISR', name: 'Ley del Impuesto sobre la Renta', shortName: 'LISR (Renta)', area: 'fiscal', icon: <ReceiptText size={15} />, activeColor: 'border-teal-500 bg-teal-500/10 text-teal-300' },
  { code: 'LIVA', name: 'Ley del Impuesto al Valor Agregado', shortName: 'LIVA (IVA)', area: 'fiscal', icon: <ReceiptText size={15} />, activeColor: 'border-teal-500 bg-teal-500/10 text-teal-300' },
  { code: 'LA', name: 'Ley Aduanera', shortName: 'LA (Aduanal)', area: 'aduanal', icon: <ShipWheel size={15} />, activeColor: 'border-purple-500 bg-purple-500/10 text-purple-300' },
  { code: 'LCE', name: 'Ley de Comercio Exterior', shortName: 'LCE (Comercio Ext.)', area: 'comercio_exterior', icon: <Globe2 size={15} />, activeColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
];

const SUGGESTED_QUERIES = [
  { label: 'Causas de rescisión laboral sin responsabilidad patronal', law: 'LFT', query: 'rescisión sin responsabilidad patrón faltas' },
  { label: 'Requisitos formales indispensables del pagaré', law: 'LGTOC', query: 'requisitos legales del pagaré' },
  { label: 'Requisitos de las deducciones autorizadas en ISR', law: 'LISR', query: 'requisitos de las deducciones autorizadas' },
  { label: 'Plazo y requisitos de rectificación del pedimento aduanal', law: 'LA', query: 'rectificación de datos en el pedimento' },
  { label: 'Convocatoria y quórum de asamblea general ordinaria', law: 'LGSM', query: 'asamblea general ordinaria convocatoria quórum' },
];

export const BuscadorLegal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useUiStore();
  const { setDraftContent, setActiveArea } = useCaseStore();
  const { addToHistory, addToFavorites, isFavorite } = useSearchStore();

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'auto_ai' | 'manual_law'>('auto_ai');
  const [selectedLawCode, setSelectedLawCode] = useState<string>('LFT');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<HybridSearchResult | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [wasmReady, setWasmReady] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRequestedRef = useRef(false);

  // Screen Wake Lock - activate when viewing expanded articles
  useEffect(() => {
    const hasExpandedContent = expandedArticles.size > 0;
    if (hasExpandedContent && !wakeLockRequestedRef.current) {
      wakeLockRequestedRef.current = true;
      requestWakeLock().then((active) => setWakeLockActive(active));
    } else if (!hasExpandedContent && wakeLockActive) {
      releaseWakeLock();
      wakeLockRequestedRef.current = false;
      setWakeLockActive(false);
    }
  }, [expandedArticles.size, wakeLockActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockActive) {
        releaseWakeLock();
      }
    };
  }, [wakeLockActive]);

  // Handle URL params for opening from history/favorites
  useEffect(() => {
    const urlQuery = searchParams.get('query');
    const urlLaw = searchParams.get('law');
    const urlArticle = searchParams.get('article');

    if (urlQuery) {
      setQuery(urlQuery);
      if (urlLaw) setSelectedLawCode(urlLaw);
      setSearchMode(urlLaw ? 'manual_law' : 'auto_ai');
      void handleSearch(urlQuery, urlLaw || undefined);
      setSearchParams({}, { replace: true });
    } else if (urlArticle && urlLaw) {
      // Open specific article - will expand it after search
      setSelectedLawCode(urlLaw);
      setSearchMode('manual_law');
      setQuery(`artículo ${urlArticle}`);
      void handleSearch(`artículo ${urlArticle}`, urlLaw);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Pre-cargar base de datos SQLite WASM en segundo plano
  useEffect(() => {
    getSqliteDb()
      .then(() => setWasmReady(true))
      .catch((err) => console.warn('SQLite WASM precarga:', err));
  }, []);

  const handleSearch = useCallback(async (searchQuery = query, forceLawCode?: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;

    setQuery(clean);
    setIsSearching(true);
    setSearchResult(null);

    const manualLaw = forceLawCode || (searchMode === 'manual_law' ? selectedLawCode : undefined);

    try {
      const result = await executeHybridWasmSearch({
        query: clean,
        manualLawCode: manualLaw,
      });

      setSearchResult(result);

      // Guardar en historial
      addToHistory({
        query: clean,
        lawCode: result.router.targetLawCode,
        lawName: result.router.targetLawName,
        resultCount: result.articles.length,
      });

      // Auto-expandir el primer artículo si es match exacto
      if (result.articles.length > 0) {
        setExpandedArticles(new Set([result.articles[0].id]));
      }
    } catch (err: any) {
      notify(err?.message || 'Error al ejecutar la búsqueda en SQLite WASM.', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [query, searchMode, selectedLawCode, addToHistory, notify]);

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyArticle = async (content: string, title: string) => {
    await navigator.clipboard.writeText(`${title}\n\n${content}`);
    notify('Artículo legal copiado al portapapeles.', 'success');
  };

  const handleShareArticle = async (content: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title}\n\n${content}` });
      } catch {
        // cancelled
      }
    } else {
      await handleCopyArticle(content, title);
    }
  };

  const handleToggleFavorite = (article: LegalArticle) => {
    if (isFavorite(article.id)) {
      useSearchStore.getState().removeFromFavorites(article.id);
      notify('Eliminado de favoritos', 'info');
    } else {
      addToFavorites(article);
      notify('Guardado en favoritos', 'success');
    }
  };

  const handleInsertInDraft = (content: string, title: string, area: LegalEngineeringArea) => {
    const snippet = `\n\n### FUNDAMENTACIÓN NORMATIVA APLICABLE\n**${title}**\n\n"${content}"\n`;
    setDraftContent(snippet);
    setActiveArea(area);
    notify('Artículo copiado para redacción externa.', 'success');
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600">
              <FileSearch size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-950">Búsqueda en Normativa Oficial</h1>
                <span className="rounded-full bg-blue-500/15 text-blue-700 border border-blue-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Cpu size={10} /> SQLite WASM
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                IA en 1ª línea para enrutamiento y búsqueda vectorial local en 1 sola ley
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {wasmReady && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                <Check size={11} /> Motor WASM Listo
              </span>
            )}
            {wakeLockActive && (
              <button
                type="button"
                onClick={() => {
                  if (wakeLockActive) releaseWakeLock(); else requestWakeLock().then(setWakeLockActive);
                }}
                className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 transition cursor-pointer"
                title="Wake Lock activo - pantalla no se apagará. Click para desactivar."
              >
                <Sun size={11} />
                <span>Pantalla activa</span>
              </button>
            )}
          </div>
        </div>

        {/* Selector de Modo de Búsqueda */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Modo de consulta normativa:
            </p>
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('auto_ai');
                  setSearchResult(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  searchMode === 'auto_ai'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={13} className="text-legal-gold" />
                <span>Auto-Enrutador con IA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('manual_law');
                  setSearchResult(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  searchMode === 'manual_law'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen size={13} className="text-blue-400" />
                <span>Selección Manual de Ley</span>
              </button>
            </div>
          </div>

          {/* Chips de Selección Manual de Ley (si está en modo manual) */}
          {searchMode === 'manual_law' && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-slate-600">
                Selecciona la ley específica donde ejecutará SQLite WASM:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                {LAWS_OPTIONS.map((law) => {
                  const active = law.code === selectedLawCode;
                  return (
                    <button
                      key={law.code}
                      type="button"
                      onClick={() => {
                        setSelectedLawCode(law.code);
                        if (query.trim()) void handleSearch(query, law.code);
                      }}
                      className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{law.icon}</span>
                      <span>{law.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra de Búsqueda */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
            className="flex gap-2 pt-1"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="search"
                enterKeyHint="search"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === 'auto_ai'
                    ? 'Escribe tu consulta en lenguaje natural (la IA detectará la ley aplicable)...'
                    : `Buscar en ${LAWS_OPTIONS.find((l) => l.code === selectedLawCode)?.name}...`
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-legal-gold focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white px-4 sm:px-5 py-2.5 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin text-legal-gold" /> : <Zap size={16} className="text-legal-gold" />}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>

          {/* Sugerencias Rápidas */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ejemplos con enrutamiento automático:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item.query);
                    void handleSearch(item.query);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  <strong className="text-slate-900 font-mono">[{item.law}]</strong> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Estado de Carga */}
        {isSearching && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <SearchResultSkeleton />
          </div>
        )}

        {/* Resultados */}
        <AnimatePresence>
          {searchResult && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Tarjeta de Diagnóstico de Enrutamiento IA */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 font-bold">
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {searchResult.mode === 'ai_routed' ? 'Enrutado por IA a:' : 'Búsqueda en:'}
                      </span>
                      <span className="rounded-md bg-blue-600 text-white font-mono px-2 py-0.5 text-[10px] font-bold">
                        {searchResult.router.targetLawCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {searchResult.router.targetLawName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {searchResult.router.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-slate-400 font-mono">
                  <span>Tiempo SQLite WASM: <strong className="text-slate-700">{searchResult.executionTimeMs}ms</strong></span>
                </div>
              </div>

              {/* Lista de Artículos Recuperados */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Artículos oficiales recuperados ({searchResult.articles.length})
                  </h3>
                </div>

                {searchResult.articles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">No se encontraron artículos exactos en {searchResult.router.targetLawName}</p>
                    <p className="text-[11px] text-slate-400">Prueba ajustando los términos de búsqueda o seleccionando otra ley.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {searchResult.articles.map((art) => {
                      const isExpanded = expandedArticles.has(art.id);
                      return (
                        <div
                          key={art.id}
                          className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition"
                        >
                          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2 border-b border-slate-100">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="shrink-0 rounded-lg bg-slate-900 text-legal-gold font-mono px-2.5 py-1 text-xs font-extrabold">
                                {art.articleNumber}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                                {art.title}
                              </span>
                            </div>

                            {/* Acciones Rápidas */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyArticle(art.content, art.title)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Copiar artículo"
                              >
                                <Copy size={13} />
                                <span className="hidden sm:inline">Copiar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShareArticle(art.content, art.title)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Compartir"
                              >
                                <Share2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleFavorite(art)}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isFavorite(art.id)
                                    ? 'text-amber-400'
                                    : 'text-slate-400 hover:text-amber-400'
                                }`}
                                title={isFavorite(art.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                              >
                                <Star size={16} fill="currentColor" className={isFavorite(art.id) ? '' : 'fill-none'} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertInDraft(art.content, art.title, art.area)}
                                className="p-1.5 sm:px-2.5 rounded-lg bg-legal-gold hover:bg-legal-goldhover text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Copiar para redacción"
                              >
                                <FileSignature size={13} />
                                <span className="hidden sm:inline">Copiar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleArticle(art.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Contenido Completo del Artículo */}
                          {isExpanded && (
                            <div className="p-4 sm:p-5 bg-slate-50/50 text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line border-t border-slate-100">
                              {art.content}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
