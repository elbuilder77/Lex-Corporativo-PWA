import initSqlJs, { type Database } from 'sql.js';
import type { LegalEngineeringArea } from '../types';

export interface LegalArticle {
  id: string;
  lawCode: string;
  lawName: string;
  articleNumber: string;
  title: string;
  content: string;
  area: LegalEngineeringArea;
  score?: number;
}

let dbInstance: Database | null = null;
let isInitializing = false;
let initPromise: Promise<Database> | null = null;

const CORPUS_FILES: Array<{ file: string; area: LegalEngineeringArea }> = [
  { file: '/corpus/laboral.json', area: 'laboral' },
  { file: '/corpus/mercantil.json', area: 'mercantil' },
  { file: '/corpus/fiscal.json', area: 'fiscal' },
  { file: '/corpus/aduanal.json', area: 'aduanal' },
  { file: '/corpus/comercio_exterior.json', area: 'comercio_exterior' },
];

export async function getSqliteDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: () => '/wasm/sql-wasm.wasm',
      });

      const db = new SQL.Database();

      // 1. Crear tabla relacional para todas las disposiciones legales
      db.run(`
        CREATE TABLE provisions (
          id TEXT PRIMARY KEY,
          law_code TEXT NOT NULL,
          law_name TEXT NOT NULL,
          article_number TEXT NOT NULL,
          article_num_int INTEGER,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          area TEXT NOT NULL
        );
        CREATE INDEX idx_provisions_law ON provisions(law_code);
        CREATE INDEX idx_provisions_art_num ON provisions(law_code, article_num_int);
        CREATE INDEX idx_provisions_area ON provisions(area);
      `);

      // 2. Registrar función de similitud vectorial y scoring ponderado en SQLite
      db.create_function(
        'vector_score',
        (
          content: string,
          title: string,
          searchTerms: string,
          targetArtNum: number,
          currentArtNum: number
        ) => {
          let score = 0;
          if (targetArtNum > 0 && currentArtNum === targetArtNum) {
            score += 150; // Match de número de artículo exacto
          }

          if (!searchTerms) return score;

          const textNorm = (content + ' ' + title)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

          const terms = searchTerms
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .split(/\s+/)
            .filter((t) => t.length > 2);

          for (const term of terms) {
            if (textNorm.includes(term)) {
              score += 12;
            }
          }

          return score;
        }
      );

      // 3. Poblar la base de datos desde los corpus JSON en paralelo
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO provisions 
        (id, law_code, law_name, article_number, article_num_int, title, content, area)
        VALUES ($id, $law_code, $law_name, $article_number, $article_num_int, $title, $content, $area)
      `);

      for (const item of CORPUS_FILES) {
        try {
          const res = await fetch(item.file);
          if (res.ok) {
            const articles: LegalArticle[] = await res.json();
            for (const art of articles) {
              const numMatch = art.articleNumber.match(/\d+/);
              const artNumInt = numMatch ? parseInt(numMatch[0], 10) : 0;

              stmt.run({
                $id: art.id,
                $law_code: art.lawCode,
                $law_name: art.lawName,
                $article_number: art.articleNumber,
                $article_num_int: artNumInt,
                $title: art.title,
                $content: art.content,
                $area: art.area || item.area,
              });
            }
          }
        } catch (fetchErr) {
          console.warn(`No se pudo cargar corpus: ${item.file}`, fetchErr);
        }
      }
      stmt.free();

      dbInstance = db;
      isInitializing = false;
      return db;
    } catch (err) {
      isInitializing = false;
      console.error('Error al inicializar SQLite WASM:', err);
      throw err;
    }
  })();

  return initPromise;
}

export async function searchInSingleLaw(params: {
  targetLawCode: string;
  searchTerms: string;
  candidateArticleNumber?: number;
  limit?: number;
}): Promise<LegalArticle[]> {
  const db = await getSqliteDb();
  const limit = params.limit || 5;
  const targetArt = params.candidateArticleNumber || 0;

  try {
    const stmt = db.prepare(`
      SELECT id, law_code, law_name, article_number, title, content, area,
             vector_score(content, title, :terms, :targetArt, article_num_int) AS rank
      FROM provisions
      WHERE law_code = :lawCode
      ORDER BY rank DESC
      LIMIT :limit
    `);

    stmt.bind({
      ':lawCode': params.targetLawCode,
      ':terms': params.searchTerms,
      ':targetArt': targetArt,
      ':limit': limit,
    });

    const results: LegalArticle[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        lawCode: row.law_code as string,
        lawName: row.law_name as string,
        articleNumber: row.article_number as string,
        title: row.title as string,
        content: row.content as string,
        area: row.area as LegalEngineeringArea,
        score: row.rank as number,
      });
    }
    stmt.free();

    return results;
  } catch (err) {
    console.error('Error en búsqueda SQLite WASM sobre una sola ley:', err);
    return [];
  }
}

export async function searchInAreaLaws(params: {
  area: LegalEngineeringArea | 'todos';
  searchTerms: string;
  candidateArticleNumber?: number;
  limit?: number;
}): Promise<LegalArticle[]> {
  const db = await getSqliteDb();
  const limit = params.limit || 5;
  const targetArt = params.candidateArticleNumber || 0;

  try {
    const querySql = params.area === 'todos'
      ? `SELECT id, law_code, law_name, article_number, title, content, area,
                vector_score(content, title, :terms, :targetArt, article_num_int) AS rank
         FROM provisions
         ORDER BY rank DESC
         LIMIT :limit`
      : `SELECT id, law_code, law_name, article_number, title, content, area,
                vector_score(content, title, :terms, :targetArt, article_num_int) AS rank
         FROM provisions
         WHERE area = :area
         ORDER BY rank DESC
         LIMIT :limit`;

    const stmt = db.prepare(querySql);

    const bindParams: Record<string, any> = {
      ':terms': params.searchTerms,
      ':targetArt': targetArt,
      ':limit': limit,
    };
    if (params.area !== 'todos') {
      bindParams[':area'] = params.area;
    }

    stmt.bind(bindParams);

    const results: LegalArticle[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        lawCode: row.law_code as string,
        lawName: row.law_name as string,
        articleNumber: row.article_number as string,
        title: row.title as string,
        content: row.content as string,
        area: row.area as LegalEngineeringArea,
        score: row.rank as number,
      });
    }
    stmt.free();

    return results;
  } catch (err) {
    console.error('Error en búsqueda SQLite WASM por área:', err);
    return [];
  }
}
