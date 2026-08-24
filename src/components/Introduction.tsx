import { useState } from 'react';
import { ArrowRight, BookOpenCheck, Landmark, Scale, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import logoUrl from '../assets/logo-lockup-transparent.png';
import logoMark from '../assets/logo-mark.png';
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
        className={`relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 text-center py-8 sm:py-12 transition-all duration-300 ${
          isEntering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top Emblem & Pill */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-legal-gold/40 bg-black/80 p-1 shadow-xl shadow-legal-gold/15">
            <img src={logoMark} alt="Emblema Lex Corporativo" className="h-full w-full rounded-xl object-cover" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-legal-gold/30 bg-legal-gold/10 px-3.5 py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.3em] text-legal-gold">
            <Sparkles size={13} /> Plataforma de Consulta Federal
          </span>
        </div>

        {/* Brand Logo Lockup */}
        <div className="w-full max-w-[300px] sm:max-w-[400px] flex justify-center pt-1">
          <img
            src={logoUrl}
            alt="Logotipo Lex Corporativo"
            className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(197,160,89,0.25)]"
          />
        </div>

        {/* Subtitle / Value Proposition */}
        <div className="max-w-xl space-y-2">
          <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-200 leading-snug">
            Legislación Federal y Buscador de Licitaciones Abiertas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-6">
            Consulta rápida, determinista y privada de disposiciones jurídicas oficiales y convocatorias vigentes de CompraNet en México, con soporte 100% offline en el dispositivo.
          </p>
        </div>

        {/* Highlighted Feature Cards (3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-2">
          {/* Card 1: Legislación */}
          <div
            onClick={() => handleStart('normativa')}
            className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center space-y-2 hover:border-legal-gold/50 hover:bg-slate-900/90 transition-all shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/80 text-blue-400 mx-auto group-hover:scale-110 transition">
              <BookOpenCheck size={20} />
            </div>
            <p className="text-xs font-bold text-slate-100">Buscador Normativo</p>
            <p className="text-[11px] text-slate-400 leading-4">
              5,011 disposiciones en 13 leyes y reglamentos federales
            </p>
          </div>

          {/* Card 2: Licitaciones */}
          <div
            onClick={() => handleStart('licitaciones')}
            className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center space-y-2 hover:border-legal-gold/50 hover:bg-slate-900/90 transition-all shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/80 text-legal-gold mx-auto group-hover:scale-110 transition">
              <Landmark size={20} />
            </div>
            <p className="text-xs font-bold text-slate-100">Licitaciones CompraNet</p>
            <p className="text-[11px] text-slate-400 leading-4">
              Contrataciones públicas abiertas, plazos y presupuestos
            </p>
          </div>

          {/* Card 3: Privacidad */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-400 mx-auto">
              <ShieldCheck size={20} />
            </div>
            <p className="text-xs font-bold text-slate-100">Privacidad y Motor Local</p>
            <p className="text-[11px] text-slate-400 leading-4">
              SQLite WASM en tu dispositivo sin historial ni rastreo
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="w-full pt-4 space-y-3">
          <button
            type="button"
            onClick={() => handleStart()}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 rounded-2xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 px-8 py-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(197,160,89,0.35)] hover:scale-[1.02] cursor-pointer"
          >
            <span>INGRESAR A LA PLATAFORMA</span>
            <ArrowRight size={18} />
          </button>

          <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] font-semibold text-slate-400 pt-1">
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
        </div>
      </main>
    </div>
  );
}
