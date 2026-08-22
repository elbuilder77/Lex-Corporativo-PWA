import { useAuthStore } from '../store/useAuthStore';
import type { LegalEngineeringArea } from '../types';

export interface AiRouterResult {
  targetLawCode: string;
  targetLawName: string;
  area: LegalEngineeringArea;
  candidateArticleNumber?: number;
  normalizedLegalTerms: string;
  explanation: string;
  confidence: number;
}

const LAWS_CATALOG: Record<string, { name: string; area: LegalEngineeringArea }> = {
  LFT: { name: 'Ley Federal del Trabajo', area: 'laboral' },
  CCom: { name: 'Código de Comercio', area: 'mercantil' },
  LGSM: { name: 'Ley General de Sociedades Mercantiles', area: 'mercantil' },
  LGTOC: { name: 'Ley General de Títulos y Operaciones de Crédito', area: 'mercantil' },
  CFF: { name: 'Código Fiscal de la Federación', area: 'fiscal' },
  LISR: { name: 'Ley del Impuesto sobre la Renta', area: 'fiscal' },
  LIVA: { name: 'Ley del Impuesto al Valor Agregado', area: 'fiscal' },
  RLISR: { name: 'Reglamento de la Ley del Impuesto sobre la Renta', area: 'fiscal' },
  RLIVA: { name: 'Reglamento de la Ley del Impuesto al Valor Agregado', area: 'fiscal' },
  LA: { name: 'Ley Aduanera', area: 'aduanal' },
  RLA: { name: 'Reglamento de la Ley Aduanera', area: 'aduanal' },
  LCE: { name: 'Ley de Comercio Exterior', area: 'comercio_exterior' },
  RLCE: { name: 'Reglamento de la Ley de Comercio Exterior', area: 'comercio_exterior' },
};

function fallbackHeuristicRouter(query: string, preferredArea?: LegalEngineeringArea): AiRouterResult {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const numMatch = q.match(/(?:art|articulo|artículo|\bart\.?)\s*([0-9]+)/);
  const candidateArt = numMatch ? parseInt(numMatch[1], 10) : undefined;

  // Heurísticas por palabras clave
  if (q.includes('trabaj') || q.includes('despid') || q.includes('patron') || q.includes('salario') || q.includes('jornada') || q.includes('aguinaldo') || q.includes('vacacion') || q.includes('lft')) {
    return {
      targetLawCode: 'LFT',
      targetLawName: 'Ley Federal del Trabajo',
      area: 'laboral',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en materia laboral (LFT).',
      confidence: 0.9,
    };
  }

  if (q.includes('pagare') || q.includes('letra de cambio') || q.includes('titulo de credito') || q.includes('endoso') || q.includes('lgtoc')) {
    return {
      targetLawCode: 'LGTOC',
      targetLawName: 'Ley General de Títulos y Operaciones de Crédito',
      area: 'mercantil',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada sobre títulos y operaciones de crédito (LGTOC).',
      confidence: 0.95,
    };
  }

  if (q.includes('sociedad') || q.includes('asamblea') || q.includes('accionista') || q.includes('estatuto') || q.includes('lgsm')) {
    return {
      targetLawCode: 'LGSM',
      targetLawName: 'Ley General de Sociedades Mercantiles',
      area: 'mercantil',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada sobre sociedades mercantiles y gobierno corporativo (LGSM).',
      confidence: 0.9,
    };
  }

  if (q.includes('comercio') || q.includes('compraventa mercantil') || q.includes('acto de comercio') || q.includes('ccom')) {
    return {
      targetLawCode: 'CCom',
      targetLawName: 'Código de Comercio',
      area: 'mercantil',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en actos y contratos mercantiles (Código de Comercio).',
      confidence: 0.85,
    };
  }

  if (q.includes('iva') || q.includes('acreditamiento')) {
    return {
      targetLawCode: 'LIVA',
      targetLawName: 'Ley del Impuesto al Valor Agregado',
      area: 'fiscal',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en impuesto al valor agregado (LIVA).',
      confidence: 0.95,
    };
  }

  if (q.includes('isr') || q.includes('deduccion') || q.includes('retencion')) {
    return {
      targetLawCode: 'LISR',
      targetLawName: 'Ley del Impuesto sobre la Renta',
      area: 'fiscal',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en impuesto sobre la renta (LISR).',
      confidence: 0.9,
    };
  }

  if (q.includes('sat') || q.includes('cfdi') || q.includes('factura') || q.includes('cff') || q.includes('infraccion fiscal')) {
    return {
      targetLawCode: 'CFF',
      targetLawName: 'Código Fiscal de la Federación',
      area: 'fiscal',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en disposiciones fiscales generales (CFF).',
      confidence: 0.9,
    };
  }

  if (q.includes('aduan') || q.includes('pedimento') || q.includes('pama') || q.includes('despacho aduanero')) {
    return {
      targetLawCode: 'LA',
      targetLawName: 'Ley Aduanera',
      area: 'aduanal',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en despacho y regulación aduanera (Ley Aduanera).',
      confidence: 0.95,
    };
  }

  if (q.includes('arancel') || q.includes('dumping') || q.includes('cuota compensatoria') || q.includes('comercio exterior')) {
    return {
      targetLawCode: 'LCE',
      targetLawName: 'Ley de Comercio Exterior',
      area: 'comercio_exterior',
      candidateArticleNumber: candidateArt,
      normalizedLegalTerms: query,
      explanation: 'Consulta identificada en comercio exterior y regulaciones no arancelarias (LCE).',
      confidence: 0.9,
    };
  }

  // Default según área preferida
  const defLaw = preferredArea === 'laboral' ? 'LFT'
    : preferredArea === 'mercantil' ? 'CCom'
    : preferredArea === 'fiscal' ? 'CFF'
    : preferredArea === 'aduanal' ? 'LA'
    : preferredArea === 'comercio_exterior' ? 'LCE'
    : 'LFT';

  return {
    targetLawCode: defLaw,
    targetLawName: LAWS_CATALOG[defLaw].name,
    area: LAWS_CATALOG[defLaw].area,
    candidateArticleNumber: candidateArt,
    normalizedLegalTerms: query,
    explanation: `Enrutado predeterminado a ${LAWS_CATALOG[defLaw].name}.`,
    confidence: 0.7,
  };
}

