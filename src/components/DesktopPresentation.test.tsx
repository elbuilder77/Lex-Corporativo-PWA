import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DesktopPresentation } from './DesktopPresentation';
import { DESKTOP_SPECS } from '../lib/desktop-specs';

describe('DesktopPresentation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza la ficha técnica con el instalador oficial y versión', () => {
    render(<DesktopPresentation />);

    expect(screen.getByRole('heading', { name: /Lex Corporativo Desktop/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(`v${DESKTOP_SPECS.version}`)).toBeInTheDocument();
    expect(screen.getByText(/Binario firmado digitalmente y distribuible/i)).toBeInTheDocument();
  });

  it('permite cambiar entre pestañas de materias jurídicas y muestra leyes correspondientes', async () => {
    render(<DesktopPresentation />);

    // Default area is mercantil
    expect(screen.getByRole('heading', { name: 'Mercantil y Corporativo' })).toBeInTheDocument();

    // Click Laboral
    const laboralBtn = screen.getByRole('button', { name: /Laboral y Relaciones de Trabajo/i });
    await act(async () => {
      fireEvent.click(laboralBtn);
    });

    expect(screen.getByText('Ley Federal del Trabajo (LFT)')).toBeInTheDocument();

    // Click Fiscal
    const fiscalBtn = screen.getByRole('button', { name: /Fiscal y Patrimonial/i });
    await act(async () => {
      fireEvent.click(fiscalBtn);
    });

    expect(screen.getByText('Código Fiscal de la Federación (CFF)')).toBeInTheDocument();
  });

  it('copia el hash SHA-512 al portapapeles al hacer clic en el botón de verificación', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
      });
    } else {
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(writeTextMock);
    }

    render(<DesktopPresentation />);

    const copyBtn = screen.getByRole('button', { name: /Copiar Hash SHA-512/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith(DESKTOP_SPECS.sha512);
  });
});
