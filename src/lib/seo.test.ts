import { describe, it, expect, beforeEach } from 'vitest';
import { updateSeoMeta, SEO_PAGES } from './seo';

describe('SEO Dynamic Utility', () => {
  beforeEach(() => {
    document.title = '';
    // Ensure meta tags exist in DOM
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
  });

  it('actualiza el título y la descripción para la página de inicio (home)', () => {
    updateSeoMeta('home');

    expect(document.title).toBe(SEO_PAGES.home.title);
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc?.getAttribute('content')).toBe(SEO_PAGES.home.description);
  });

  it('actualiza el título y la descripción para la pestaña de normativa', () => {
    updateSeoMeta('normativa');

    expect(document.title).toBe(SEO_PAGES.normativa.title);
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc?.getAttribute('content')).toBe(SEO_PAGES.normativa.description);
  });

  it('actualiza el título y la descripción para la pestaña de licitaciones', () => {
    updateSeoMeta('licitaciones');

    expect(document.title).toBe(SEO_PAGES.licitaciones.title);
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc?.getAttribute('content')).toBe(SEO_PAGES.licitaciones.description);
  });

  it('actualiza el título y la descripción para la pestaña de desktop', () => {
    updateSeoMeta('desktop');

    expect(document.title).toBe(SEO_PAGES.desktop.title);
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc?.getAttribute('content')).toBe(SEO_PAGES.desktop.description);
  });
});
