import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { testGoogleApiKey } from '../services/ai';

export const AiStudioTutorialModal: React.FC = () => {
  const { showTutorialModal, setShowTutorialModal, saveGoogleKey, apiKey: currentKey, model } = useAuthStore();
  const { notify } = useUiStore();

  const [inputKey, setInputKey] = useState(currentKey || '');
  const [selectedModel, setSelectedModel] = useState(model || 'gemini-2.5-flash');
  const [isValidating, setIsValidating] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!showTutorialModal) return null;

  const handleTestAndSave = async () => {
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      setTestResult({ ok: false, message: 'Por favor, ingresa una clave de API válida.' });
      return;
    }

    setIsValidating(true);
    setTestResult(null);

    const res = await testGoogleApiKey(cleanKey, selectedModel);
    setIsValidating(false);
    setTestResult(res);

    if (res.ok) {
      saveGoogleKey(cleanKey, selectedModel);
      notify('Clave de Google AI Studio guardada y validada correctamente.', 'success', 'Conexión Exitosa');
      setTimeout(() => {
        setShowTutorialModal(false);
      }, 1200);
    }
  };

  const steps = [
    {
      step: 1,
      title: 'Accede a Google AI Studio',
      description: 'Ingresa a la consola oficial de Google AI Studio con tu cuenta de Google (gratuito).',
      action: (
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          <span>Abrir Google AI Studio</span>
          <ExternalLink size={14} className="text-legal-gold" />
        </a>
      ),
    },
    {
      step: 2,
      title: 'Crea tu clave de API',
      description: 'Haz clic en el botón azul "Create API key" o "Crear clave de API". Puedes elegir un proyecto nuevo o existente.',
    },
    {
      step: 3,
      title: 'Copia tu clave (AIzaSy...)',
      description: 'Copia la clave generada y pégala en el campo inferior para comenzar a usar la Estación Jurídica.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
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
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Asistente Google AI Studio</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Obtén tu clave de API gratuita en 3 pasos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTutorialModal(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Banner de beneficios */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-blue-200">100% Gratuito y Privado</p>
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                Google ofrece una generosa cuota sin costo para Gemini. Tu clave permanece en la memoria local de tu dispositivo y nunca viaja a servidores externos.
              </p>
            </div>
          </div>

          {/* Pasos */}
          <div className="space-y-2.5">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-legal-gold text-[10px] font-extrabold text-slate-950">
                    {s.step}
                  </span>
                  <span className="font-bold text-slate-200">{s.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-7">{s.description}</p>
                {s.action && <div className="pl-7 pt-1">{s.action}</div>}
              </div>
            ))}
          </div>

          {/* Formulario de Clave */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-legal-gold">
              Pega tu clave de API de Google aquí:
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:border-legal-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Modelo predeterminado:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:border-legal-gold focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Ultrarrápido)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Complejo)</option>
              </select>
            </div>

            {testResult && (
              <div
                className={`rounded-xl border p-2.5 flex items-start gap-2 text-[11px] ${
                  testResult.ok
                    ? 'border-green-500/30 bg-green-500/10 text-green-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-green-400" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-legal-shell p-4 flex gap-3">
          <button
            type="button"
            onClick={() => setShowTutorialModal(false)}
            className="flex-1 rounded-xl border border-slate-700 bg-transparent py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={isValidating || !inputKey.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-legal-gold py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-legal-goldhover transition disabled:opacity-50 cursor-pointer"
          >
            {isValidating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Validar y Activar</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
