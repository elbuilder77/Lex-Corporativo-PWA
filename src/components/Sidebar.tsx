import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileSearch,
  Settings,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import logoUrl from '../assets/logo-mark.png';

export interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  activeColor: string;
  dot: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: '/buscador',
    label: 'Búsqueda en Normativa Oficial',
    shortLabel: 'Buscar',
    icon: <FileSearch size={20} />,
    activeColor: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  {
    path: '/historial',
    label: 'Historial & Favoritos',
    shortLabel: 'Historial',
    icon: <History size={20} />,
    activeColor: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  {
    path: '/settings',
    label: 'Ajustes & Claves',
    shortLabel: 'Ajustes',
    icon: <Settings size={20} />,
    activeColor: 'text-slate-300',
    dot: 'bg-slate-400',
  },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const { mode, apiKey, setShowUnlockModal } = useAuthStore();

  const currentPath = location.pathname;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-800 bg-legal-rail text-white transition-all duration-300 relative z-30 ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 h-[72px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/buscador')}
          className="flex items-center gap-3 text-left overflow-hidden cursor-pointer"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Lex Corp" className="w-full h-full object-contain brightness-200" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-xs font-bold text-white truncate tracking-wider">LEX CORPORATIVO</h1>
              <p className="text-[10px] uppercase font-bold text-legal-gold tracking-widest">Estación PWA</p>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 text-slate-500 hover:text-white rounded-md transition cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expandir' : 'Contraer'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-hide">
        {!sidebarCollapsed && (
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Módulos Principales
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/buscador' && currentPath === '/');
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition relative group cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border border-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              {isActive && <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${item.dot}`} />}
              <span className={isActive ? item.activeColor : 'text-slate-400 group-hover:text-slate-200'}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {mode === 'unlocked' ? (
          <div className={`rounded-xl bg-legal-gold/10 border border-legal-gold/20 p-2.5 flex items-center gap-2 ${sidebarCollapsed ? 'justify-center p-2' : ''}`}>
            <CheckCircle2 size={16} className="text-legal-gold shrink-0" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-legal-gold truncate">Licencia Pro Activa</p>
                <p className="text-[9px] text-slate-400">Acceso Ilimitado</p>
              </div>
            )}
          </div>
        ) : apiKey ? (
          <div className={`rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 flex items-center gap-2 ${sidebarCollapsed ? 'justify-center p-2' : ''}`}>
            <Sparkles size={16} className="text-blue-400 shrink-0" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-blue-300 truncate">Google AI Studio</p>
                <p className="text-[9px] text-slate-400">BYOK Conectado</p>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUnlockModal(true)}
            className={`w-full rounded-xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 p-2.5 flex items-center gap-2 font-bold text-xs shadow-md transition cursor-pointer ${
              sidebarCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <Lock size={16} className="shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Desbloquear App</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
