import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const { beforeLeave } = vi.hoisted(() => ({ beforeLeave: vi.fn<() => Promise<boolean>>() }));
vi.mock('./components/DraftingStudio', () => ({
  DraftingStudio: ({ registerBeforeLeave }: { registerBeforeLeave?: (guard: (() => Promise<boolean>) | null) => void }) => {
    useEffect(() => { registerBeforeLeave?.(beforeLeave); return () => registerBeforeLeave?.(null); }, [registerBeforeLeave]);
    return <h1>Borrador activo</h1>;
  },
}));
vi.mock('./components/BuscadorLegal', () => ({ BuscadorLegal: () => <h1>Normativa visible</h1> }));
vi.mock('./components/BuscadorLicitaciones', () => ({ BuscadorLicitaciones: () => <h1>Licitaciones visibles</h1> }));
vi.mock('./components/AppShell', () => ({ AppShell: ({ children, onTabChange, onGoHome }: { children: React.ReactNode; onTabChange: (tab: string) => void; onGoHome: () => void }) => <div><button onClick={() => onTabChange('normativa')}>Normativa</button><button onClick={onGoHome}>Inicio</button>{children}</div> }));

describe('navigation with a draft session', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('lex_pwa_station_opened', '1');
    window.history.replaceState(null, '', '/?tab=estudio');
    beforeLeave.mockReset().mockResolvedValue(true);
  });

  it.each(['?q=contrato', '?law=LFT', '?scope=federal', '?tab=normativa'])('resolves a normative history URL %s after saving', async (query) => {
    render(<App />);
    await screen.findByText('Borrador activo');
    await act(async () => { window.history.pushState(null, '', `/${query}`); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(await screen.findByText('Normativa visible')).toBeInTheDocument();
    expect(beforeLeave).toHaveBeenCalledOnce();
  });

  it('keeps the document and URL when saving fails, then allows a retry', async () => {
    beforeLeave.mockResolvedValue(false);
    render(<App />);
    await screen.findByText('Borrador activo');
    await act(async () => { fireEvent.click(screen.getByText('Normativa')); });
    expect(screen.getByText('Borrador activo')).toBeInTheDocument();
    expect(window.location.search).toBe('?tab=estudio');
    await act(async () => { fireEvent.click(screen.getByText('Inicio')); });
    expect(screen.getByText('Borrador activo')).toBeInTheDocument();
    expect(localStorage.getItem('lex_pwa_station_opened')).toBe('1');
    beforeLeave.mockResolvedValue(true);
    fireEvent.click(screen.getByText('Normativa'));
    await screen.findByText('Normativa visible');
  });

  it('restores the studio URL when a history transition cannot save', async () => {
    beforeLeave.mockResolvedValue(false);
    render(<App />);
    await screen.findByText('Borrador activo');
    await act(async () => { window.history.pushState(null, '', '/?q=contrato'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await waitFor(() => expect(window.location.search).toBe('?tab=estudio'));
    expect(screen.getByText('Borrador activo')).toBeInTheDocument();
  });

  it('waits for the pending save before unmounting the editor', async () => {
    let finishSave!: (saved: boolean) => void;
    beforeLeave.mockReturnValue(new Promise<boolean>((resolve) => { finishSave = resolve; }));
    render(<App />);
    await screen.findByText('Borrador activo');
    fireEvent.click(screen.getByText('Normativa'));
    expect(screen.getByText('Borrador activo')).toBeInTheDocument();
    expect(window.location.search).toBe('?tab=estudio');
    await act(async () => { finishSave(true); });
    expect(screen.getByText('Normativa visible')).toBeInTheDocument();
  });
});