export async function routeQueryWithAi(params: {
  query: string;
  preferredArea?: LegalEngineeringArea;
}): Promise<AiRouterResult> {
  const { apiKey, model, mode } = useAuthStore.getState();
  const cleanQuery = params.query.trim();

  if (!cleanQuery) {
    return fallbackHeuristicRouter('', params.preferredArea);
  }

  // Si no hay API key o no está activado el modo IA, usar enrutador heurístico ultrarrápido
  if (!apiKey && mode !== 'unlocked') {
    return fallbackHeuristicRouter(cleanQuery, params.preferredArea);
  }

  const effectiveKey = apiKey || (import.meta.env.VITE_INTEGRATED_GEMINI_KEY as string) || '';
  const effectiveModel = model || 'gemini-2.5-flash';

  const systemInstruction = `Eres el Enrutador Jurídico en Primera Línea de Lex Corporativo.
Tu único objetivo es analizar la consulta del usuario (incluso si está en lenguaje coloquial o informal) y determinar con EXACTITUD a cuál de las siguientes 9 leyes federales mexicanas pertenece:

CATÁLOGO DE LEYES DISPONIBLES:
- LFT: Ley Federal del Trabajo (relaciones de trabajo, despido, aguinaldo, jornada, sindicatos)
- CCom: Código de Comercio (actos de comercio, compraventa mercantil, contratos mercantiles)
- LGSM: Ley General de Sociedades Mercantiles (SA, SAPI, asambleas, administradores, estatutos)
- LGTOC: Ley General de Títulos y Operaciones de Crédito (pagarés, cheques, letras de cambio, endosos)
- CFF: Código Fiscal de la Federación (CFDI, facultades SAT, 69-B, visitas domiciliarias)
- LISR: Ley del Impuesto sobre la Renta (deducciones autorizadas, pagos provisionales, retenciones)
- LIVA: Ley del Impuesto al Valor Agregado (acreditamiento de IVA, tasas, actos gravados)
- LA: Ley Aduanera (pedimentos, despacho aduanero, PAMA, rectificación, recintos)
- LCE: Ley de Comercio Exterior (prácticas desleales, dumping, regulaciones no arancelarias)

Responde ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "targetLawCode": "LFT" | "CCom" | "LGSM" | "LGTOC" | "CFF" | "LISR" | "LIVA" | "LA" | "LCE",
  "candidateArticleNumber": 47 (número entero del artículo si se menciona o es evidente, de lo contrario null),
  "normalizedLegalTerms": "términos jurídicos técnicos para buscar en el texto de la ley",
  "explanation": "Breve explicación de 1 oración del porqué esta ley rige el caso",
  "confidence": 0.95
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: `Consulta del usuario: "${cleanQuery}"` }] }],
          generationConfig: {
            temperature: 0.0,
            maxOutputTokens: 250,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      return fallbackHeuristicRouter(cleanQuery, params.preferredArea);
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      return fallbackHeuristicRouter(cleanQuery, params.preferredArea);
    }

    const parsed = JSON.parse(rawJson);
    const lawCode = parsed.targetLawCode || 'LFT';
    const lawMeta = LAWS_CATALOG[lawCode] || LAWS_CATALOG.LFT;

    return {
      targetLawCode: lawCode,
      targetLawName: lawMeta.name,
      area: lawMeta.area,
      candidateArticleNumber: parsed.candidateArticleNumber ? parseInt(parsed.candidateArticleNumber, 10) : undefined,
      normalizedLegalTerms: parsed.normalizedLegalTerms || cleanQuery,
      explanation: parsed.explanation || `Enrutado con IA hacia ${lawMeta.name}.`,
      confidence: parsed.confidence || 0.95,
    };
  } catch (err) {
    console.warn('Fallo enrutador IA, usando fallback heurístico:', err);
    return fallbackHeuristicRouter(cleanQuery, params.preferredArea);
  }
}
