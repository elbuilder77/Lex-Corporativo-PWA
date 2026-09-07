import { fireEvent, render, screen } from '@testing-library/react';
import { AccessibleDialog } from './AccessibleDialog';

describe('AccessibleDialog', () => {
  it('contains keyboard focus, closes with Escape, and restores the trigger and background', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const onClose = vi.fn();
    const { rerender } = render(<AccessibleDialog isOpen onClose={onClose} label="Borradores"><button>Primero</button><button>Último</button></AccessibleDialog>);
    expect(screen.getByText('Primero')).toHaveFocus();
    expect(trigger).toHaveAttribute('inert');
    fireEvent.keyDown(screen.getByText('Primero'), { key: 'Tab', shiftKey: true });
    expect(screen.getByText('Último')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Último'), { key: 'Tab' });
    expect(screen.getByText('Primero')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Primero'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
    rerender(<AccessibleDialog isOpen={false} onClose={onClose} label="Borradores"><button>Primero</button></AccessibleDialog>);
    expect(trigger).not.toHaveAttribute('inert');
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('keeps a dialog without controls focusable and preserves an already inert background', () => {
    const background = document.createElement('div');
    background.setAttribute('inert', '');
    document.body.append(background);
    const { unmount } = render(<AccessibleDialog isOpen onClose={vi.fn()} label="Recuperando">Cargando</AccessibleDialog>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(dialog).toHaveFocus();
    unmount();
    expect(background).toHaveAttribute('inert');
    background.remove();
  });

  it('keeps the background inert when an underlying dialog closes first', () => {
    const background = document.createElement('button');
    document.body.append(background);
    const { rerender, unmount } = render(<><AccessibleDialog isOpen onClose={vi.fn()} label="Catálogo"><button>Plantilla</button></AccessibleDialog><AccessibleDialog isOpen onClose={vi.fn()} label="Variables"><button>Guardar variables</button></AccessibleDialog></>);
    rerender(<><AccessibleDialog isOpen={false} onClose={vi.fn()} label="Catálogo"><button>Plantilla</button></AccessibleDialog><AccessibleDialog isOpen onClose={vi.fn()} label="Variables"><button>Guardar variables</button></AccessibleDialog></>);
    expect(background).toHaveAttribute('inert');
    unmount();
    expect(background).not.toHaveAttribute('inert');
    background.remove();
  });
});
