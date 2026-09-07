import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FootnotesAppendix } from './FootnotesAppendix';
import type { LegalCitation } from '../../types';

const mockCitations: LegalCitation[] = [
  {
    id: 'cit-1',
    articleId: 'ccom-1054',
    lawCode: 'CCom',
    lawName: 'Código de Comercio',
    articleNumber: 'Art. 1054',
    title: 'Supletoriedad procesal',
    content: 'En los juicios mercantiles...',
    sourceName: 'Diario Oficial de la Federación',
    sourceUrl: 'https://dof.gob.mx',
    createdAt: new Date().toISOString(),
  },
];

describe('FootnotesAppendix', () => {
  it('no renderiza nada si no hay citas', () => {
    const { container } = render(<FootnotesAppendix citations={[]} onRemoveCitation={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza la lista de notas al pie con metadatos oficiales', () => {
    const onRemove = vi.fn();
    render(<FootnotesAppendix citations={mockCitations} onRemoveCitation={onRemove} />);

    expect(screen.getByText(/Notas al Pie y Apéndice de Fundamentación Legal/i)).toBeInTheDocument();
    expect(screen.getByText(/Código de Comercio, Art. 1054/i)).toBeInTheDocument();
    expect(screen.getByText('En los juicios mercantiles...')).toBeInTheDocument();

    const deleteBtn = screen.getByLabelText('Eliminar cita 1');
    fireEvent.click(deleteBtn);
    expect(onRemove).toHaveBeenCalledWith('cit-1');
  });
});
