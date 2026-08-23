import { CORPUS_CATALOG, CORPUS_STATS, getCorpusItem, getLawsForScope } from './corpus-catalog';

describe('corpus-catalog', () => {
  it('declara las 13 leyes y reglamentos y las 5,011 disposiciones incluidas', () => {
    expect(CORPUS_CATALOG).toHaveLength(13);
    expect(CORPUS_STATS).toEqual({ instruments: 13, provisions: 5011, areas: 5 });
  });

  it('distingue fuentes de leyes y reglamentos', () => {
    expect(getCorpusItem('LFT').sourceKind).toBe('ley');
    expect(getCorpusItem('RLA').sourceKind).toBe('reglamento');
    expect(getCorpusItem('RLA').sourceUrl).toContain('regla.htm');
  });

  it('filtra el catálogo por área', () => {
    expect(getLawsForScope('fiscal').map((item) => item.code)).toEqual(['CFF', 'LISR', 'LIVA', 'RLISR', 'RLIVA']);
  });
});
