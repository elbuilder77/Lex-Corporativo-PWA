import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Introduction } from './Introduction';

describe('Introduction Component', () => {
  it('renderiza la nueva interfaz estructurada con tarjetas de Licitaciones, Leyes y Desktop', () => {
    const handleOpenStation = vi.fn();
    render(<Introduction onOpenStation={handleOpenStation} />);

    expect(screen.getByAltText('Logotipo Lex Corporativo')).toBeInTheDocument();
    expect(screen.getByText(/Plataforma de Consulta Federal/i)).toBeInTheDocument();
    expect(screen.getByText('Licitaciones Abiertas')).toBeInTheDocument();
    expect(screen.getByText('Legislación Federal')).toBeInTheDocument();
    expect(screen.getByText('Lex Corporativo Desktop')).toBeInTheDocument();
  });

  it('llama a onOpenStation con "licitaciones" al hacer clic en Explorar Licitaciones', async () => {
    const handleOpenStation = vi.fn();
    render(<Introduction onOpenStation={handleOpenStation} />);

    const licitacionesBtn = screen.getByRole('button', { name: /Explorar Licitaciones/i });
    await act(async () => {
      fireEvent.click(licitacionesBtn);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(handleOpenStation).toHaveBeenCalledWith('licitaciones');
  });

  it('llama a onOpenStation con "normativa" al hacer clic en Consultar Legislación Federal', async () => {
    const handleOpenStation = vi.fn();
    render(<Introduction onOpenStation={handleOpenStation} />);

    const normativaBtn = screen.getByRole('button', { name: /Consultar Legislación Federal/i });
    await act(async () => {
      fireEvent.click(normativaBtn);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(handleOpenStation).toHaveBeenCalledWith('normativa');
  });

  it('llama a onOpenStation con "desktop" al hacer clic en la tarjeta Desktop', async () => {
    const handleOpenStation = vi.fn();
    render(<Introduction onOpenStation={handleOpenStation} />);

    const desktopBtn = screen.getByRole('button', { name: /Estación Desktop/i });
    await act(async () => {
      fireEvent.click(desktopBtn);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(handleOpenStation).toHaveBeenCalledWith('desktop');
  });
});
