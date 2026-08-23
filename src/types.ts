export type LegalEngineeringArea =
  | 'laboral'
  | 'mercantil'
  | 'fiscal'
  | 'aduanal'
  | 'comercio_exterior';

export type CorpusSearchScope = 'todos' | LegalEngineeringArea;
export type CorpusSourceKind = 'ley' | 'reglamento';

export interface LegalArticle {
  id: string;
  lawCode: string;
  lawName: string;
  articleNumber: string;
  title: string;
  content: string;
  area: LegalEngineeringArea;
  sourceKind: CorpusSourceKind;
  sourceName: string;
  sourceUrl: string;
  score?: number;
}
