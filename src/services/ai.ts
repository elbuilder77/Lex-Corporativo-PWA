import { useAuthStore } from '../store/useAuthStore';
import type { LegalEngineeringArea } from '../types';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function testGoogleApiKey(
  apiKey: string,
  model = 'gemini-2.5-flash'
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Responde únicamente con la palabra: OK' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `Error HTTP ${res.status}: Clave de API o modelo no válido.`;
      return { ok: false, message: msg };
    }

    return { ok: true, message: 'Conexión con Google AI Studio validada con éxito.' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Error de red al conectar con Google AI Studio.' };
  }
}

function getEffectiveApiKeyAndModel(): { apiKey: string; model: string } {
  const { mode, apiKey, model } = useAuthStore.getState();

  if (mode === 'unlocked') {
    const effectiveKey = apiKey || (import.meta.env.VITE_INTEGRATED_GEMINI_KEY as string) || '';
    return { apiKey: effectiveKey, model: model || 'gemini-2.5-flash' };
  }

  return { apiKey: apiKey || '', model: model || 'gemini-2.5-flash' };
}

export async function draftLegalDocument(params: {
  requirements: string;
  area: LegalEngineeringArea;
  templateBody?: string;
  referenceText?: string;
}): Promise<string> {
  const { apiKey, model } = getEffectiveApiKeyAndModel();

  if (!apiKey) {
    throw new Error('No se ha configurado la clave de Google AI Studio o la licencia.');
  }

  const systemInstruction = `Eres un Abogado Corporativo Senior y Redactor Jurídico Especializado en Derecho Mexicano (${params.area.toUpperCase()}).
Tu labor es redactar instrumentos legales formales, estructurados, exhaustivos y con FUNDAMENTACIÓN LEGAL PRECISA conforme a la legislación mexicana vigente (LFT, Código de Comercio, LGSM, LGTOC, CFF, Ley del ISR, Ley del IVA, Ley Aduanera, Ley de Comercio Exterior).

Estructura obligatoria del instrumento:
1. PROEMIO: Identificación formal de las partes.
2. DECLARACIONES: Declaraciones formales de personalidad y capacidad.
3. CLÁUSULAS: Cláusulas con sustento normativo.
4. CIERRE Y FIRMAS.`;

  const userPrompt = `Requerimientos del usuario:
${params.requirements}

${params.templateBody ? `\n\nPlantilla base:\n${params.templateBody}` : ''}
${params.referenceText ? `\n\nTexto de referencia:\n${params.referenceText}` : ''}`;

  const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Error ${response.status} en la redacción con Gemini.`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('La respuesta de Google AI Studio no contiene texto.');
  }

  return text;
}
