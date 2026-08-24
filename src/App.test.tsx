import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { useSearchStore } from './store/useSearchStore';

describe('App Lex Corporativo PWA', () => {
  beforeEach(() => {
    localStorage.clear();
    useSearchStore.setState({ favorites: [], favoriteLicitaciones: [] });
    vi.clearAllMocks();
  });

  it('muestra la pantalla inicial de presentación con el logotipo de Lex Corporativo', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByAltText('Logotipo Lex Corporativo')).toBeInTheDocument();
    expect(screen.getByAltText('Emblema Lex Corporativo')).toBeInTheDocument();
    expect(screen.getByText('Plataforma de Consulta Federal')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /INGRESAR A LA PLATAFORMA/i }),
    ).toBeInTheDocument();
  });

  it('permite ingresar a la estación de consulta desde la pantalla de presentación', async () => {
    await act(async () => {
      render(<App />);
    });

    const enterBtn = screen.getByRole('button', { name: /INGRESAR A LA PLATAFORMA/i });
    await act(async () => {
      fireEvent.click(enterBtn);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(
      screen.getByRole('heading', { name: 'Consulta la legislación federal con respaldo oficial' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '¿Qué necesitas consultar?' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Módulos de consulta' })).toBeInTheDocument();
  });

  it('permite cambiar a la pestaña de Licitaciones Abiertas una vez dentro de la plataforma', async () => {
    localStorage.setItem('lex_pwa_station_opened', '1');
    await act(async () => {
      render(<App />);
    });

    const licitacionesTab = screen.getByRole('button', { name: 'Licitaciones' });
    await act(async () => {
      fireEvent.click(licitacionesTab);
    });

    expect(
      screen.getByRole('heading', { name: 'Buscador de Licitaciones Abiertas en México' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: '¿Qué licitación, insumo o servicio buscas?' }),
    ).toBeInTheDocument();
  });

  it('muestra el portafolio de guardados sin historial de búsqueda', async () => {
    localStorage.setItem('lex_pwa_station_opened', '1');
    await act(async () => {
      render(<App />);
    });

    const openSavedBtn = screen.getByRole('button', { name: 'Abrir guardados' });
    await act(async () => {
      fireEvent.click(openSavedBtn);
    });
    const dialog = screen.getByRole('dialog', { name: 'Guardados' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Artículos Legales/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Licitaciones \(0\)/i)).toBeInTheDocument();
    expect(within(dialog).queryByText(/Historial/i)).not.toBeInTheDocument();
  });
});
