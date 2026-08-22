import { useAuthStore } from '../store/useAuthStore';
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

export interface RagSearchResponse {
  answer: string;
  citations: LegalArticle[];
  area: LegalEngineeringArea;
  query: string;
}

const corpusCache = new Map<string, LegalArticle[]>();

export async function loadAreaCorpus(area: LegalEngineeringArea | 'todos'): Promise<LegalArticle[]> {
  if (area === 'todos') {
    const areas: LegalEngineeringArea[] = ['laboral', 'mercantil', 'fiscal', 'aduanal', 'comercio_exterior'];
    const all = await Promise.all(areas.map((a) => loadAreaCorpus(a)));
    return all.flat();
  }

  if (corpusCache.has(area)) {
    return corpusCache.get(area)!;
  }

  try {
    const res = await fetch(`/corpus/${area}.json`);
    if (!res.ok) {
      throw new Error(`No se pudo cargar el corpus para el área ${area}`);
    }
    const data: LegalArticle[] = await res.json();
    corpusCache.set(area, data);
    return data;
  } catch (err) {
    console.error(`Error loading corpus for ${area}:`, err);
    return [];
  }
}

export function searchArticlesLocally(
  articles: LegalArticle[],
  query: string,
  limit = 5
): LegalArticle[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const terms = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  // Check if searching for a specific article number (e.g. "art 47", "articulo 170", "art. 47")
  const articleNumMatch = query.match(/(?:art|articulo|artículo|\bart\.?)\s*([0-9]+(?:\s*(?:bis|ter|quater|[a-z]))?)/i);
  const targetArticleNum = articleNumMatch ? articleNumMatch[1].toLowerCase().replace(/\s+/g, '') : null;

  const scored = articles.map((art) => {
    let score = 0;
    const normalizedContent = (art.content + ' ' + art.title + ' ' + art.articleNumber)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const artNumClean = art.articleNumber.toLowerCase().replace(/[^0-9a-z]/g, '');

    // Exact article number match gets huge boost
    if (targetArticleNum && artNumClean.includes(targetArticleNum)) {
      score += 150;
    }

    // Exact phrase match
    if (normalizedContent.includes(normalizedQuery)) {
      score += 80;
    }

    // Individual term frequency
    for (const term of terms) {
      if (normalizedContent.includes(term)) {
        score += 15;
        // Boost if in article title or number
        if (art.title.toLowerCase().includes(term)) score += 20;
      }
    }

    return { ...art, score };
  });

  return scored
    .filter((a) => a.score > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}

export async function executeRagSearch(params: {
  query: string;
  area: LegalEngineeringArea | 'todos';
}): Promise<RagSearchResponse> {
  const { apiKey, model, mode } = useAuthStore.getState();

  // 1. Cargar el corpus de la materia seleccionada
  const corpus = await loadAreaCorpus(params.area);
  const topCitations = searchArticlesLocally(corpus, params.query, 4);

  const effectiveArea: LegalEngineeringArea = params.area === 'todos' ? 'mercantil' : params.area;

  // 2. Si no hay API key configurada pero hay citas encontradas, generar respuesta resumida
  if (!apiKey && mode !== 'unlocked') {
    if (topCitations.length === 0) {
      return {
        answer: 'No se encontraron artículos que coincidan con la búsqueda. Puedes cambiar de materia o configurar tu clave de Google AI Studio en Ajustes para análisis avanzados con IA.',
        citations: [],
        area: effectiveArea,
        query: params.query,
      };
    }

    const simpleAnswer = `**Artículos encontrados en la normativa oficial (${params.area.toUpperCase()}):**\n\n` +
      topCitations.map((c) => `* **${c.lawCode} - ${c.articleNumber}**: ${c.content.substring(0, 180)}...`).join('\n\n') +
      `\n\n> *Tip: Configura tu clave gratuita de Google AI Studio en Ajustes para obtener respuestas analíticas e interpretación jurídica con Inteligencia Artificial.*`;

    return {
      answer: simpleAnswer,
      citations: topCitations,
      area: effectiveArea,
      query: params.query,
    };
  }

  // 3. Ejecutar RAG con Google Gemini
  const effectiveKey = apiKey || (import.meta.env.VITE_INTEGRATED_GEMINI_KEY as string) || '';
  const effectiveModel = model || 'gemini-2.5-flash';

  const contextText = topCitations.length > 0
    ? topCitations.map((c) => `--- ${c.lawName} (${c.lawCode}) ${c.articleNumber} ---\n${c.content}`).join('\n\n')
    : 'No se encontraron artículos exactos en el corpus local para esta consulta.';

  const systemInstruction = `Eres un Abogado y Asesor Jurídico Experto en Derecho Mexicano para una Estación Jurídica Móvil.
Tu labor es responder a la consulta del usuario utilizando ESTRICTAMENTE como base los artículos normativos proporcionados a continuación.

Reglas de respuesta:
1. Sé claro, ejecutivo, conciso y directo (orientado a lectura en smartphone).
2. Proporciona la FUNDAMENTACIÓN LEGAL PRECISA (Ley, Artículo, Fracción o Párrafo aplicable).
3. Explica brevemente la aplicación práctica o consecuencia jurídica para el caso.
4. Si la ley no contempla expresamente el supuesto, indícalo con rigor profesional.`;

  const userPrompt = `Consulta del usuario: "${params.query}"
Materia: ${params.area.toUpperCase()}

Disposiciones normativas oficiales recuperadas del corpus:
${contextText}

Por favor, elabora la respuesta fundamentada con formato Markdown limpio y títulos breves.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error ${response.status} en Google Gemini.`);
    }

    const data = await response.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar una respuesta.';

    return {
      answer: answerText,
      citations: topCitations,
      area: effectiveArea,
      query: params.query,
    };
  } catch (err: any) {
    return {
      answer: `Error al procesar con IA: ${err.message}. A continuación se muestran los artículos normativos recuperados:`,
      citations: topCitations,
      area: effectiveArea,
      query: params.query,
    };
  }
}
