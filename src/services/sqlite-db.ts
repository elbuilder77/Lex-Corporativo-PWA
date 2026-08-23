import initSqlJs, { type Database } from 'sql.js';
import { getCorpusItem } from '../lib/corpus-catalog';
import type { CorpusSearchScope, LegalArticle, LegalEngineeringArea } from '../types';

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

const CORPUS_FILES: Array<{ file: string; area: LegalEngineeringArea }> = [
  { file: '/corpus/laboral.json', area: 'laboral' },
  { file: '/corpus/mercantil.json', area: 'mercantil' },
  { file: '/corpus/fiscal.json', area: 'fiscal' },
  { file: '/corpus/aduanal.json', area: 'aduanal' },
  { file: '/corpus/comercio_exterior.json', area: 'comercio_exterior' },
];

type RawLegalArticle = Omit<LegalArticle, 'sourceKind' | 'sourceName' | 'sourceUrl'>;

const SEARCH_STOP_WORDS = new Set([
  'art', 'articulo', 'cual', 'cuales', 'como', 'con', 'del', 'desde', 'donde', 'esta',
  'este', 'estos', 'las', 'los', 'para', 'por', 'que', 'segun', 'sin', 'son', 'sus', 'una',
]);

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toLegalArticle(row: Record<string, unknown>): LegalArticle {
  const lawCode = row.law_code as string;
  const source = getCorpusItem(lawCode);
  return {
    id: row.id as string,
    lawCode,
    lawName: row.law_name as string,
    articleNumber: row.article_number as string,
    title: row.title as string,
    content: row.content as string,
    area: row.area as LegalEngineeringArea,
    sourceKind: source.sourceKind,
    sourceName: source.sourceName,
    sourceUrl: source.sourceUrl,
    score: row.rank as number,
  };
}

export function calculateLegalScore(
  content: string,
  title: string,
  articleNumber: string,
  normalizedQuery: string,
  targetArticle: string,
): number {
  const normalizedTitle = normalizeText(title);
  const body = normalizeText(`${title} ${content}`);
  const article = normalizeText(articleNumber).match(/\d+(?:\s+(?:bis|ter|quater))?/)?.[0] ?? '';
  const terms = normalizedQuery
    .split(' ')
    .filter((term) => term.length > 2 && !SEARCH_STOP_WORDS.has(term));
  let score = 0;
  if (targetArticle && article === targetArticle) score += 250;
  if (terms.length && normalizedQuery && body.includes(normalizedQuery)) score += 80;
  for (const term of terms) {
    if (normalizedTitle.includes(term)) score += 22;
    if (body.includes(term)) score += 10;
  }
  return score;
}

export async function getSqliteDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs({ locateFile: () => '/wasm/sql-wasm.wasm' });
    const db = new SQL.Database();
    db.run(`
      CREATE TABLE provisions (
        id TEXT PRIMARY KEY,
        law_code TEXT NOT NULL,
        law_name TEXT NOT NULL,
        article_number TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        area TEXT NOT NULL
      );
      CREATE INDEX idx_provisions_law ON provisions(law_code);
      CREATE INDEX idx_provisions_area ON provisions(area);
    `);

    db.create_function('legal_score', calculateLegalScore);

    const statement = db.prepare(`
      INSERT OR REPLACE INTO provisions
      (id, law_code, law_name, article_number, title, content, area)
      VALUES ($id, $law_code, $law_name, $article_number, $title, $content, $area)
    `);

    try {
      for (const item of CORPUS_FILES) {
        const response = await fetch(item.file);
        if (!response.ok) throw new Error(`No se pudo cargar ${item.file} (${response.status})`);
        const articles = (await response.json()) as RawLegalArticle[];
        for (const article of articles) {
          statement.run({
            $id: article.id,
            $law_code: article.lawCode,
            $law_name: article.lawName,
            $article_number: article.articleNumber,
            $title: article.title,
            $content: article.content,
            $area: article.area || item.area,
          });
        }
      }
    } finally {
      statement.free();
    }

    dbInstance = db;
    return db;
  })().catch((error) => {
    initPromise = null;
    console.error('No se pudo inicializar el corpus local:', error);
    throw error;
  });

  return initPromise;
}

interface SearchParams {
  searchTerms: string;
  candidateArticleNumber?: string;
  limit?: number;
}

async function runSearch(params: SearchParams & { lawCode?: string; area?: CorpusSearchScope }): Promise<LegalArticle[]> {
  const db = await getSqliteDb();
  const normalizedQuery = normalizeText(params.searchTerms);
  const targetArticle = normalizeText(params.candidateArticleNumber ?? '');
  const filters: string[] = [];
  if (params.lawCode) filters.push('law_code = :lawCode');
  if (params.area && params.area !== 'todos') filters.push('area = :area');
  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const statement = db.prepare(`
    SELECT * FROM (
      SELECT id, law_code, law_name, article_number, title, content, area,
             legal_score(content, title, article_number, :query, :targetArticle) AS rank
      FROM provisions
      ${whereClause}
    )
    WHERE rank > 0
    ORDER BY rank DESC, law_code ASC, article_number ASC
    LIMIT :limit
  `);

  const bindings: Record<string, string | number> = {
    ':query': normalizedQuery,
    ':targetArticle': targetArticle,
    ':limit': params.limit ?? 20,
  };
  if (params.lawCode) bindings[':lawCode'] = params.lawCode;
  if (params.area && params.area !== 'todos') bindings[':area'] = params.area;
  statement.bind(bindings);

  const results: LegalArticle[] = [];
  try {
    while (statement.step()) results.push(toLegalArticle(statement.getAsObject()));
  } finally {
    statement.free();
  }
  return results;
}

export function searchInSingleLaw(params: SearchParams & { targetLawCode: string }): Promise<LegalArticle[]> {
  return runSearch({ ...params, lawCode: params.targetLawCode });
}

export function searchInAreaLaws(params: SearchParams & { area: CorpusSearchScope }): Promise<LegalArticle[]> {
  return runSearch(params);
}
