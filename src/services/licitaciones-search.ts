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

export function calculateLicitacionScore(
  licitacion: LicitacionPublica,
  query: string,
): number {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 10;

  const title = normalizeText(licitacion.titulo);
  const description = normalizeText(licitacion.descripcion);
  const numeroProc = normalizeText(licitacion.numeroProcedimiento);
  const expediente = normalizeText(licitacion.expediente);
  const convocante = normalizeText(`${licitacion.convocante} ${licitacion.siglasConvocante} ${licitacion.unidadCompradora}`);
  const requisitos = normalizeText(licitacion.requisitosClave.join(' '));
  const marcoLegal = normalizeText(licitacion.marcoLegal);
  const entidad = normalizeText(licitacion.entidadFederativa);

  let score = 0;

  // Exact matches on procedure number or expediente
  if (numeroProc.includes(normalizedQuery) || expediente.includes(normalizedQuery)) {
    score += 300;
  }

  // Exact match in title
  if (title.includes(normalizedQuery)) {
    score += 150;
  }

  // Exact match in description or convocante
  if (description.includes(normalizedQuery)) {
    score += 70;
  }
  if (convocante.includes(normalizedQuery)) {
    score += 90;
  }

  // Word-by-word token matching
  const tokens = normalizedQuery
    .split(' ')
    .filter((t) => t.length > 1);

  for (const token of tokens) {
    if (numeroProc.includes(token)) score += 60;
    if (title.includes(token)) score += 30;
    if (convocante.includes(token)) score += 25;
    if (description.includes(token)) score += 12;
    if (requisitos.includes(token)) score += 10;
    if (marcoLegal.includes(token)) score += 8;
    if (entidad.includes(token)) score += 6;
  }

  return score;
}

export async function executeLicitacionesSearch(
  filter: LicitacionSearchFilter = {},
): Promise<LicitacionSearchResult> {
  const startTime = performance.now();
  const query = (filter.query ?? '').trim();
  const normalizedQuery = normalizeText(query);

  let list = LICITACIONES_DATA;

  // Filter by materia
  if (filter.materia && filter.materia !== 'todas') {
    list = list.filter((item) => item.materia === filter.materia);
  }

  // Filter by caracter
  if (filter.caracter && filter.caracter !== 'todos') {
    list = list.filter((item) => item.caracter === filter.caracter);
  }

  // Filter by convocante (siglas or name)
  if (filter.convocante && filter.convocante !== 'todas') {
    const targetConv = normalizeText(filter.convocante);
    list = list.filter((item) => {
      const sig = normalizeText(item.siglasConvocante);
      const name = normalizeText(item.convocante);
      return sig.includes(targetConv) || targetConv.includes(sig) || name.includes(targetConv);
    });
  }

  // Filter by entidad federativa (matches specific state or national tenders)
  if (filter.entidadFederativa && filter.entidadFederativa !== 'todas') {
    const targetEnt = normalizeText(filter.entidadFederativa);
    list = list.filter((item) => {
      const itemEnt = normalizeText(item.entidadFederativa);
      if (targetEnt.includes('nacional') || targetEnt.includes('federal')) {
        return itemEnt.includes('nacional') || itemEnt.includes('federal');
      }
      return itemEnt === targetEnt || itemEnt.includes(targetEnt) || itemEnt.includes('nacional') || itemEnt.includes('federal');
    });
  }

  // Filter by estatus
  if (filter.estatus && filter.estatus !== 'todos') {
    list = list.filter((item) => item.estatus === filter.estatus);
  }

  // Score items
  const scoredItems = list
    .map((item) => ({
      ...item,
      score: calculateLicitacionScore(item, normalizedQuery),
    }))
    .filter((item) => (normalizedQuery ? (item.score ?? 0) > 0 : true));

  // Sort
  const sortBy = filter.sortBy ?? 'cierre_proximo';
  scoredItems.sort((a, b) => {
    if (sortBy === 'relevancia' && normalizedQuery) {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    if (sortBy === 'reciente') {
      return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
    }
    if (sortBy === 'monto_mayor') {
      return (b.montoEstimado ?? 0) - (a.montoEstimado ?? 0);
    }
    // Default: 'cierre_proximo' (closest deadline first)
    const timeA = a.fechaLimitePropuestas
      ? new Date(a.fechaLimitePropuestas).getTime()
      : Number.POSITIVE_INFINITY;
    const timeB = b.fechaLimitePropuestas
      ? new Date(b.fechaLimitePropuestas).getTime()
      : Number.POSITIVE_INFINITY;
    return timeA - timeB;
  });

  const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));

  return {
    query,
    licitaciones: scoredItems,
    total: scoredItems.length,
    executionTimeMs,
  };
}
