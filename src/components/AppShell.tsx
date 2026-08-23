import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import logoMark from '../assets/logo-mark.png';
import { useSearchStore } from '../store/useSearchStore';
import { useUiStore } from '../store/useUiStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { notifications, dismissNotification, setIsOnline } = useUiStore();
  const loadFromStorage = useSearchStore((state) => state.loadFromStorage);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, [setIsOnline]);

  useEffect(() => {
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as BeforeInstallPromptEvent); };
    const installed = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    return () => { window.removeEventListener('beforeinstallprompt', beforeInstall); window.removeEventListener('appinstalled', installed); };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children}

      <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto flex items-start gap-2.5 rounded-2xl border border-slate-700 bg-slate-950/95 p-3.5 text-xs text-white shadow-2xl">
            {notification.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" /> : notification.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" /> : <Info size={16} className="mt-0.5 shrink-0 text-legal-gold" />}
            <p className="flex-1 leading-5 text-slate-200">{notification.message}</p>
            <button type="button" onClick={() => dismissNotification(notification.id)} className="flex min-h-8 min-w-8 items-center justify-center text-slate-400" aria-label="Cerrar"><X size={15} /></button>
          </div>
        ))}
      </div>

      {installPrompt && (
        <div className="fixed bottom-3 left-3 right-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white shadow-2xl" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
          <img src={logoMark} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-legal-gold/20 object-cover" />
          <p className="flex-1 text-xs font-semibold leading-5">Lleva Lex Corporativo contigo. Instálalo para consultar incluso sin conexión.</p>
          <button type="button" onClick={install} className="min-h-11 rounded-xl bg-legal-gold px-4 text-xs font-extrabold text-slate-950">Instalar</button>
          <button type="button" onClick={() => setInstallPrompt(null)} className="flex min-h-11 min-w-11 items-center justify-center text-slate-400" aria-label="Cerrar"><X size={17} /></button>
        </div>
      )}
    </div>
  );
}
