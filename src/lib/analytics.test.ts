import { describe, it, expect, vi } from 'vitest';
import * as va from '@vercel/analytics';
import { trackEvent, sanitizeAnalyticsUrl } from './analytics';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('Analytics Utility', () => {
  it('llama a va.track con el nombre de evento y propiedades sanitizadas', () => {
    trackEvent('download_desktop_click', {
      version: '1.0.0-rc.13',
      platform: 'Windows 10 / Windows 11',
      emptyVal: null,
      undefVal: undefined,
    });

    expect(va.track).toHaveBeenCalledWith('download_desktop_click', {
      version: '1.0.0-rc.13',
      platform: 'Windows 10 / Windows 11',
    });
  });

  it('excluye propiedades sensibles como query, text o citation', () => {
    trackEvent('legal_search_performed', {
      query_length: 15,
      query: 'secreto fiscal del cliente',
      text: 'documento confidencial',
      scope: 'fiscal',
    });

    expect(va.track).toHaveBeenCalledWith('legal_search_performed', {
      query_length: 15,
      scope: 'fiscal',
    });
  });

  it('sanitizeAnalyticsUrl elimina los parámetros de búsqueda del usuario', () => {
    const cleanNormativa = sanitizeAnalyticsUrl('https://lexcorporativo.com.mx/?tab=normativa&q=fraude+fiscal&scope=fiscal');
    expect(cleanNormativa).toBe('/?tab=normativa&scope=fiscal');

    const cleanLicitaciones = sanitizeAnalyticsUrl('/?tab=licitaciones&lq=medicamentos&materia=adquisiciones');
    expect(cleanLicitaciones).toBe('/?tab=licitaciones&materia=adquisiciones');

    const noParams = sanitizeAnalyticsUrl('https://lexcorporativo.com.mx/estudio');
    expect(noParams).toBe('/estudio');
  });

  it('no arroja error si track falla o no está disponible', () => {
    vi.mocked(va.track).mockImplementationOnce(() => {
      throw new Error('Analytics blocked by adblocker');
    });

    expect(() => {
      trackEvent('copy_hash_click', { algorithm: 'sha512' });
    }).not.toThrow();
  });
});

