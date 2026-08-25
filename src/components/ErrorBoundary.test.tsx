import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function ProblemChild(): never {
  throw new Error('Test crash in child component');
}

describe('ErrorBoundary Component', () => {
  it('renderiza a los hijos normalmente cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <div>Contenido Seguro</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Contenido Seguro')).toBeInTheDocument();
  });

  it('captura errores en tiempo de render y muestra la interfaz de recuperación', () => {
    // Suppress console.error in test log
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { name: /No se pudo mostrar esta pantalla/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver al buscador/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
