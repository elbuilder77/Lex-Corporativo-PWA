import { describe, it, expect, vi } from 'vitest';
import * as va from '@vercel/analytics';
import { trackEvent } from './analytics';

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

  it('no arroja error si track falla o no está disponible', () => {
    vi.mocked(va.track).mockImplementationOnce(() => {
      throw new Error('Analytics blocked by adblocker');
    });

    expect(() => {
      trackEvent('copy_hash_click', { algorithm: 'sha512' });
    }).not.toThrow();
  });
});
