import { LICITACIONES_DATA } from '../lib/licitaciones-catalog';
import type {
  LicitacionPublica,
  LicitacionSearchFilter,
  LicitacionSearchResult,
} from '../types';

export function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface PreparedLicitacion {
  item: LicitacionPublica;
  title: string;
  description: string;
  numeroProc: string;
  expediente: string;
  convocante: string;
  requisitos: string;
  marcoLegal: string;
  entidad: string;
  siglas: string;
  convocanteName: string;
  fechaPublicacionTime: number;
  fechaLimiteTime: number;
}

export function prepareLicitacion(item: LicitacionPublica): PreparedLicitacion {
  return {
    item,
    title: normalizeText(item.titulo),
    description: normalizeText(item.descripcion),
    numeroProc: normalizeText(item.numeroProcedimiento),
    expediente: normalizeText(item.expediente),
    convocante: normalizeText(`${item.convocante} ${item.siglasConvocante} ${item.unidadCompradora}`),
    requisitos: normalizeText(item.requisitosClave.join(' ')),
    marcoLegal: normalizeText(item.marcoLegal),
    entidad: normalizeText(item.entidadFederativa),
    siglas: normalizeText(item.siglasConvocante),
    convocanteName: normalizeText(item.convocante),
    fechaPublicacionTime: new Date(item.fechaPublicacion).getTime(),
    fechaLimiteTime: item.fechaLimitePropuestas
      ? new Date(item.fechaLimitePropuestas).getTime()
      : Number.POSITIVE_INFINITY,
  };
}

const PREPARED_LICITACIONES: PreparedLicitacion[] = LICITACIONES_DATA.map(prepareLicitacion);

export function calculatePreparedScore(
  prep: PreparedLicitacion,
  normalizedQuery: string,
  tokens: string[],
): number {
  if (!normalizedQuery) return 10;

  let score = 0;

  // Exact matches on procedure number or expediente
  if (prep.numeroProc.includes(normalizedQuery) || prep.expediente.includes(normalizedQuery)) {
    score += 300;
  }

  // Exact match in title
  if (prep.title.includes(normalizedQuery)) {
    score += 150;
  }

  // Exact match in description or convocante
  if (prep.description.includes(normalizedQuery)) {
    score += 70;
  }
  if (prep.convocante.includes(normalizedQuery)) {
    score += 90;
  }

  // Word-by-word token matching
  for (const token of tokens) {
    if (prep.numeroProc.includes(token)) score += 60;
    if (prep.title.includes(token)) score += 30;
    if (prep.convocante.includes(token)) score += 25;
    if (prep.description.includes(token)) score += 12;
    if (prep.requisitos.includes(token)) score += 10;
    if (prep.marcoLegal.includes(token)) score += 8;
    if (prep.entidad.includes(token)) score += 6;
  }

  return score;
}

export function calculateLicitacionScore(
  licitacion: LicitacionPublica,
  query: string,
): number {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(' ').filter((t) => t.length > 1);
  return calculatePreparedScore(prepareLicitacion(licitacion), normalizedQuery, tokens);
}

export async function executeLicitacionesSearch(
  filter: LicitacionSearchFilter = {},
): Promise<LicitacionSearchResult> {
  const startTime = performance.now();
  const query = (filter.query ?? '').trim();
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(' ').filter((t) => t.length > 1);

  let list = PREPARED_LICITACIONES;

  // Filter by materia
  if (filter.materia && filter.materia !== 'todas') {
    list = list.filter((p) => p.item.materia === filter.materia);
  }

  // Filter by caracter
  if (filter.caracter && filter.caracter !== 'todos') {
    list = list.filter((p) => p.item.caracter === filter.caracter);
  }

  // Filter by convocante (siglas or name)
  if (filter.convocante && filter.convocante !== 'todas') {
    const targetConv = normalizeText(filter.convocante);
    list = list.filter((p) =>
      p.siglas.includes(targetConv) || targetConv.includes(p.siglas) || p.convocanteName.includes(targetConv),
    );
  }

  // Filter by entidad federativa (matches specific state or national tenders)
  if (filter.entidadFederativa && filter.entidadFederativa !== 'todas') {
    const targetEnt = normalizeText(filter.entidadFederativa);
    const isTargetNational = targetEnt.includes('nacional') || targetEnt.includes('federal');
    list = list.filter((p) => {
      const isItemNational = p.entidad.includes('nacional') || p.entidad.includes('federal');
      if (isTargetNational && isItemNational) return true;
      if (isTargetNational || isItemNational) return false;
      return p.entidad === targetEnt || p.entidad.includes(targetEnt);
    });
  }

  // Filter by estatus
  if (filter.estatus && filter.estatus !== 'todos') {
    list = list.filter((p) => p.item.estatus === filter.estatus);
  }

  // Score items
  type ScoredPrepared = { prep: PreparedLicitacion; score: number };
  const scoredList: ScoredPrepared[] = [];

  for (const prep of list) {
    const score = calculatePreparedScore(prep, normalizedQuery, tokens);
    if (!normalizedQuery || score > 0) {
      scoredList.push({ prep, score });
    }
  }

  // Sort
  const sortBy = filter.sortBy ?? 'cierre_proximo';
  scoredList.sort((a, b) => {
    if (sortBy === 'relevancia' && normalizedQuery) {
      return b.score - a.score;
    }
    if (sortBy === 'reciente') {
      return b.prep.fechaPublicacionTime - a.prep.fechaPublicacionTime;
    }
    if (sortBy === 'monto_mayor') {
      return (b.prep.item.montoEstimado ?? 0) - (a.prep.item.montoEstimado ?? 0);
    }
    // Default: 'cierre_proximo' (closest deadline first)
    return a.prep.fechaLimiteTime - b.prep.fechaLimiteTime;
  });

  const total = scoredList.length;
  const itemsToReturn = filter.limit ? scoredList.slice(0, filter.limit) : scoredList;
  const licitaciones = itemsToReturn.map(({ prep, score }) => ({
    ...prep.item,
    score,
  }));

  const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));

  return {
    query,
    licitaciones,
    total,
    executionTimeMs,
  };
}
