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

    expect(screen.getByRole('heading', { name: 'Estudio Jurídico', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Redacción documental/i)).toBeInTheDocument();
    expect(screen.getByTitle('Iniciar nuevo documento o abrir asistente de inicio')).toBeInTheDocument();
    expect(screen.getByTitle('Ver borradores locales')).toBeInTheDocument();
    expect(screen.getByTitle('Importar DOCX, PDF o TXT')).toBeInTheDocument();
    expect(screen.getByTitle('Auditar fundamentación legal del borrador')).toBeInTheDocument();
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

  it('muestra el asistente de fundamentación y permite consultar materias del corpus', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const fundBtn = screen.getByTitle('Abrir asistente de fundamentación y citas');
    await act(async () => {
      fireEvent.click(fundBtn);
    });

    expect(screen.getByRole('heading', { name: 'Asistente de Fundamentación' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar fundamento' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Área jurídica' })).toBeInTheDocument();
  });

  it('permite abrir el auditor semántico de fundamentación', async () => {
    await act(async () => {
      render(<DraftingStudio />);
    });

    const auditBtn = screen.getByTitle('Auditar fundamentación legal del borrador');
    await act(async () => {
      fireEvent.click(auditBtn);
    });

    expect(screen.getByRole('dialog', { name: 'Auditor de Fundamentación Legal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Auditor de Fundamentación' })).toBeInTheDocument();
    expect(screen.getByText(/Salud de Fundamentación/i)).toBeInTheDocument();
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
