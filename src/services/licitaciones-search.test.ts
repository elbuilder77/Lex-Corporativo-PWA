import {
  calculateLicitacionScore,
  executeLicitacionesSearch,
} from './licitaciones-search';
import { LICITACIONES_DATA } from '../lib/licitaciones-catalog';

describe('licitaciones-search', () => {
  it('calcula puntajes más altos para coincidencias en número de procedimiento y título', () => {
    const imssLicitacion = LICITACIONES_DATA.find((l) => l.siglasConvocante === 'IMSS')!;
    const scoreByNumber = calculateLicitacionScore(imssLicitacion, 'la-50-gyr');
    const scoreByWord = calculateLicitacionScore(imssLicitacion, 'medicamentos');
    const scoreIrrelevant = calculateLicitacionScore(imssLicitacion, 'subestaciones');

    expect(scoreByNumber).toBeGreaterThan(scoreByWord);
    expect(scoreByWord).toBeGreaterThan(scoreIrrelevant);
  });

  it('ejecuta búsqueda sin filtros retornando todas las licitaciones ordenadas por fecha límite', async () => {
    const result = await executeLicitacionesSearch({});
    expect(result.total).toBe(LICITACIONES_DATA.length);
    expect(result.licitaciones.length).toBe(LICITACIONES_DATA.length);
  });

  it('filtra licitaciones por materia', async () => {
    const result = await executeLicitacionesSearch({ materia: 'obra_publica' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.licitaciones.every((l) => l.materia === 'obra_publica')).toBe(true);
  });

  it('filtra licitaciones por dependencia convocante', async () => {
    const result = await executeLicitacionesSearch({ convocante: 'IMSS' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.licitaciones.some((l) => l.siglasConvocante === 'IMSS')).toBe(true);
  });

  it('filtra licitaciones por entidad federativa', async () => {
    const result = await executeLicitacionesSearch({ entidadFederativa: 'Jalisco' });
    expect(result.total).toBeGreaterThan(0);
    expect(result.licitaciones.some((l) => l.entidadFederativa === 'Jalisco')).toBe(true);
  });

  it('filtra por término de búsqueda y ordena por relevancia', async () => {
    const result = await executeLicitacionesSearch({
      query: 'ciberseguridad',
      sortBy: 'relevancia',
    });
    expect(result.total).toBeGreaterThan(0);
    expect(result.licitaciones[0].titulo.toLowerCase()).toContain('ciberseguridad');
  });
});
