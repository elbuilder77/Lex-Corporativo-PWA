import type {
  CorpusSourceKind,
  CorpusSearchScope,
  LegalEngineeringArea,
} from '../types';

export const OFFICIAL_LAWS_URL = 'https://www.diputados.gob.mx/LeyesBiblio/index.htm';
export const OFFICIAL_REGULATIONS_URL = 'https://www.diputados.gob.mx/LeyesBiblio/regla.htm';

export const AREA_LABELS: Record<CorpusSearchScope, string> = {
  todos: 'Todos los ordenamientos incluidos',
  laboral: 'Laboral',
  mercantil: 'Mercantil',
  fiscal: 'Fiscal',
  aduanal: 'Aduanal',
  comercio_exterior: 'Comercio exterior',
};

export interface CorpusCatalogItem {
  code: string;
  name: string;
  area: LegalEngineeringArea;
  sourceKind: CorpusSourceKind;
  sourceName: string;
  sourceUrl: string;
  provisionCount: number;
}

const lawsSource = {
  sourceKind: 'ley' as const,
  sourceName: 'Cámara de Diputados · Leyes Federales',
  sourceUrl: OFFICIAL_LAWS_URL,
};

const regulationsSource = {
  sourceKind: 'reglamento' as const,
  sourceName: 'Cámara de Diputados · Reglamentos de Leyes Federales',
  sourceUrl: OFFICIAL_REGULATIONS_URL,
};

export const CORPUS_CATALOG: CorpusCatalogItem[] = [
  { code: 'LFT', name: 'Ley Federal del Trabajo', area: 'laboral', provisionCount: 1078, ...lawsSource },
  { code: 'CCom', name: 'Código de Comercio', area: 'mercantil', provisionCount: 1526, ...lawsSource },
  { code: 'LGSM', name: 'Ley General de Sociedades Mercantiles', area: 'mercantil', provisionCount: 275, ...lawsSource },
  { code: 'LGTOC', name: 'Ley General de Títulos y Operaciones de Crédito', area: 'mercantil', provisionCount: 439, ...lawsSource },
  { code: 'CFF', name: 'Código Fiscal de la Federación', area: 'fiscal', provisionCount: 274, ...lawsSource },
  { code: 'LISR', name: 'Ley del Impuesto sobre la Renta', area: 'fiscal', provisionCount: 215, ...lawsSource },
  { code: 'LIVA', name: 'Ley del Impuesto al Valor Agregado', area: 'fiscal', provisionCount: 43, ...lawsSource },
  { code: 'RLISR', name: 'Reglamento de la Ley del Impuesto sobre la Renta', area: 'fiscal', provisionCount: 313, ...regulationsSource },
  { code: 'RLIVA', name: 'Reglamento de la Ley del Impuesto al Valor Agregado', area: 'fiscal', provisionCount: 79, ...regulationsSource },
  { code: 'LA', name: 'Ley Aduanera', area: 'aduanal', provisionCount: 208, ...lawsSource },
  { code: 'RLA', name: 'Reglamento de la Ley Aduanera', area: 'aduanal', provisionCount: 248, ...regulationsSource },
  { code: 'LCE', name: 'Ley de Comercio Exterior', area: 'comercio_exterior', provisionCount: 98, ...lawsSource },
  { code: 'RLCE', name: 'Reglamento de la Ley de Comercio Exterior', area: 'comercio_exterior', provisionCount: 215, ...regulationsSource },
];

export const CORPUS_STATS = {
  instruments: CORPUS_CATALOG.length,
  provisions: CORPUS_CATALOG.reduce((total, item) => total + item.provisionCount, 0),
  areas: 5,
};

const corpusByCode = new Map(CORPUS_CATALOG.map((item) => [item.code, item]));

export function getCorpusItem(lawCode: string): CorpusCatalogItem {
  const item = corpusByCode.get(lawCode);
  if (!item) throw new Error(`Ordenamiento no registrado en el catálogo: ${lawCode}`);
  return item;
}

export function getLawsForScope(scope: CorpusSearchScope): CorpusCatalogItem[] {
  return scope === 'todos' ? CORPUS_CATALOG : CORPUS_CATALOG.filter((item) => item.area === scope);
}
