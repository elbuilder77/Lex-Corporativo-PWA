import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Scale, BookOpenCheck, ShieldCheck } from 'lucide-react';
import logoUrl from '../assets/logo-lockup-transparent.png';

interface IntroductionProps {
  onOpenStation: () => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ onOpenStation }) => {
  const handleStart = () => {
    setTimeout(() => {
      onOpenStation();
    }, 300);
  };

  return (
    <div className="relative flex min-h-screen w-screen select-none items-center justify-center overflow-x-hidden bg-legal-shell font-sans text-white p-4">
      {/* Glows ambientales */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.08)_0%,transparent_70%)] filter blur-3xl" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.2)_0%,transparent_75%)] filter blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-legal-gold/30 to-transparent" />
      </div>

      {/* Contenedor Principal */}
      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 text-center py-8">
        {/* Logo de Marca */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[320px] sm:max-w-[420px] flex justify-center"
        >
          <img
            src={logoUrl}
            alt="Lex Corporativo"
            className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(197,160,89,0.2)]"
          />
        </motion.div>

        {/* Título y Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2"
        >
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.35em] text-legal-gold">
            Estación Jurídica PWA
          </span>
          <h1 className="text-base sm:text-lg font-bold text-slate-200">
            Inteligencia Normativa, Redacción y Auditoría Legal
          </h1>
        </motion.div>

        {/* Features destacadas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 w-full pt-2"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 text-center space-y-1">
            <BookOpenCheck size={18} className="text-blue-400 mx-auto" />
            <p className="text-[11px] font-bold text-slate-200">RAG Normativo</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">11 Leyes Federales</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 text-center space-y-1">
            <Scale size={18} className="text-legal-gold mx-auto" />
            <p className="text-[11px] font-bold text-slate-200">Redactor Rápido</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Plantillas Fundamentadas</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:p-4 text-center space-y-1">
            <ShieldCheck size={18} className="text-emerald-400 mx-auto" />
            <p className="text-[11px] font-bold text-slate-200">Auditoría</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Detección de Riesgos</p>
          </div>
        </motion.div>

        {/* Botón de Entrada */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full pt-4"
        >
          <button
            type="button"
            onClick={handleStart}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 rounded-2xl bg-legal-gold hover:bg-white text-slate-950 px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_10px_25px_rgba(197,160,89,0.3)] hover:scale-105 cursor-pointer"
          >
            <span>ABRIR ESTACIÓN</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </main>
    </div>
  );
};
