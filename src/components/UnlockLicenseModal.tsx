import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  ArrowRight,
  Zap,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';

export const UnlockLicenseModal: React.FC = () => {
  const { showUnlockModal, setShowUnlockModal, setShowTutorialModal, unlockWithLicense } = useAuthStore();
  const { notify } = useUiStore();

  const [licenseCode, setLicenseCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!showUnlockModal) return null;

  const handleApplyLicense = () => {
    if (!licenseCode.trim()) {
      setErrorMsg('Ingresa un código de licencia válido.');
      return;
    }

    const success = unlockWithLicense(licenseCode);
    if (success) {
      notify('¡Estación Jurídica Desbloqueada con Éxito!', 'success', 'Licencia Activada');
      setShowUnlockModal(false);
    } else {
      setErrorMsg('Código no reconocido. Debe contener al menos 8 caracteres (ej: LEX-PRO-2026).');
    }
  };

  const handleOpenGoogleWizard = () => {
    setShowUnlockModal(false);
    setShowTutorialModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-legal-rail text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-legal-shell">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-legal-gold/10 text-legal-gold border border-legal-gold/20">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Acceso a la Estación Jurídica</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Selecciona tu método de activación</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUnlockModal(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Opción 1: Desbloqueo Completo */}
          <div className="rounded-2xl border border-legal-gold/30 bg-gradient-to-br from-slate-900 to-slate-950 p-4 space-y-3 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-legal-gold/20 text-legal-gold font-bold">
                  <Zap size={16} />
                </span>
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">Desbloqueo Completo (Licencia)</h3>
                  <p className="text-[11px] text-slate-400">Versión llave en mano con API lista para usarse</p>
                </div>
              </div>
              <span className="rounded-full bg-legal-gold/20 border border-legal-gold/40 px-2.5 py-0.5 text-[10px] font-extrabold text-legal-gold uppercase tracking-wider">
                Full Pro
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300">
                Introduce tu código de activación o licencia:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Ej: LEX-PRO-2026"
                  value={licenseCode}
                  onChange={(e) => {
                    setLicenseCode(e.target.value);
                    setErrorMsg('');
                  }}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white uppercase placeholder-slate-600 focus:border-legal-gold focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyLicense}
                  className="rounded-xl bg-legal-gold px-4 py-2 text-xs font-bold text-slate-950 hover:bg-legal-goldhover transition cursor-pointer"
                >
                  Activar
                </button>
              </div>
              {errorMsg && <p className="text-[11px] text-red-400">{errorMsg}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">o también</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Opción 2: Google AI Studio (BYOK Gratis) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="font-bold text-white text-xs sm:text-sm">Activar con Google AI Studio (Gratis)</h3>
                <p className="text-[11px] text-slate-400">Usa tu propia clave de Gemini sin costo alguno</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Google ofrece cuota gratuita para desarrolladores y profesionales. Te guiamos paso a paso para obtener tu clave en menos de 1 minuto.
            </p>

            <button
              type="button"
              onClick={handleOpenGoogleWizard}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 text-xs transition border border-slate-700 cursor-pointer"
            >
              <span>Abrir Asistente Google AI Studio</span>
              <ArrowRight size={14} className="text-legal-gold" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-legal-shell p-4">
          <button
            type="button"
            onClick={() => setShowUnlockModal(false)}
            className="w-full rounded-xl border border-slate-800 bg-transparent py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            Continuar en modo exploratorio
          </button>
        </div>
      </motion.div>
    </div>
  );
};
