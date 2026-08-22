import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('./scripts/corpus-source');
const OUT_DIR = path.resolve('./public/corpus');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

export const LAW_MAPPINGS = [
  // 1. Materia Laboral
  { file: 'lft.md', lawCode: 'LFT', lawName: 'Ley Federal del Trabajo', area: 'laboral' },

  // 2. Materia Mercantil y Corporativa
  { file: 'codigo_comercio.md', lawCode: 'CCom', lawName: 'Código de Comercio', area: 'mercantil' },
  { file: 'lgsm.md', lawCode: 'LGSM', lawName: 'Ley General de Sociedades Mercantiles', area: 'mercantil' },
  { file: 'lgtoc.md', lawCode: 'LGTOC', lawName: 'Ley General de Títulos y Operaciones de Crédito', area: 'mercantil' },

  // 3. Materia Fiscal y Tributaria
  { file: 'cff.md', lawCode: 'CFF', lawName: 'Código Fiscal de la Federación', area: 'fiscal' },
  { file: 'lisr.md', lawCode: 'LISR', lawName: 'Ley del Impuesto sobre la Renta', area: 'fiscal' },
  { file: 'liva.md', lawCode: 'LIVA', lawName: 'Ley del Impuesto al Valor Agregado', area: 'fiscal' },
  { file: 'rlisr.md', lawCode: 'RLISR', lawName: 'Reglamento de la Ley del Impuesto sobre la Renta', area: 'fiscal' },
  { file: 'rliva.md', lawCode: 'RLIVA', lawName: 'Reglamento de la Ley del Impuesto al Valor Agregado', area: 'fiscal' },

  // 4. Materia Aduanal
  { file: 'ley_aduanera.md', lawCode: 'LA', lawName: 'Ley Aduanera', area: 'aduanal' },
  { file: 'rla.md', lawCode: 'RLA', lawName: 'Reglamento de la Ley Aduanera', area: 'aduanal' },

  // 5. Materia de Comercio Exterior
  { file: 'lce.md', lawCode: 'LCE', lawName: 'Ley de Comercio Exterior', area: 'comercio_exterior' },
  { file: 'rlce.md', lawCode: 'RLCE', lawName: 'Reglamento de la Ley de Comercio Exterior', area: 'comercio_exterior' },
];

export function parseMarkdownLaw(filePath, lawCode, lawName, area) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Archivo no encontrado: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /\*\*(?:Artículo|ARTÍCULO)\s+([0-9]+(?:\s*(?:Bis|Ter|Quáter|Quinquies|[A-Z]))?)\*\*/gi;
  const matches = [...content.matchAll(regex)];
  const articles = [];
  const seenIds = new Set();
  let duplicates = 0;

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const articleNum = current[1].trim();
    const startIndex = current.index + current[0].length;
    const endIndex = next ? next.index : content.length;

    let articleText = content.substring(startIndex, endIndex).trim();
    articleText = articleText.replace(/^#+\s+.*$/gm, '').trim();

    const cleanNum = articleNum.toLowerCase().replace(/[^0-9a-z]/g, '_');
    const id = `${lawCode.toLowerCase()}_art_${cleanNum}`;

    if (seenIds.has(id)) {
      duplicates++;
      continue;
    }
    seenIds.add(id);

    if (articleText.length > 5) {
      articles.push({
        id,
        lawCode,
        lawName,
        articleNumber: `Art. ${articleNum}`,
        title: `${lawName} - Artículo ${articleNum}`,
        content: articleText.substring(0, 3000),
        area,
      });
    }
  }

  console.log(`✓ ${lawCode.padEnd(6)} -> ${articles.length.toString().padStart(4)} artículos únicos` + (duplicates > 0 ? ` (${duplicates} duplicados descartados)` : ''));
  return articles;
}

export function buildCorpus(sourceDirectory = SRC_DIR, outputDirectory = OUT_DIR) {
  console.log('--- GENERANDO Y UNIFICANDO CORPUS JURÍDICO ---');
  const areaGroups = {
    laboral: [],
    mercantil: [],
    fiscal: [],
    aduanal: [],
    comercio_exterior: [],
  };

  for (const law of LAW_MAPPINGS) {
    const filePath = path.join(sourceDirectory, law.file);
    const articles = parseMarkdownLaw(filePath, law.lawCode, law.lawName, law.area);
    if (areaGroups[law.area]) {
      areaGroups[law.area].push(...articles);
    }
  }

  console.log('\n--- GUARDANDO ARCHIVOS JSON UNIFICADOS ---');
  for (const [area, articles] of Object.entries(areaGroups)) {
    const outPath = path.join(outputDirectory, `${area}.json`);
    fs.writeFileSync(outPath, JSON.stringify(articles, null, 2), 'utf-8');
    const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`✓ ${area.padEnd(18)} -> ${articles.length.toString().padStart(4)} artículos totales (${sizeKb} KB)`);
  }

  console.log('\n¡Unificación del corpus finalizada con éxito!');
}

buildCorpus();
