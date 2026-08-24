import { act, renderHook } from '@testing-library/react';
import {
  FAVORITES_KEY,
  FAVORITES_LICITACIONES_KEY,
  useSearchStore,
} from './useSearchStore';
import type { LegalArticle, LicitacionPublica } from '../types';

const mockArticle: LegalArticle = {
  id: 'lft-47',
  lawCode: 'LFT',
  lawName: 'Ley Federal del Trabajo',
  articleNumber: '47',
  title: 'Rescisión',
  content: 'Texto de prueba',
  area: 'laboral',
  sourceKind: 'ley',
  sourceName: 'Cámara de Diputados · Leyes Federales',
  sourceUrl: 'https://www.diputados.gob.mx/LeyesBiblio/index.htm',
};

const mockLicitacion: LicitacionPublica = {
  id: 'lic-imss-test',
  numeroProcedimiento: 'LA-50-GYR-TEST',
  expediente: 'EXP-TEST',
  titulo: 'Licitación de Prueba',
  descripcion: 'Descripción de prueba',
  convocante: 'Instituto Mexicano del Seguro Social',
  siglasConvocante: 'IMSS',
  unidadCompradora: 'Coordinación Central',
  materia: 'adquisiciones',
  caracter: 'nacional',
  tipoProcedimiento: 'licitacion_publica',
  estatus: 'recepcion_propuestas',
  entidadFederativa: 'Ciudad de México',
  fechaPublicacion: '2026-08-10',
  fechaLimitePropuestas: '2026-09-02T10:00:00',
  montoEstimado: 1000000,
  moneda: 'MXN',
  marcoLegal: 'LAASSP Art. 26',
  enlaceCompraNet: 'https://comprasmx.buengobierno.gob.mx',
  requisitosClave: ['SAT 32-D'],
  anexosDisponibles: ['Bases'],
};

describe('useSearchStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchStore.setState({ favorites: [], favoriteLicitaciones: [] });
  });

  it('guarda artículos favoritos sin duplicarlos y permite eliminarlos', () => {
    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.addToFavorites(mockArticle));
    act(() => result.current.addToFavorites(mockArticle));
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(mockArticle.id)).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(FAVORITES_KEY, expect.any(String));

    act(() => result.current.removeFromFavorites(mockArticle.id));
    expect(result.current.isFavorite(mockArticle.id)).toBe(false);
  });

  it('guarda licitaciones en seguimiento sin duplicarlas y permite eliminarlas', () => {
    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.addToFavoriteLicitaciones(mockLicitacion));
    act(() => result.current.addToFavoriteLicitaciones(mockLicitacion));
    expect(result.current.favoriteLicitaciones).toHaveLength(1);
    expect(result.current.isFavoriteLicitacion(mockLicitacion.id)).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      FAVORITES_LICITACIONES_KEY,
      expect.any(String),
    );

    act(() => result.current.removeFromFavoriteLicitaciones(mockLicitacion.id));
    expect(result.current.isFavoriteLicitacion(mockLicitacion.id)).toBe(false);
    expect(result.current.favoriteLicitaciones).toHaveLength(0);
  });

  it('carga favoritos desde localStorage', () => {
    const favorites = [{ id: mockArticle.id, article: mockArticle, savedAt: 1 }];
    const favoriteLicitaciones = [
      { id: mockLicitacion.id, licitacion: mockLicitacion, savedAt: 1 },
    ];
    vi.mocked(localStorage.getItem).mockImplementation((key) => {
      if (key === FAVORITES_KEY) return JSON.stringify(favorites);
      if (key === FAVORITES_LICITACIONES_KEY) return JSON.stringify(favoriteLicitaciones);
      return null;
    });

    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.loadFromStorage());
    expect(result.current.favorites).toEqual(favorites);
    expect(result.current.favoriteLicitaciones).toEqual(favoriteLicitaciones);
  });

  it('borra todos los datos guardados de la PWA de forma limpia', () => {
    useSearchStore.setState({
      favorites: [{ id: mockArticle.id, article: mockArticle, savedAt: 1 }],
      favoriteLicitaciones: [{ id: mockLicitacion.id, licitacion: mockLicitacion, savedAt: 1 }],
    });
    const { result } = renderHook(() => useSearchStore());
    act(() => result.current.clearAll());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.favoriteLicitaciones).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith(FAVORITES_KEY);
    expect(localStorage.removeItem).toHaveBeenCalledWith(FAVORITES_LICITACIONES_KEY);
  });
});
