import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

describe('App Lex Corporativo PWA', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('muestra la pantalla inicial de presentación simplificada con el logotipo de Lex Corporativo', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByAltText('Logotipo Lex Corporativo')).toBeInTheDocument();
    expect(screen.getByText('Plataforma de Consulta Federal')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Explorar Licitaciones/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Consultar Legislación Federal/i }),
    ).toBeInTheDocument();
  });

  it('permite ingresar a la estación de consulta desde la pantalla de presentación', async () => {
    await act(async () => {
      render(<App />);
    });

    const enterBtn = screen.getByRole('button', { name: /Consultar Legislación Federal/i });
    await act(async () => {
      fireEvent.click(enterBtn);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(
      screen.getByRole('heading', { name: 'Consulta de Legislación Federal' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '¿Qué necesitas consultar?' })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Módulos de consulta' }).length).toBeGreaterThan(0);
  });

  it('permite cambiar a la pestaña de Licitaciones Abiertas una vez dentro de la plataforma', async () => {
    localStorage.setItem('lex_pwa_station_opened', '1');
    await act(async () => {
      render(<App />);
    });

    const licitacionesTabs = screen.getAllByRole('button', { name: /Licitaciones/i });
    await act(async () => {
      fireEvent.click(licitacionesTabs[0]);
    });

    expect(
      screen.getByRole('heading', { name: 'Radar de Licitaciones Públicas en México' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: '¿Qué licitación, insumo o servicio buscas?' }),
    ).toBeInTheDocument();
  });

  it('muestra cobertura verificable y distingue los conectores estatales priorizados', async () => {
    localStorage.setItem('lex_pwa_station_opened', '1');
    await act(async () => {
      render(<App />);
    });

    const openCoverageButton = screen.getAllByRole('button', { name: /Abrir cobertura|Cobertura/i })[0];
    await act(async () => {
      fireEvent.click(openCoverageButton);
    });
    const dialog = screen.getByRole('dialog', { name: 'Cobertura y fuentes' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Nuevo León')).toBeInTheDocument();
    expect(within(dialog).getByText('Yucatán')).toBeInTheDocument();
    expect(within(dialog).getByText('Jalisco')).toBeInTheDocument();
    expect(within(dialog).getByText('Ciudad de México')).toBeInTheDocument();
    expect(within(dialog).getByText('Cobertura parcial')).toBeInTheDocument();
    expect(within(dialog).getAllByText('Integración priorizada')).toHaveLength(4);
    expect(screen.queryByText('Guardados')).not.toBeInTheDocument();
  });

  it('aplica y conserva el filtro de etapa de una licitación en la URL', async () => {
    localStorage.setItem('lex_pwa_station_opened', '1');
    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /Licitaciones/i })[0]);
      fireEvent.click(screen.getByRole('button', { name: /Filtros/i }));
    });

    fireEvent.change(screen.getByLabelText('Etapa del procedimiento'), {
      target: { value: 'junta_aclaraciones' },
    });

    await waitFor(() => {
      expect(window.location.search).toContain('estatus=junta_aclaraciones');
    });
    expect(screen.getByRole('button', { name: 'Quitar filtro de etapa' })).toBeInTheDocument();
  });
});
