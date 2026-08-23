import { readFile } from 'node:fs/promises';

const corpusFiles = [
  'public/corpus/laboral.json',
  'public/corpus/mercantil.json',
  'public/corpus/fiscal.json',
  'public/corpus/aduanal.json',
  'public/corpus/comercio_exterior.json',
];

const expectedCounts = new Map([
  ['LFT', 1078], ['CCom', 1526], ['LGSM', 275], ['LGTOC', 439],
  ['CFF', 274], ['LISR', 215], ['LIVA', 43], ['RLISR', 313], ['RLIVA', 79],
  ['LA', 208], ['RLA', 248], ['LCE', 98], ['RLCE', 215],
]);

const articles = (await Promise.all(
  corpusFiles.map(async (file) => JSON.parse(await readFile(file, 'utf8'))),
)).flat();

const ids = new Set();
const actualCounts = new Map();
for (const article of articles) {
  for (const field of ['id', 'lawCode', 'lawName', 'articleNumber', 'content', 'area']) {
    if (typeof article[field] !== 'string' || !article[field].trim()) {
      throw new Error(`Campo inválido ${field} en ${article.id ?? 'registro sin id'}`);
    }
  }
  if (ids.has(article.id)) throw new Error(`ID duplicado: ${article.id}`);
  ids.add(article.id);
  actualCounts.set(article.lawCode, (actualCounts.get(article.lawCode) ?? 0) + 1);
}

if (articles.length !== 5011) throw new Error(`Se esperaban 5011 disposiciones y se encontraron ${articles.length}`);
if (actualCounts.size !== expectedCounts.size) throw new Error(`Se esperaban 13 ordenamientos y se encontraron ${actualCounts.size}`);
for (const [code, expected] of expectedCounts) {
  if (actualCounts.get(code) !== expected) {
    throw new Error(`${code}: se esperaban ${expected} disposiciones y se encontraron ${actualCounts.get(code) ?? 0}`);
  }
}

const article47 = articles.find((article) => article.id === 'lft_art_47');
if (!article47?.content.toLocaleLowerCase('es-MX').includes('rescisión')) {
  throw new Error('La búsqueda de control no localizó la rescisión en LFT Art. 47');
}

console.log(`Corpus válido: ${articles.length} disposiciones, ${actualCounts.size} ordenamientos, ${ids.size} IDs únicos.`);
