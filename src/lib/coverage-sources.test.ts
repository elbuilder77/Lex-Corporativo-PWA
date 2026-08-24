import { COVERAGE_SUMMARY, PROCUREMENT_SOURCES, clearRetiredSavedData } from './coverage-sources';

describe('coverage sources', () => {
  it('prioriza las cuatro fuentes estatales acordadas sin presentarlas como integradas', () => {
    const prioritizedTerritories = PROCUREMENT_SOURCES
      .filter((source) => source.status === 'prioritized')
      .map((source) => source.territory);

    expect(prioritizedTerritories).toEqual([
      'Nuevo León',
      'Yucatán',
      'Jalisco',
      'Ciudad de México',
    ]);
    expect(COVERAGE_SUMMARY).toEqual({ available: 1, prioritized: 4 });
  });

  it('retira los datos locales del módulo de guardados descontinuado', () => {
    clearRetiredSavedData();

    expect(localStorage.removeItem).toHaveBeenCalledWith('lex_pwa_favorites_v2');
    expect(localStorage.removeItem).toHaveBeenCalledWith('lex_pwa_fav_licitaciones_v2');
  });
});
