import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  DollarSign,
  ExternalLink,
  FileCheck2,
  FileSearch,
  Filter,
  Flame,
  Heart,
  Landmark,
  LoaderCircle,
  MapPin,
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
import {
  CARACTER_LABELS,
  COMPRANET_PORTAL_URL,
  ESTATUS_LABELS,
  formatCurrency,
  formatDate,
  formatDateTime,
  getAvailableConvocantes,
  getAvailableEntidades,
  getDaysRemaining,
  LICITACIONES_STATS,
  MATERIA_LABELS,
  TIPO_PROCEDIMIENTO_LABELS,
} from '../lib/licitaciones-catalog';
import { executeLicitacionesSearch } from '../services/licitaciones-search';
import { useSearchStore } from '../store/useSearchStore';
import { useUiStore } from '../store/useUiStore';
import type {
  LicitacionCaracter,
  LicitacionEstatus,
  LicitacionMateria,
  LicitacionPublica,
  LicitacionSearchResult,
} from '../types';

const SUGGESTED_LICITACIONES = [
  { label: 'Medicamentos IMSS', query: 'medicamentos', convocante: 'IMSS' },
  { label: 'Subestaciones CFE', query: 'subestaciones', convocante: 'CFE' },
  { label: 'Puentes y Carreteras SICT', query: 'carretero puente', convocante: 'SICT' },
  { label: 'Ciberseguridad SAT', query: 'ciberseguridad', convocante: 'SAT' },
  { label: 'Arrendamiento PEMEX', query: 'perforación', convocante: 'PEMEX' },
  { label: 'Flotilla Vehicular', query: 'vehículos', materia: 'arrendamientos' as const },
  { label: 'Hospitales ISSSTE', query: 'laboratorio clínico', convocante: 'ISSSTE' },
  { label: 'Agua Cutzamala', query: 'bombeo cutzamala', convocante: 'CONAGUA' },
];

function licitacionPlainText(licitacion: LicitacionPublica): string {
  const daysInfo = getDaysRemaining(licitacion.fechaLimitePropuestas);
  return `FICHA DE LICITACIÓN PÚBLICA — MÉXICO (COMPRANET)
==================================================
Procedimiento: ${licitacion.numeroProcedimiento}
Expediente: ${licitacion.expediente}
Título: ${licitacion.titulo}
Convocante: ${licitacion.convocante} (${licitacion.siglasConvocante})
Unidad Compradora: ${licitacion.unidadCompradora}

Materia: ${MATERIA_LABELS[licitacion.materia]}
Carácter: ${CARACTER_LABELS[licitacion.caracter]}
Tipo: ${TIPO_PROCEDIMIENTO_LABELS[licitacion.tipoProcedimiento]}
Estatus: ${ESTATUS_LABELS[licitacion.estatus]}
Entidad: ${licitacion.entidadFederativa}

FECHAS CRÍTICAS:
- Publicación: ${formatDate(licitacion.fechaPublicacion)}
${licitacion.fechaJuntaAclaraciones ? `- Junta de aclaraciones: ${formatDate(licitacion.fechaJuntaAclaraciones)}\n` : ''}- Límite presentación de propuestas: ${formatDateTime(licitacion.fechaLimitePropuestas)} (${daysInfo.label})
${licitacion.fechaFallo ? `- Fallo estimado: ${formatDate(licitacion.fechaFallo)}\n` : ''}
PRESUPUESTO:
${licitacion.montoEstimado ? formatCurrency(licitacion.montoEstimado, licitacion.moneda) : 'No especificado'}

MARCO LEGAL:
${licitacion.marcoLegal}

REQUISITOS CLAVE:
${licitacion.requisitosClave.map((r) => `• ${r}`).join('\n')}

Enlace oficial en CompraNet:
${licitacion.enlaceCompraNet}`;
}

