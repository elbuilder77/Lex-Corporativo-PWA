import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, FilePenLine, HelpCircle, Home, Info, Landmark, Map, MonitorDown, Scale, ShieldCheck, X } from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import { clearRetiredSavedData } from '../lib/coverage-sources';
import { CoverageSourcesSheet } from './CoverageSourcesSheet';
import { SearchInfoSheet } from './SearchInfoSheet';
import { useUiStore } from '../store/useUiStore';
import type { AppModuleTab } from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AppShellProps {
  activeTab: AppModuleTab;
  onTabChange: (tab: AppModuleTab) => void;
  onGoHome: () => void;
  children: ReactNode;
}

export function AppShell({ activeTab, onTabChange, onGoHome, children }: AppShellProps) {
  const { notifications, dismissNotification, setIsOnline } = useUiStore();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [panel, setPanel] = useState<'coverage' | 'info' | null>(null);

  useEffect(() => {
    clearRetiredSavedData();
  }, []);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, [setIsOnline]);

  useEffect(() => {
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const installed = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-legal-shell/95 backdrop-blur-md text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
          {/* Brand Logo and Title - Returns to Home */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left focus:outline-hidden hover:opacity-90 transition cursor-pointer"
            aria-label="Ir a la pantalla de inicio"
            title="Volver a la portada de inicio"
          >
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-legal-gold/30 bg-black shadow-md shadow-black/30">
              <img src={logoMark} alt="Lex Corporativo" className="h-full w-full object-cover" />
            </span>
            <span className="hidden sm:block">
              <strong className="block font-serif text-sm font-semibold tracking-wide text-white leading-none">
                Lex Corporativo
              </strong>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Plataforma jurídica local</span>
            </span>
          </button>

          {/* Module Switcher Tabs */}
          <nav
            aria-label="Módulos de consulta"
            className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-1"
          >
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Volver a la pantalla de inicio"
            >
              <Home size={15} />
              <span>Inicio</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('normativa')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'normativa'
                  ? 'bg-legal-gold text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale size={15} />
              <span className="hidden xs:inline">Legislación</span>
              <span className="xs:hidden">Leyes</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('licitaciones')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'licitaciones'
                  ? 'bg-legal-gold text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Landmark size={15} />
              <span>Licitaciones</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('estudio')}
              className={`flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                activeTab === 'estudio'
                  ? 'bg-legal-gold text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FilePenLine size={15} />
              <span>Estudio</span>
            </button>
            <span className="mx-1 h-6 w-px bg-slate-700" aria-hidden="true" />
            <button
              type="button"
              onClick={() => onTabChange('desktop')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === 'desktop'
                  ? 'bg-legal-gold text-slate-950 shadow-sm font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MonitorDown size={15} />
              <span>Desktop</span>
            </button>
          </nav>

          {/* Action Buttons: Coverage & Info */}
          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950 px-3 py-1.5 xl:flex">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[9px] font-bold leading-tight text-emerald-200">Datos en este dispositivo<br /><span className="font-medium text-emerald-400">Disponible sin conexión</span></span>
            </div>
            <button
              type="button"
              onClick={() => setPanel('coverage')}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
              aria-label="Abrir cobertura y fuentes"
            >
              <Map size={17} />
              <span className="hidden md:inline">Cobertura</span>
            </button>
            <button
              type="button"
              onClick={() => setPanel('info')}
              className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label="Información"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Active Module Content */}
      <div className="pb-16 sm:pb-0">
        {children}
      </div>

      {/* Coverage & Sources Sheet */}
      <CoverageSourcesSheet open={panel === 'coverage'} onClose={() => setPanel(null)} />

      {/* Info Sheet */}
      <SearchInfoSheet open={panel === 'info'} onClose={() => setPanel(null)} />

      {/* Notifications Toast */}
      <div className="pointer-events-none fixed right-3 top-16 z-[60] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-2xl border border-slate-700 bg-slate-950/95 p-3.5 text-xs text-white shadow-2xl backdrop-blur-md"
          >
            {notification.type === 'success' ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
            ) : notification.type === 'error' ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            ) : (
              <Info size={16} className="mt-0.5 shrink-0 text-legal-gold" />
            )}
            <p className="flex-1 leading-5 text-slate-200">{notification.message}</p>
            <button
              type="button"
              onClick={() => dismissNotification(notification.id)}
              className="flex min-h-8 min-w-8 items-center justify-center text-slate-400 hover:text-white"
              aria-label="Cerrar"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* PWA Install Prompt */}
      {installPrompt && (
        <div
          className="fixed bottom-3 left-3 right-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white shadow-2xl"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <img
            src={logoMark}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl border border-legal-gold/20 object-cover"
          />
          <p className="flex-1 text-xs font-semibold leading-5">
            Lleva Lex Corporativo contigo. Acceso directo a legislación federal y radar de licitaciones públicas.
          </p>
          <button
            type="button"
            onClick={install}
            className="min-h-10 rounded-xl bg-legal-gold px-4 text-xs font-extrabold text-slate-950 hover:bg-legal-goldhover"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={() => setInstallPrompt(null)}
            className="flex min-h-10 min-w-10 items-center justify-center text-slate-400"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Módulos de consulta"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-800 bg-legal-shell/98 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          type="button"
          onClick={onGoHome}
          className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition"
          title="Volver a la pantalla de inicio"
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('normativa')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold uppercase tracking-widest transition ${
            activeTab === 'normativa'
              ? 'text-legal-gold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale size={18} />
          <span>Leyes</span>
          {activeTab === 'normativa' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-legal-gold" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('licitaciones')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold uppercase tracking-widest transition ${
            activeTab === 'licitaciones'
              ? 'text-legal-gold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark size={18} />
          <span>Licitaciones</span>
          {activeTab === 'licitaciones' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-legal-gold" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('estudio')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[9px] font-extrabold uppercase tracking-wider transition ${
            activeTab === 'estudio' ? 'text-legal-gold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FilePenLine size={18} />
          <span>Estudio</span>
          {activeTab === 'estudio' && <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-legal-gold" />}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('desktop')}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-extrabold uppercase tracking-widest transition ${
            activeTab === 'desktop'
              ? 'text-legal-gold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MonitorDown size={18} />
          <span>Desktop</span>
          {activeTab === 'desktop' && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-legal-gold" />
          )}
        </button>
      </nav>
    </div>
  );
}
