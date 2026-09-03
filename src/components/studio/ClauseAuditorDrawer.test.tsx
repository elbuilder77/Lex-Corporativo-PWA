import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClauseAuditorDrawer } from './ClauseAuditorDrawer';
import type { LegalCitation } from '../../types';

describe('ClauseAuditorDrawer', () => {
  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <ClauseAuditorDrawer
        isOpen={false}
        onClose={vi.fn()}
        documentText="Texto del pagaré"
        citations={[]}
        onQuickSearch={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('detecta cláusula de pagaré e intereses moratorios en el texto', () => {
    const onQuickSearch = vi.fn();
    render(
      <ClauseAuditorDrawer
        isOpen={true}
        onClose={vi.fn()}
        documentText="El suscriptor pagará incondicionalmente este pagaré más un interés moratorio al 6% anual."
        citations={[]}
        onQuickSearch={onQuickSearch}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Auditor de Fundamentación' })).toBeInTheDocument();
    expect(screen.getByText('Requisitos de Validez del Pagaré')).toBeInTheDocument();
    expect(screen.getByText('Intereses Moratorios y Pacto de Interés')).toBeInTheDocument();

    const fundamentarBtns = screen.getAllByRole('button', { name: /Fundamentar/i });
    expect(fundamentarBtns.length).toBeGreaterThan(0);

    fireEvent.click(fundamentarBtns[0]);
    expect(onQuickSearch).toHaveBeenCalled();
  });

  it('muestra estado fundamentado cuando ya existe una cita correspondiente', () => {
    const mockCitations: LegalCitation[] = [
      {
        id: 'c1',
        articleId: 'lgtoc-170',
        lawCode: 'LGTOC',
        lawName: 'Ley General de Títulos y Operaciones de Crédito',
        articleNumber: 'Art. 170',
        title: 'Requisitos del pagaré',
        content: 'El pagaré debe contener...',
        sourceName: 'Cámara de Diputados',
        sourceUrl: 'https://diputados.gob.mx',
        createdAt: new Date().toISOString(),
      },
    ];

    render(
      <ClauseAuditorDrawer
        isOpen={true}
        onClose={vi.fn()}
        documentText="Por este pagaré me obligo a pagar."
        citations={mockCitations}
        onQuickSearch={vi.fn()}
      />,
    );

    expect(screen.getByText(/Fundamentada en notas/i)).toBeInTheDocument();
  });
});
