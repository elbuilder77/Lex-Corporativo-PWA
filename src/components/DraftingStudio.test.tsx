import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DraftingStudio } from './DraftingStudio';

describe('DraftingStudio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renderiza la cabecera y acciones principales del Estudio jurídico', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    expect(screen.getByRole('heading', { name: /Estudio [jJ]urídico/i })).toBeInTheDocument();
    expect(screen.getByText(/Redacción documental/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Borradores/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Importar/i })).toBeInTheDocument();
  });

  it('permite filtrar el catálogo de instrumentos por materia', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const mercantilBtn = screen.getByRole('button', { name: /^Mercantil/i });
    expect(mercantilBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(mercantilBtn);
    });

    expect(screen.getByText(/instrumentos únicos/i)).toBeInTheDocument();
  });

  it('muestra el fundamentador y permite consultar materias del corpus', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    expect(screen.getByRole('heading', { name: 'Fundamentador' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar fundamento' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Área jurídica' })).toBeInTheDocument();
  });

  it('abre el modal de borradores locales al hacer clic en Borradores', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const draftsBtn = screen.getByRole('button', { name: /Borradores/i });
    await act(async () => {
      fireEvent.click(draftsBtn);
    });

    expect(screen.getByRole('dialog', { name: 'Borradores locales' })).toBeInTheDocument();
  });
});
