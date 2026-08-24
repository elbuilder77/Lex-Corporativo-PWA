import { act, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import { useSearchStore } from './store/useSearchStore';

describe('App Lex Corporativo PWA', () => {
  beforeEach(() => {
    useSearchStore.setState({ favorites: [], favoriteLicitaciones: [] });
    vi.clearAllMocks();
  });

  it('inicia en el buscador normativo con navegación de pestañas', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(
      screen.getByRole('heading', { name: 'Consulta la legislación federal con respaldo oficial' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: '¿Qué necesitas consultar?' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Módulos de consulta' })).toBeInTheDocument();
  });

  it('permite cambiar a la pestaña de Licitaciones Abiertas', async () => {
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
