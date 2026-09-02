import type { AppModuleTab } from '../types';

export interface SeoConfig {
  title: string;
  description: string;
  canonicalUrl: string;
}

export const SEO_PAGES: Record<AppModuleTab | 'home', SeoConfig> = {
  home: {
    title: 'Lex Corporativo | Suite Jurídica & Radar Federal México',
    description:
      'Suite jurídica digital y radar federal en México. Consulta táctica de leyes federales en vigor, radar de licitaciones públicas de CompraNet y estación de trabajo profesional para Windows.',
    canonicalUrl: 'https://lexcorporativo.com.mx/',
  },
  normativa: {
    title: 'Consulta de Legislación Federal Mexicana (13 Leyes) | Lex Corporativo',
    description:
      'Buscador normativo sobre 5,011 artículos y reglas federales de México (Código de Comercio, LFT, CFF, LGSM, LIVA, LISR y más) con motor SQLite WASM en sesión.',
    canonicalUrl: 'https://lexcorporativo.com.mx/?tab=normativa',
  },
  licitaciones: {
    title: 'Radar de Licitaciones Públicas CompraNet | Lex Corporativo',
    description:
      'Consulta y filtro de contrataciones públicas federales de México, plazos de propuestas, convocatorias oficiales y expedientes de CompraNet.',
    canonicalUrl: 'https://lexcorporativo.com.mx/?tab=licitaciones',
  },
  estudio: {
    title: 'Estudio Jurídico de Redacción y Contratos (Word/PDF) | Lex Corporativo',
    description:
      'Generador y redactor de 25 contratos, pagarés, actas de asamblea y documentos legales en México con exportación profesional a Word (.docx) y PDF.',
    canonicalUrl: 'https://lexcorporativo.com.mx/?tab=estudio',
  },
  desktop: {
    title: 'Lex Corporativo Desktop | Estación de Auditoría Contractual para Windows',
    description:
      'Descarga oficial de Lex Corporativo Desktop (Windows 10/11). Auditoría de riesgos en 5 materias jurídicas, redactor de instrumentos en Word/PDF y bóveda de expedientes BYOK 100% offline.',
    canonicalUrl: 'https://lexcorporativo.com.mx/?tab=desktop',
  },
};

/**
 * Actualiza dinámicamente los metadatos de SEO, OpenGraph y Canonical de la página
 * según la pestaña activa o la pantalla de inicio.
 */
export function updateSeoMeta(page: AppModuleTab | 'home'): void {
  if (typeof document === 'undefined') return;

  const config = SEO_PAGES[page] || SEO_PAGES.home;

  // Actualizar Título
  document.title = config.title;

  // Actualizar Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', config.description);
  }

  // Actualizar OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', config.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', config.canonicalUrl);

  // Actualizar Twitter Card
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', config.title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', config.description);

  // Actualizar Canonical Link
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', config.canonicalUrl);
  }
}
