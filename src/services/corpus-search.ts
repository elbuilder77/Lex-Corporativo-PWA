import { AREA_LABELS, getCorpusItem } from '../lib/corpus-catalog';
import { searchInAreaLaws, searchInSingleLaw } from './sqlite-db';
import type { CorpusSearchScope, LegalArticle } from '../types';

export interface CorpusSearchResult {
  query: string;
  scope: CorpusSearchScope;
  scopeLabel: string;
  lawCode?: string;
  articles: LegalArticle[];
  executionTimeMs: number;
  engine: 'sqlite_wasm_local';
}

export function extractExplicitArticle(query: string): string | undefined {
  const match = query.match(/\bart(?:[íi]culo)?\.?\s+(\d+(?:\s*(?:bis|ter|qu[aá]ter))?)\b/i);
  const standaloneMatch = query.trim().match(/^(\d+(?:\s*(?:bis|ter|qu[aá]ter))?)$/i);
  return (match?.[1] ?? standaloneMatch?.[1])?.replace(/\s+/g, ' ').toLocaleLowerCase('es-MX');
}

export async function executeCorpusSearch(params: {
  query: string;
  scope?: CorpusSearchScope;
  lawCode?: string;
  limit?: number;
}): Promise<CorpusSearchResult> {
  const query = params.query.trim();
  const scope = params.scope ?? 'todos';
  const startTime = performance.now();
  const candidateArticleNumber = extractExplicitArticle(query);
  const articles = params.lawCode
    ? await searchInSingleLaw({
        targetLawCode: params.lawCode,
        searchTerms: query,
        candidateArticleNumber,
        limit: params.limit,
      })
    : await searchInAreaLaws({
        area: scope,
        searchTerms: query,
        candidateArticleNumber,
        limit: params.limit,
      });

  return {
    query,
    scope,
    scopeLabel: params.lawCode ? getCorpusItem(params.lawCode).name : AREA_LABELS[scope],
    lawCode: params.lawCode,
    articles,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    engine: 'sqlite_wasm_local',
  };
}
