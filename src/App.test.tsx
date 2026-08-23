import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { useSearchStore } from './store/useSearchStore';

describe('App de un solo módulo', () => {
  beforeEach(() => {
    useSearchStore.setState({ history: [], favorites: [] });
    vi.clearAllMocks();
  });

  it('abre directamente el buscador sin navegación por módulos', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Consulta normativa local y verificable' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('muestra guardados como panel del mismo buscador', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir guardados' }));
    expect(screen.getByRole('dialog', { name: 'Guardados' })).toBeInTheDocument();
  });
});
