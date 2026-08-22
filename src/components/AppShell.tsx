import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, NAV_ITEMS } from './Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { AiStudioTutorialModal } from './AiStudioTutorialModal';
import { UnlockLicenseModal } from './UnlockLicenseModal';
import { Sparkles, Lock, CheckCircle2, Settings, X, AlertCircle, Download, MonitorSmartphone, RefreshCw } from 'lucide-react';
import logoUrl from '../assets/logo-mark.png';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, apiKey, setShowUnlockModal } = useAuthStore();
  const { notifications, dismissNotification } = useUiStore();

  const currentPath = location.pathname;
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  // Handle beforeinstallprompt for custom install banner
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after a delay to not interrupt first experience
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check for SW updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (navigator.serviceWorker.controller) {
          setSwUpdateAvailable(true);
        }
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleSwUpdate = () => {
    window.location.reload();
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-legal-shell text-slate-100 select-none">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-slate-800 bg-legal-rail shrink-0 z-20">
          <button
            type="button"
            onClick={() => navigate('/buscador')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <img src={logoUrl} alt="Lex Corp" className="w-full h-full object-contain brightness-200" />
            </div>
            <span className="text-xs font-bold text-white tracking-wider">LEX CORP</span>
          </button>

          <div className="flex items-center gap-2">
            {mode === 'unlocked' ? (
              <span className="flex items-center gap-1.5 rounded-full bg-legal-gold/15 border border-legal-gold/30 px-2.5 py-0.5 text-[10px] font-bold text-legal-gold">
                <CheckCircle2 size={12} />
                <span>Full Pro</span>
              </span>
            ) : apiKey ? (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-300">
                <Sparkles size={12} />
                <span>Gemini</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-legal-gold px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-xs cursor-pointer"
              >
                <Lock size={11} />
                <span>Activar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              aria-label="Ajustes"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Viewport for Routes */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-50 text-slate-900 pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-800 bg-legal-rail/95 backdrop-blur-md px-2 flex items-center justify-around z-40 shadow-2xl" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path || (item.path === '/buscador' && currentPath === '/');
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition relative ${
                  isActive ? 'text-legal-gold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold tracking-tight">{item.shortLabel}</span>
                {isActive && (
                  <div className="absolute -bottom-1 w-8 h-1 rounded-t-full bg-legal-gold" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Notifications Toast */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[90vw] pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-2xl p-3.5 shadow-2xl border backdrop-blur-md text-xs transition-all animate-in slide-in-from-top-2 ${
              n.type === 'success'
                ? 'bg-slate-950/95 text-slate-100 border-green-500/40 shadow-green-950/20'
                : n.type === 'error'
                ? 'bg-slate-950/95 text-slate-100 border-red-500/40 shadow-red-950/20'
                : 'bg-slate-950/95 text-slate-100 border-slate-700 shadow-black/40'
            }`}
          >
            {n.type === 'success' ? (
              <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
            ) : n.type === 'error' ? (
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles size={16} className="text-legal-gold shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {n.title && <p className="font-bold text-white mb-0.5">{n.title}</p>}
              <p className="text-slate-300 leading-snug">{n.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissNotification(n.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* PWA Install Banner - Bottom Sheet on Mobile */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={handleDismissInstall}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-legal-rail text-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-legal-gold/10 text-legal-gold border border-legal-gold/20">
                  <MonitorSmartphone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Instalar Lex Corporativo</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">Acceso rápido desde tu pantalla de inicio, funciona offline</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-legal-gold px-4 py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-legal-goldhover transition cursor-pointer"
                >
                  <Download size={18} />
                  <span>Instalar App</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismissInstall}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                  <span className="hidden sm:inline">Luego</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SW Update Notification Toast */}
      {swUpdateAvailable && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-900/95 border border-legal-gold/40 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-legal-gold/20 text-legal-gold">
              <RefreshCw size={20} className="animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">Nueva versión disponible</p>
              <p className="text-[11px] text-slate-300">Se han actualizado mejoras y correcciones</p>
            </div>
            <button
              type="button"
              onClick={handleSwUpdate}
              className="shrink-0 rounded-xl bg-legal-gold px-4 py-2 text-sm font-bold text-slate-950 hover:bg-legal-goldhover transition cursor-pointer"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => setSwUpdateAvailable(false)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label="Descartar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AiStudioTutorialModal />
      <UnlockLicenseModal />
    </div>
  );
};

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