export function BuscadorLicitaciones() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [query, setQuery] = useState(searchParams.get('lq') ?? '');
  const [materia, setMateria] = useState<'todas' | LicitacionMateria>(
    (searchParams.get('materia') as LicitacionMateria) || 'todas',
  );
  const [caracter, setCaracter] = useState<'todos' | LicitacionCaracter>(
    (searchParams.get('caracter') as LicitacionCaracter) || 'todos',
  );
  const [convocante, setConvocante] = useState(searchParams.get('convocante') ?? 'todas');
  const [entidad, setEntidad] = useState(searchParams.get('entidad') ?? 'todas');
  const [estatus, setEstatus] = useState<'todos' | LicitacionEstatus>(
    (searchParams.get('estatus') as LicitacionEstatus) || 'todos',
  );
  const [sortBy, setSortBy] = useState<'cierre_proximo' | 'reciente' | 'monto_mayor' | 'relevancia'>(
    'cierre_proximo',
  );

  const [showFilters, setShowFilters] = useState(false);
  const [result, setResult] = useState<LicitacionSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { isOnline, notify } = useUiStore();
  const {
    addToFavoriteLicitaciones,
    removeFromFavoriteLicitaciones,
    isFavoriteLicitacion,
  } = useSearchStore();

  const availableConvocantes = useMemo(() => getAvailableConvocantes(), []);
  const availableEntidades = useMemo(() => getAvailableEntidades(), []);

  const performSearch = async (
    q: string,
    mat: 'todas' | LicitacionMateria,
    car: 'todos' | LicitacionCaracter,
    conv: string,
    ent: string,
    est: 'todos' | LicitacionEstatus,
    sort: 'cierre_proximo' | 'reciente' | 'monto_mayor' | 'relevancia',
  ) => {
    setIsSearching(true);
    try {
      const searchResult = await executeLicitacionesSearch({
        query: q,
        materia: mat,
        caracter: car,
        convocante: conv !== 'todas' ? conv : undefined,
        entidadFederativa: ent !== 'todas' ? ent : undefined,
        estatus: est !== 'todos' ? est : undefined,
        sortBy: sort,
      });
      setResult(searchResult);

      const url = new URL(window.location.href);
      if (q.trim()) url.searchParams.set('lq', q.trim());
      else url.searchParams.delete('lq');
      if (mat !== 'todas') url.searchParams.set('materia', mat);
      else url.searchParams.delete('materia');
      if (car !== 'todos') url.searchParams.set('caracter', car);
      else url.searchParams.delete('caracter');
      if (conv !== 'todas') url.searchParams.set('convocante', conv);
      else url.searchParams.delete('convocante');
      if (ent !== 'todas') url.searchParams.set('entidad', ent);
      else url.searchParams.delete('entidad');
      if (est !== 'todos') url.searchParams.set('estatus', est);
      else url.searchParams.delete('estatus');
      window.history.replaceState(null, '', url);
    } catch {
      notify('No se pudieron cargar las licitaciones.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Initial load
  useEffect(() => {
    void performSearch(query, materia, caracter, convocante, entidad, estatus, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    void performSearch(query, materia, caracter, convocante, entidad, estatus, sortBy);
  };

  const handleFilterChange = (
    nextMateria = materia,
    nextCaracter = caracter,
    nextConvocante = convocante,
    nextEntidad = entidad,
    nextEstatus = estatus,
    nextSort = sortBy,
  ) => {
    setMateria(nextMateria);
    setCaracter(nextCaracter);
    setConvocante(nextConvocante);
    setEntidad(nextEntidad);
    setEstatus(nextEstatus);
    setSortBy(nextSort);
    void performSearch(
      query,
      nextMateria,
      nextCaracter,
      nextConvocante,
      nextEntidad,
      nextEstatus,
      nextSort,
    );
  };

  const handleSuggestionClick = (sugQuery: string, sugConvocante?: string, sugMateria?: LicitacionMateria) => {
    setQuery(sugQuery);
    const nextMat = sugMateria ?? 'todas';
    const nextConv = sugConvocante ?? 'todas';
    setMateria(nextMat);
    setConvocante(nextConv);
    void performSearch(sugQuery, nextMat, caracter, nextConv, entidad, estatus, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setQuery('');
    setMateria('todas');
    setCaracter('todos');
    setConvocante('todas');
    setEntidad('todas');
    setEstatus('todos');
    setSortBy('cierre_proximo');
    void performSearch('', 'todas', 'todos', 'todas', 'todas', 'todos', 'cierre_proximo');
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    materia !== 'todas' ||
    caracter !== 'todos' ||
    convocante !== 'todas' ||
    entidad !== 'todas' ||
    estatus !== 'todos' ||
    sortBy !== 'cierre_proximo';

  const copyLicitacion = async (licitacion: LicitacionPublica) => {
    try {
      await navigator.clipboard.writeText(licitacionPlainText(licitacion));
      setCopiedId(licitacion.id);
      window.setTimeout(() => setCopiedId(null), 1800);
      notify('Ficha técnica copiada al portapapeles.', 'success');
    } catch {
      notify('El navegador no permitió copiar el texto.', 'error');
    }
  };

  const shareLicitacion = async (licitacion: LicitacionPublica) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${licitacion.siglasConvocante} · ${licitacion.numeroProcedimiento}`,
          text: `${licitacion.titulo}\nLímite: ${formatDateTime(licitacion.fechaLimitePropuestas)}\n${licitacion.enlaceCompraNet}`,
        });
      } else {
        await copyLicitacion(licitacion);
      }
    } catch (shareError) {
      if ((shareError as Error).name !== 'AbortError') {
        notify('No fue posible compartir la licitación.', 'error');
      }
    }
  };

  const toggleFavorite = (licitacion: LicitacionPublica) => {
    if (isFavoriteLicitacion(licitacion.id)) {
      removeFromFavoriteLicitaciones(licitacion.id);
      notify('Licitación eliminada de seguimiento.', 'info');
    } else {
      addToFavoriteLicitaciones(licitacion);
      notify('Licitación guardada en seguimiento local.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Banner Section */}
      <section className="border-b border-slate-800 bg-legal-shell text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              {/* Brand Logo & CompraNet Badge */}
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
                <div className="flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-950/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-300">
                  <Landmark size={14} /> Contrataciones Públicas · CompraNet
                </div>
              </div>

              <h1 className="font-serif text-2xl font-bold leading-tight sm:text-3xl text-white">
                Buscador de Licitaciones Abiertas en México
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Consulta convocatorias activas, pliegos de requisitos y expedientes de contratación del
                Gobierno Federal, IMSS, CFE, PEMEX, SICT y dependencias estatales con enlace directo a
                CompraNet.
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
              {isOnline ? 'Conexión CompraNet activa' : 'Consulta local disponible'}
            </div>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-3 shadow-2xl shadow-black/20 sm:p-4"
          >
            <label htmlFor="licitacion-query" className="mb-2 block text-xs font-bold text-slate-200">
              ¿Qué licitación, insumo o servicio buscas?
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  id="licitacion-query"
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ej. medicamentos, software, mantenimiento, obra civil o número de procedimiento"
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
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition sm:min-w-fit ${
                  showFilters
                    ? 'border-legal-gold bg-legal-gold/20 text-legal-gold'
                    : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Filter size={16} /> Filtros {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-legal-gold" />}
              </button>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
              <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Materia:
              </span>
              {(Object.entries(MATERIA_LABELS) as Array<['todas' | LicitacionMateria, string]>).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleFilterChange(key)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      materia === key
                        ? 'bg-legal-gold text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>

            {/* Collapsible Extended Filters */}
            {showFilters && (
              <div className="mt-4 grid gap-3 border-t border-slate-700/80 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs font-bold text-slate-300">
                  Carácter
                  <select
                    value={caracter}
                    onChange={(e) =>
                      handleFilterChange(
                        materia,
                        e.target.value as 'todos' | LicitacionCaracter,
                        convocante,
                        entidad,
                        estatus,
                        sortBy,
                      )
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-sm text-white focus:border-legal-gold focus:outline-none"
                  >
                    {(Object.entries(CARACTER_LABELS) as Array<['todos' | LicitacionCaracter, string]>).map(
                      ([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-300">
                  Dependencia / Convocante
                  <select
                    value={convocante}
                    onChange={(e) =>
                      handleFilterChange(materia, caracter, e.target.value, entidad, estatus, sortBy)
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-sm text-white focus:border-legal-gold focus:outline-none"
                  >
                    <option value="todas">Todas las dependencias</option>
                    {availableConvocantes.map((c) => (
                      <option key={c.siglas} value={c.siglas}>
                        {c.siglas} · {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-300">
                  Entidad Federativa
                  <select
                    value={entidad}
                    onChange={(e) =>
                      handleFilterChange(materia, caracter, convocante, e.target.value, estatus, sortBy)
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-sm text-white focus:border-legal-gold focus:outline-none"
                  >
                    <option value="todas">Todas las entidades</option>
                    {availableEntidades.map((ent) => (
                      <option key={ent} value={ent}>
                        {ent}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-300">
                  Ordenar por
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleFilterChange(
                        materia,
                        caracter,
                        convocante,
                        entidad,
                        estatus,
                        e.target.value as 'cierre_proximo' | 'reciente' | 'monto_mayor' | 'relevancia',
                      )
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 text-sm text-white focus:border-legal-gold focus:outline-none"
                  >
                    <option value="cierre_proximo">🔥 Fecha límite más próxima (urgente)</option>
                    <option value="reciente">📅 Publicación más reciente</option>
                    <option value="monto_mayor">💰 Mayor monto estimado</option>
                    <option value="relevancia">🎯 Relevancia de búsqueda</option>
                  </select>
                </label>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Results Header */}
        {result && (
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-extrabold text-slate-950">
                {result.total} {result.total === 1 ? 'licitación encontrada' : 'licitaciones abiertas encontradas'}
                {query.trim() && <span> para “{result.query}”</span>}
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                {result.executionTimeMs} ms
              </span>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw size={13} /> Limpiar filtros
                </button>
              )}
              <a
                href={COMPRANET_PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
              >
                Portal CompraNet <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}

        {/* Empty State */}
        {result && result.licitaciones.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileSearch className="mx-auto text-slate-400" size={36} />
            <h2 className="mt-3 text-base font-extrabold text-slate-900">
              No se encontraron licitaciones con estos criterios
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              Prueba modificando las palabras clave, seleccionando “Todas las materias” o quitando los
              filtros de dependencia y entidad.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-slate-800"
            >
              <RotateCcw size={15} /> Restablecer búsqueda
            </button>
          </div>
        )}

        {/* Tender Cards List */}
        {result && result.licitaciones.length > 0 && (
          <div className="space-y-4" aria-live="polite">
            {/* When not filtering with query, show the Branded Quick Showcase on top */}
            {!query.trim() && !hasActiveFilters && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7 mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-legal-gold/40 bg-slate-950 p-1 shadow-lg shadow-legal-gold/10">
                    <img src={logoMark} alt="Lex Corporativo" className="h-full w-full rounded-xl object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <img
                      src={logoLockup}
                      alt="Lex Corporativo"
                      className="h-7 object-contain mb-1.5 mx-auto sm:mx-0"
                    />
                    <h3 className="font-serif text-base font-bold text-slate-950 sm:text-lg">
                      Licitaciones y Contrataciones Públicas de México
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Explora {LICITACIONES_STATS.total} convocatorias y expedientes abiertos de {LICITACIONES_STATS.convocantes} dependencias federales y estatales (IMSS, CFE, PEMEX, SICT, SAT, etc.).
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        <Zap size={13} className="text-amber-600" /> Monitoreo CompraNet
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        <Scale size={13} className="text-legal-golddark" /> LAASSP & LOPSRM
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        <ShieldCheck size={13} className="text-emerald-600" /> Datos 100% en dispositivo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Suggestions Pills */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles size={15} className="text-legal-golddark" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sugerencias de búsqueda en licitaciones:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_LICITACIONES.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(item.query, item.convocante, item.materia)}
                        className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-legal-gold hover:bg-amber-50/60 hover:text-slate-950 transition"
                      >
                        <Search size={12} className="text-slate-400 group-hover:text-legal-golddark" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result.licitaciones.map((licitacion) => {
              const isExpanded = expanded.has(licitacion.id);
              const favorite = isFavoriteLicitacion(licitacion.id);
              const daysInfo = getDaysRemaining(licitacion.fechaLimitePropuestas);

              return (
                <article
                  key={licitacion.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
                >
                  <div className="p-4 sm:p-6">
                    {/* Header line: Tags & Countdown */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-slate-950 px-2 py-1 text-[11px] font-extrabold tracking-wide text-white">
                          {licitacion.siglasConvocante}
                        </span>
                        <span className="rounded-md bg-amber-50 px-2 py-1 font-mono text-[11px] font-bold text-amber-900 border border-amber-200/60">
                          {licitacion.numeroProcedimiento}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 uppercase">
                          {MATERIA_LABELS[licitacion.materia]}
                        </span>
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                          {CARACTER_LABELS[licitacion.caracter]}
                        </span>
                      </div>

                      {/* Deadline Countdown Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                          daysInfo.badgeStyle === 'urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : daysInfo.badgeStyle === 'warning'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {daysInfo.badgeStyle === 'urgent' ? (
                          <Flame size={14} className="text-red-600 animate-pulse" />
                        ) : (
                          <Clock3 size={14} />
                        )}
                        <span>{daysInfo.label}</span>
                      </div>
                    </div>

                    {/* Title and Top Convocante */}
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-extrabold leading-snug text-slate-950 sm:text-lg">
                          {licitacion.titulo}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <span>{licitacion.convocante}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{licitacion.unidadCompradora}</span>
                        </p>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex shrink-0 items-center gap-1 self-start">
                        <button
                          type="button"
                          onClick={() => copyLicitacion(licitacion)}
                          className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Copiar ficha técnica"
                          aria-label="Copiar ficha técnica de licitación"
                        >
                          {copiedId === licitacion.id ? (
                            <Check size={18} className="text-emerald-600" />
                          ) : (
                            <Copy size={18} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => shareLicitacion(licitacion)}
                          className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          title="Compartir licitación"
                          aria-label="Compartir licitación"
                        >
                          <Share2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(licitacion)}
                          className={`flex min-h-10 min-w-10 items-center justify-center rounded-xl hover:bg-rose-50 ${
                            favorite ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                          }`}
                          title={favorite ? 'Quitar de seguimiento' : 'Guardar en seguimiento'}
                          aria-label={favorite ? 'Quitar de seguimiento' : 'Guardar en seguimiento'}
                        >
                          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Key Info Metrics Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <DollarSign size={12} className="text-slate-400" /> Presupuesto Estimado
                        </span>
                        <p className="mt-1 font-mono text-xs font-extrabold text-slate-900 sm:text-sm">
                          {licitacion.montoEstimado
                            ? formatCurrency(licitacion.montoEstimado, licitacion.moneda)
                            : 'No especificado'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <MapPin size={12} className="text-slate-400" /> Entidad Federativa
                        </span>
                        <p className="mt-1 text-xs font-extrabold text-slate-900 sm:text-sm">
                          {licitacion.entidadFederativa}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <Calendar size={12} className="text-slate-400" /> Presentación y Apertura
                        </span>
                        <p className="mt-1 text-xs font-extrabold text-slate-900 sm:text-sm">
                          {formatDate(licitacion.fechaLimitePropuestas)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <Scale size={12} className="text-slate-400" /> Estatus
                        </span>
                        <p className="mt-1 text-xs font-extrabold text-slate-900 sm:text-sm">
                          {ESTATUS_LABELS[licitacion.estatus]}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p
                      className={`mt-3 text-xs leading-6 text-slate-700 sm:text-sm ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {licitacion.descripcion}
                    </p>

                    {/* Expanded details: Timeline, Legal basis, Requirements */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        {/* Critical Timeline */}
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                            Cronograma del Procedimiento
                          </h4>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                            <div className="rounded-lg bg-white p-2 border border-slate-200/80">
                              <span className="text-[10px] font-semibold text-slate-500">Publicación</span>
                              <p className="text-xs font-bold text-slate-900">
                                {formatDate(licitacion.fechaPublicacion)}
                              </p>
                            </div>
                            {licitacion.fechaJuntaAclaraciones && (
                              <div className="rounded-lg bg-white p-2 border border-slate-200/80">
                                <span className="text-[10px] font-semibold text-slate-500">
                                  Junta de Aclaraciones
                                </span>
                                <p className="text-xs font-bold text-slate-900">
                                  {formatDate(licitacion.fechaJuntaAclaraciones)}
                                </p>
                              </div>
                            )}
                            <div className="rounded-lg bg-white p-2 border border-slate-200/80">
                              <span className="text-[10px] font-semibold text-slate-500">
                                Límite de Propuestas
                              </span>
                              <p className="text-xs font-bold text-slate-900">
                                {formatDateTime(licitacion.fechaLimitePropuestas)}
                              </p>
                            </div>
                            {licitacion.fechaFallo && (
                              <div className="rounded-lg bg-white p-2 border border-slate-200/80">
                                <span className="text-[10px] font-semibold text-slate-500">Fallo Estimado</span>
                                <p className="text-xs font-bold text-slate-900">
                                  {formatDate(licitacion.fechaFallo)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Legal Framework & Requirements */}
                        <div className="grid gap-3 pt-2 sm:grid-cols-2">
                          <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                            <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                              <Scale size={14} className="text-legal-golddark" /> Fundamento Jurídico
                            </span>
                            <p className="mt-1 text-xs text-slate-700 leading-5">
                              {licitacion.marcoLegal}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white p-3 border border-slate-200/80">
                            <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                              <FileCheck2 size={14} className="text-emerald-700" /> Requisitos Clave
                            </span>
                            <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                              {licitacion.requisitosClave.map((req, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Attachments */}
                        {licitacion.anexosDisponibles.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              Documentos y anexos en CompraNet:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {licitacion.anexosDisponibles.map((anexo, i) => (
                                <span
                                  key={i}
                                  className="rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200"
                                >
                                  📄 {anexo}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <a
                        href={licitacion.enlaceCompraNet}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition"
                      >
                        <ExternalLink size={15} /> Ver expediente en CompraNet
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((current) => {
                            const next = new Set(current);
                            if (next.has(licitacion.id)) next.delete(licitacion.id);
                            else next.add(licitacion.id);
                            return next;
                          })
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? 'Contraer ficha' : 'Ver requisitos y cronograma completo'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="rounded-xl border border-blue-200/70 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-950">
              <strong>Nota de consulta:</strong> La información de procedimientos y plazos corresponde a
              las convocatorias públicas federales. Antes de presentar propuestas, valida las aclaraciones
              y modificaciones vigentes en la plataforma oficial de CompraNet.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
