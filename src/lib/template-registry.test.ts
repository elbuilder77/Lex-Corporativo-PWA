import { describe, it, expect, vi } from 'vitest';
import { loadTemplateRegistry } from './template-registry';
import { PWA_LEGAL_TEMPLATES } from './pwa-constants';

describe('Template Registry', () => {
  it('retorna el catálogo base de plantillas embebidas cuando no hay red', async () => {
    // Mock global fetch to fail
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

    const templates = await loadTemplateRegistry();
    expect(templates.length).toBe(PWA_LEGAL_TEMPLATES.length);
    expect(templates.some((t) => t.id === 'mercantil-pagare')).toBe(true);
    expect(templates.some((t) => t.module === 'mercantil')).toBe(true);
    expect(templates.some((t) => t.module === 'laboral')).toBe(true);
    expect(templates.some((t) => t.module === 'fiscal')).toBe(true);
    expect(templates.some((t) => t.module === 'comercio_exterior')).toBe(true);
    expect(templates.some((t) => t.module === 'aduanal')).toBe(true);

    vi.unstubAllGlobals();
  });

  it('procesa el manifiesto público de plantillas cuando está disponible', async () => {
    const mockManifest = [
      { id: 'mercantil-pagare', file: 'pagare_mercantil.hbs', format: 'hbs' },
    ];
    const mockHbs = 'PAGARÉ POR {{monto}} EN {{lugar}}';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/plantillas/index.json') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockManifest),
          });
        }
        if (url.includes('pagare_mercantil.hbs')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(mockHbs),
          });
        }
        return Promise.resolve({ ok: false });
      }),
    );

    const templates = await loadTemplateRegistry();
    const pagare = templates.find((t) => t.id === 'mercantil-pagare');
    expect(pagare).toBeDefined();
    expect(pagare?.templateHandlebars).toBe(mockHbs);

    vi.unstubAllGlobals();
  });
});
