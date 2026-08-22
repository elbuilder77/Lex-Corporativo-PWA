import { routeQueryWithAi, type AiRouterResult } from './ai-router';
import { searchInSingleLaw, type LegalArticle } from './sqlite-db';
import type { LegalEngineeringArea } from '../types';

export interface HybridSearchResult {
  query: string;
  router: AiRouterResult;
  articles: LegalArticle[];
  executionTimeMs: number;
  mode: 'ai_routed' | 'manual_law';
}

export async function executeHybridWasmSearch(params: {
  query: string;
  manualLawCode?: string;
  preferredArea?: LegalEngineeringArea;
}): Promise<HybridSearchResult> {
  const startTime = performance.now();

  let router: AiRouterResult;
  let isManual = false;

  if (params.manualLawCode) {
    isManual = true;
    router = {
      targetLawCode: params.manualLawCode,
      targetLawName: params.manualLawCode,
      area: params.preferredArea || 'laboral',
      normalizedLegalTerms: params.query,
      explanation: `Búsqueda manual dirigida a ${params.manualLawCode}.`,
      confidence: 1.0,
    };
  } else {
    // 1. IA en Primera Línea: Enruta la consulta y extrae ley y términos jurídicos
    router = await routeQueryWithAi({
      query: params.query,
      preferredArea: params.preferredArea,
    });
  }

  // 2. SQLite WASM: Búsqueda Vectorial / Ponderada sobre ESA SOLA LEY
  const articles = await searchInSingleLaw({
    targetLawCode: router.targetLawCode,
    searchTerms: router.normalizedLegalTerms || params.query,
    candidateArticleNumber: router.candidateArticleNumber,
    limit: 5,
  });

  const endTime = performance.now();

  return {
    query: params.query,
    router,
    articles,
    executionTimeMs: Math.round(endTime - startTime),
    mode: isManual ? 'manual_law' : 'ai_routed',
  };
}
