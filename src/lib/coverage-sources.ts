export type ProcurementSourceStatus = 'available' | 'prioritized';

export interface ProcurementSource {
  id: string;
  territory: string;
  scope: 'Federal' | 'Estatal';
  sourceName: string;
  sourceUrl: string;
  status: ProcurementSourceStatus;
  description: string;
}

export const PROCUREMENT_SOURCES: ProcurementSource[] = [
  {
    id: 'federal',
    territory: 'México',
    scope: 'Federal',
    sourceName: 'ComprasMX · CompraNet',
    sourceUrl: 'https://comprasmx.buengobierno.gob.mx',
    status: 'available',
    description: 'Procedimientos federales consultables en el catálogo actual, con cotejo en el expediente oficial.',
  },
  {
    id: 'nuevo-leon',
    territory: 'Nuevo León',
    scope: 'Estatal',
    sourceName: 'Licitaciones públicas · Gobierno de Nuevo León',
    sourceUrl: 'https://www.nl.gob.mx/es/licitaciones-publicas',
    status: 'prioritized',
    description: 'Convocatorias y subastas de las dependencias centrales. Conector estatal priorizado.',
  },
  {
    id: 'yucatan',
    territory: 'Yucatán',
    scope: 'Estatal',
    sourceName: 'Plataforma de Adquisiciones · Gobierno de Yucatán',
    sourceUrl: 'https://adquisiciones.yucatan.gob.mx/',
    status: 'prioritized',
    description: 'Concursos, convocatorias y licitaciones en proceso. Conector estatal priorizado.',
  },
  {
    id: 'jalisco',
    territory: 'Jalisco',
    scope: 'Estatal',
    sourceName: 'Sistema Electrónico de Compras Gubernamentales',
    sourceUrl: 'https://compras.jalisco.gob.mx/',
    status: 'prioritized',
    description: 'Procesos de compra, bases y etapas de licitación. Conector estatal priorizado.',
  },
  {
    id: 'cdmx',
    territory: 'Ciudad de México',
    scope: 'Estatal',
    sourceName: 'Tianguis Digital · Gobierno de la Ciudad de México',
    sourceUrl: 'https://tianguisdigital.cdmx.gob.mx/',
    status: 'prioritized',
    description: 'Convocatorias y oportunidades de contratación pública. Conector local priorizado.',
  },
];

export const COVERAGE_SUMMARY = {
  available: PROCUREMENT_SOURCES.filter((source) => source.status === 'available').length,
  prioritized: PROCUREMENT_SOURCES.filter((source) => source.status === 'prioritized').length,
};

const RETIRED_SAVED_KEYS = ['lex_pwa_favorites_v2', 'lex_pwa_fav_licitaciones_v2'];

export function clearRetiredSavedData(): void {
  try {
    RETIRED_SAVED_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* almacenamiento no disponible */
  }
}
