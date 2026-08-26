import { useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  HardDrive,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import logoUrl from '../assets/logo-lockup-transparent.png';
import type { AppModuleTab } from '../types';

interface IntroductionProps {
  onOpenStation: (tab?: AppModuleTab) => void;
}

export function Introduction({ onOpenStation }: IntroductionProps) {
  const [isEntering, setIsEntering] = useState(false);

  const handleStart = (tab?: AppModuleTab) => {
    setIsEntering(true);
    setTimeout(() => {
      onOpenStation(tab);
    }, 200);
  };

  return (
    <div className="relative flex min-h-screen w-screen select-none items-center justify-center overflow-x-hidden bg-legal-shell font-sans text-white p-4 sm:p-6 md:py-12">
      {/* Ambient Lighting & Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.12)_0%,transparent_70%)] filter blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.28)_0%,transparent_75%)] filter blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-legal-gold/40 to-transparent" />
      </div>

      {/* Main Presentation Container */}
      <main
        className={`relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8 text-center py-4 sm:py-6 transition-all duration-300 ${
          isEntering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-full max-w-[240px] sm:max-w-[320px] flex justify-center">
            <img
              src={logoUrl}
              alt="Logotipo Lex Corporativo"
              width={320}
              height={70}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(197,160,89,0.25)]"
            />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-legal-gold/30 bg-legal-gold/10 px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-legal-gold shadow-xs">
            <Sparkles size={13} /> Plataforma de Consulta Federal
          </span>

          <p className="max-w-xl text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Suite jurídica digital y radar federal. Consulta táctica en la web o descarga la estación de trabajo profesional para Windows.
          </p>
        </div>

        {/* Primary Interactive Cards: Core Web Modules (Dual-Column Grid) */}
        <div className="w-full grid gap-4 sm:grid-cols-2 text-left">
          {/* Card 1: Licitaciones Públicas CompraNet (High-Action Primary) */}
          <div className="relative group rounded-2xl border border-legal-gold/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-legal-gold/60 hover:shadow-2xl hover:shadow-legal-gold/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-legal-gold">
                  <Landmark size={20} />
                </span>
                <span className="rounded-md bg-legal-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-legal-gold uppercase tracking-wider">
                  CompraNet
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-legal-gold transition">
                Licitaciones Abiertas
              </h2>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Radar de contrataciones públicas federales de CompraNet, monitoreo de plazos y convocatorias oficiales.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStart('licitaciones')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 px-4 py-3 text-xs font-extrabold transition shadow-md shadow-legal-gold/20 group-hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span>Explorar Licitaciones</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Card 2: Legislación Federal (Tactical Local Engine) */}
          <div className="relative group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <BookOpenCheck size={20} />
                </span>
                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
                  13 Leyes Federales
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition">
                Legislación Federal
              </h2>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Buscador normativo instantáneo sobre 5,011 artículos y reglas federales con motor SQLite WASM en sesión.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleStart('normativa')}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-4 py-3 text-xs font-bold transition hover:border-slate-600 hover:text-white group-hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span>Consultar Legislación Federal</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Station Showcase: Desktop App for Windows */}
        <div className="w-full rounded-2xl border border-legal-gold/30 bg-slate-950/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm transition-all hover:border-legal-gold/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-legal-gold/40 text-legal-gold">
                <HardDrive size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm sm:text-base font-bold text-white">
                    Lex Corporativo Desktop
                  </span>
                  <span className="rounded-md bg-legal-gold/20 px-1.5 py-0.5 text-[9px] font-extrabold text-legal-gold uppercase tracking-wider">
                    Windows
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Estación de trabajo local para auditoría contractual en 5 materias, redacción en Word/PDF y bóveda de expedientes privada (BYOK).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStart('desktop')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-legal-gold/40 bg-legal-gold/10 hover:bg-legal-gold text-legal-gold hover:text-slate-950 px-5 py-2.5 text-xs font-extrabold transition shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Estación Desktop (Instalador Windows)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap size={13} className="text-legal-gold" /> Sin registro ni costo
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <Scale size={13} className="text-blue-400" /> Respaldo oficial federal
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" /> Procesamiento Local en Navegador
          </span>
        </div>
      </main>
    </div>
  );
}
