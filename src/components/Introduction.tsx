import { useState } from 'react';
import { ArrowRight, BookOpenCheck, Landmark, Scale, ShieldCheck, Sparkles, Zap } from 'lucide-react';
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
    <div className="relative flex min-h-screen w-screen select-none items-center justify-center overflow-x-hidden bg-legal-shell font-sans text-white p-4 sm:p-6">
      {/* Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.12)_0%,transparent_70%)] filter blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.25)_0%,transparent_75%)] filter blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-legal-gold/40 to-transparent" />
      </div>

      {/* Main Presentation Container */}
      <main
        className={`relative z-10 flex w-full max-w-2xl flex-col items-center gap-5 sm:gap-6 text-center py-6 sm:py-10 transition-all duration-300 ${
          isEntering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Brand Logo Lockup */}
        <div className="w-full max-w-[220px] sm:max-w-[340px] flex justify-center">
          <img
            src={logoUrl}
            alt="Logotipo Lex Corporativo"
            className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(197,160,89,0.25)]"
          />
        </div>

        {/* Platform Badge Tag */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-legal-gold/30 bg-legal-gold/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-legal-gold shadow-xs">
          <Sparkles size={13} /> Plataforma de Consulta Federal
        </span>

        {/* Primary CTA + Module Entry Cards */}
        <div className="w-full space-y-3 pt-2">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => handleStart('licitaciones')}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 rounded-2xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 px-8 py-4 text-sm font-extrabold transition-all duration-300 shadow-[0_10px_30px_rgba(197,160,89,0.35)] hover:scale-[1.02] cursor-pointer active:scale-95"
          >
            <Landmark size={18} />
            <span>Explorar Licitaciones</span>
            <ArrowRight size={18} />
          </button>

          {/* Secondary entry */}
          <button
            type="button"
            onClick={() => handleStart('normativa')}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 text-slate-200 px-8 py-3 text-sm font-bold transition-all hover:border-slate-600 cursor-pointer active:scale-95"
          >
            <BookOpenCheck size={16} className="text-legal-gold" />
            <span>Consultar Legislación Federal</span>
          </button>

          {/* Desktop App Link */}
          <button
            type="button"
            onClick={() => handleStart('desktop')}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 rounded-2xl border border-legal-gold/30 bg-slate-950/80 hover:bg-slate-900 text-legal-gold px-8 py-2.5 text-xs font-bold transition-all hover:border-legal-gold cursor-pointer active:scale-95 shadow-sm"
          >
            <span>💻</span>
            <span>Estación Desktop (Instalador Windows)</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">
            <Zap size={13} className="text-legal-gold" /> Sin registro ni API Key
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <Scale size={13} className="text-blue-400" /> Respaldo oficial
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" /> PWA Gratuita
          </span>
        </div>
      </main>
    </div>
  );
}
