import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudioWelcomeHub } from './StudioWelcomeHub';
import type { StudioDocument } from '../../types';

const mockDraft: StudioDocument = {
  id: 'doc-123',
  title: 'Contrato de Suministro Mercantil',
  sourceKind: 'template',
  editorHtml: '<p>Contenido</p>',
  citations: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('StudioWelcomeHub', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <StudioWelcomeHub
        isOpen={false}
        onClose={vi.fn()}
        onOpenCatalog={vi.fn()}
        onSelectBlank={vi.fn()}
        onTriggerImport={vi.fn()}
        recentDraft={null}
        onOpenDraft={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra las 3 vías de inicio cuando isOpen es true', () => {
    const onOpenCatalog = vi.fn();
    const onSelectBlank = vi.fn();
    const onTriggerImport = vi.fn();

    render(
      <StudioWelcomeHub
        isOpen={true}
        onClose={vi.fn()}
        onOpenCatalog={onOpenCatalog}
        onSelectBlank={onSelectBlank}
        onTriggerImport={onTriggerImport}
        recentDraft={null}
        onOpenDraft={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /Estudio Jurídico & Redacción/i })).toBeInTheDocument();
    expect(screen.getByText('Plantilla Jurídica')).toBeInTheDocument();
    expect(screen.getByText('Subir Documento')).toBeInTheDocument();
    expect(screen.getByText('Lienzo en Blanco')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Plantilla Jurídica'));
    expect(onOpenCatalog).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Subir Documento'));
    expect(onTriggerImport).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Lienzo en Blanco'));
    expect(onSelectBlank).toHaveBeenCalled();
  });

  it('permite reanudar el último borrador si existe', () => {
    const onOpenDraft = vi.fn();
    render(
      <StudioWelcomeHub
        isOpen={true}
        onClose={vi.fn()}
        onOpenCatalog={vi.fn()}
        onSelectBlank={vi.fn()}
        onTriggerImport={vi.fn()}
        recentDraft={mockDraft}
        onOpenDraft={onOpenDraft}
      />,
    );

    expect(screen.getByText('Continuar Borrador Activo')).toBeInTheDocument();
    expect(screen.getByText('Contrato de Suministro Mercantil')).toBeInTheDocument();

    const openDraftBtn = screen.getByRole('button', { name: /Abrir Borrador →/i });
    fireEvent.click(openDraftBtn);
    expect(onOpenDraft).toHaveBeenCalledWith(mockDraft);
  });
});
