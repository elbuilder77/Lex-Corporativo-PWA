import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesktopFeatureLockModal } from './DesktopFeatureLockModal';

describe('DesktopFeatureLockModal Component', () => {
  const onClose = vi.fn();
  const onNavigateToDesktop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando isOpen es false o feature es null', () => {
    const { container, rerender } = render(
      <DesktopFeatureLockModal isOpen={false} onClose={onClose} feature="auditar" />,
    );
    expect(container.firstChild).toBeNull();

    rerender(<DesktopFeatureLockModal isOpen={true} onClose={onClose} feature={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza la información de bloqueo para el modo Auditar', () => {
    render(
      <DesktopFeatureLockModal
        isOpen={true}
        onClose={onClose}
        feature="auditar"
        onNavigateToDesktop={onNavigateToDesktop}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Auditoría Contractual y Semántica/i })).toBeInTheDocument();
    expect(screen.getByText(/Exclusivo de Lex Desktop/i)).toBeInTheDocument();
    expect(screen.getByText(/Módulo de Auditoría/i)).toBeInTheDocument();
    expect(screen.getByText(/Motor SQLite Nativo/i)).toBeInTheDocument();
  });

  it('renderiza la información de bloqueo para el modo Fundamentar', () => {
    render(
      <DesktopFeatureLockModal
        isOpen={true}
        onClose={onClose}
        feature="fundamentar"
        onNavigateToDesktop={onNavigateToDesktop}
      />,
    );

    expect(screen.getByRole('heading', { name: /Motor de Fundamentación y Citas en Vivo/i })).toBeInTheDocument();
    expect(screen.getByText(/Módulo de Fundamentación/i)).toBeInTheDocument();
  });

  it('permite cerrar el modal con el botón de continuar o cerrar', () => {
    render(
      <DesktopFeatureLockModal
        isOpen={true}
        onClose={onClose}
        feature="auditar"
      />,
    );

    const closeBtn = screen.getByLabelText('Cerrar aviso');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const continueBtn = screen.getByRole('button', { name: /Continuar en el Editor Web/i });
    fireEvent.click(continueBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('ejecuta la navegación a la presentación Desktop al hacer clic en Conocer Estación Desktop', () => {
    render(
      <DesktopFeatureLockModal
        isOpen={true}
        onClose={onClose}
        feature="fundamentar"
        onNavigateToDesktop={onNavigateToDesktop}
      />,
    );

    const learnMoreBtn = screen.getByRole('button', { name: /Conocer Estación Desktop/i });
    fireEvent.click(learnMoreBtn);
    expect(onClose).toHaveBeenCalled();
    expect(onNavigateToDesktop).toHaveBeenCalled();
  });
});
