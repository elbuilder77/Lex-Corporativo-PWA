import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TemplateCatalogModal } from './TemplateCatalogModal';
import type { LegalTemplate } from '../../types';

const mockTemplates: LegalTemplate[] = [
  {
    id: 'pagare_mercantil',
    title: 'Pagaré Mercantil con Aval',
    module: 'mercantil',
    intentGroup: 'Títulos de Crédito',
    description: 'Instrumento cambiario formal.',
    templateHandlebars: '<p>Pagaré</p>',
    fields: [
      { id: 'monto', label: 'Monto', type: 'text', placeholder: '$0.00', required: true },
    ],
  },
  {
    id: 'contrato_laboral',
    title: 'Contrato Individual de Trabajo',
    module: 'laboral',
    intentGroup: 'Contratación',
    description: 'Relación laboral por tiempo indeterminado.',
    templateHandlebars: '<p>Contrato</p>',
    fields: [
      { id: 'salario', label: 'Salario diario', type: 'text', placeholder: '$0.00', required: true },
    ],
  },
];

describe('TemplateCatalogModal', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <TemplateCatalogModal
        isOpen={false}
        onClose={vi.fn()}
        templates={mockTemplates}
        selectedTemplate={null}
        onSelectTemplate={vi.fn()}
        onSelectBlank={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza la lista de plantillas y permite filtrar por búsqueda', () => {
    const onSelect = vi.fn();
    render(
      <TemplateCatalogModal
        isOpen={true}
        onClose={vi.fn()}
        templates={mockTemplates}
        selectedTemplate={null}
        onSelectTemplate={onSelect}
        onSelectBlank={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Biblioteca de Instrumentos' })).toBeInTheDocument();
    expect(screen.getByText('Pagaré Mercantil con Aval')).toBeInTheDocument();
    expect(screen.getByText('Contrato Individual de Trabajo')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar por contrato, pagaré/i);
    fireEvent.change(searchInput, { target: { value: 'pagaré' } });

    expect(screen.getByText('Pagaré Mercantil con Aval')).toBeInTheDocument();
    expect(screen.queryByText('Contrato Individual de Trabajo')).not.toBeInTheDocument();
  });

  it('llama a onSelectTemplate al hacer clic en una plantilla', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <TemplateCatalogModal
        isOpen={true}
        onClose={onClose}
        templates={mockTemplates}
        selectedTemplate={null}
        onSelectTemplate={onSelect}
        onSelectBlank={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Pagaré Mercantil con Aval'));
    expect(onSelect).toHaveBeenCalledWith(mockTemplates[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
