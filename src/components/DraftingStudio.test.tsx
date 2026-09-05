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

    expect(screen.getByRole('heading', { name: 'Ingeniería Jurídica', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Redacción documental/i)).toBeInTheDocument();
    expect(screen.getByTitle('Iniciar nuevo documento o abrir asistente de inicio')).toBeInTheDocument();
    expect(screen.getByTitle('Ver borradores locales')).toBeInTheDocument();
    expect(screen.getByTitle('Importar DOCX, PDF o TXT')).toBeInTheDocument();
    expect(screen.getByTitle('Auditoría Contractual (Exclusivo de Lex Corporativo Desktop)')).toBeInTheDocument();
    expect(screen.getByTitle('Fundamentación y Citas (Exclusivo de Lex Corporativo Desktop)')).toBeInTheDocument();
  });

  it('permite abrir el catálogo modal de instrumentos y filtrar por materia', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const catalogBtn = screen.getByTitle('Abrir catálogo de plantillas e instrumentos');
    expect(catalogBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(catalogBtn);
    });

    expect(screen.getByRole('dialog', { name: 'Catálogo de instrumentos y plantillas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Biblioteca de Instrumentos' })).toBeInTheDocument();

    const mercantilBtns = screen.getAllByRole('button', { name: /Mercantil/i });
    expect(mercantilBtns.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(mercantilBtns[0]);
    });

    expect(screen.getByPlaceholderText(/Buscar por contrato, pagaré/i)).toBeInTheDocument();
  });

  it('bloquea el modo Fundamentar y muestra el modal exclusivo de Desktop', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const fundBtn = screen.getByTitle('Fundamentación y Citas (Exclusivo de Lex Corporativo Desktop)');
    await act(async () => {
      fireEvent.click(fundBtn);
    });

    expect(screen.getByRole('heading', { name: /Motor de Fundamentación y Citas en Vivo/i })).toBeInTheDocument();
    expect(screen.getByText(/Exclusivo de Lex Desktop/i)).toBeInTheDocument();
  });

  it('bloquea el modo Auditar y muestra el modal exclusivo de Desktop', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const auditBtn = screen.getByTitle('Auditoría Contractual (Exclusivo de Lex Corporativo Desktop)');
    await act(async () => {
      fireEvent.click(auditBtn);
    });

    expect(screen.getByRole('heading', { name: /Auditoría Contractual y Semántica/i })).toBeInTheDocument();
    expect(screen.getByText(/Exclusivo de Lex Desktop/i)).toBeInTheDocument();
  });

  it('abre el modal de borradores locales al hacer clic en Borradores', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const draftsBtn = screen.getByTitle('Ver borradores locales');
    await act(async () => {
      fireEvent.click(draftsBtn);
    });

    expect(screen.getByRole('dialog', { name: 'Borradores locales' })).toBeInTheDocument();
  });
});
