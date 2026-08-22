import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUiStore } from '../store/useUiStore';
import { testGoogleApiKey } from '../services/ai';
import { db } from '../db';

export const Settings: React.FC = () => {
  const { notify } = useUiStore();
  const {
    mode,
    licenseKey,
    apiKey,
    model,
    saveGoogleKey,
    setModel,
    setShowTutorialModal,
    setShowUnlockModal,
    resetCredentials,
  } = useAuthStore();

  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedModel, setSelectedModel] = useState(model);
  const [isValidating, setIsValidating] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTestAndSave = async () => {
    if (!inputKey.trim()) {
      notify('Ingresa una clave de API.', 'warning');
      return;
    }

    setIsValidating(true);
    setTestResult(null);

    const res = await testGoogleApiKey(inputKey, selectedModel);
    setIsValidating(false);
    setTestResult(res);

    if (res.ok) {
      saveGoogleKey(inputKey, selectedModel);
      notify('Configuración de Google AI Studio guardada.', 'success');
    }
  };

  const handleClearAllData = async () => {
    if (confirm('¿Estás seguro de eliminar TODOS los casos y configuraciones locales? Esta acción es irreversible.')) {
      await db.cases.clear();
      resetCredentials();
      notify('Todos los datos locales han sido eliminados.', 'info');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 pb-20">
      <div className="mx-auto w-full max-w-4xl px-3 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-slate-700">
              <SettingsIcon size={22} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-950">Ajustes & Configuración</h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Licencias, conexión con Google AI Studio y privacidad
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Licencia */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-legal-gold/10 text-legal-gold">
                <Lock size={16} />
              </span>
              <div>
                <h2 className="font-bold text-xs sm:text-sm text-slate-900">Estado de Acceso</h2>
                <p className="text-[11px] text-slate-500">
                  {mode === 'unlocked'
                    ? `Licencia Completa Activa (${licenseKey || 'PRO'})`
                    : apiKey
                    ? 'Modo BYOK Activo (Google AI Studio)'
                    : 'Modo Prueba / Requiere Activación'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              Cambiar Modo
            </button>
          </div>
        </div>

        {/* Configuración Google AI Studio */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <Sparkles size={16} />
              </span>
              <div>
                <h2 className="font-bold text-xs sm:text-sm text-slate-900">Google AI Studio (Gemini)</h2>
                <p className="text-[11px] text-slate-500">Configura o actualiza tu clave de API personal</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTutorialModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>Ver Asistente</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Clave de API de Google:</label>
              <div className="relative">
                <Key size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-legal-gold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block font-bold text-slate-700">Modelo de Gemini:</label>
                <p className="text-[11px] text-slate-400">Selecciona la versión del motor de lenguaje</p>
              </div>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setModel(e.target.value);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-legal-gold focus:outline-none"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Óptimo y Rápido)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Baja latencia)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Razonamiento profundo)</option>
              </select>
            </div>

            {testResult && (
              <div
                className={`rounded-xl border p-3 flex items-start gap-2 text-xs ${
                  testResult.ok
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 size={16} className="shrink-0 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleTestAndSave}
                disabled={isValidating || !inputKey.trim()}
                className="flex items-center gap-2 rounded-xl bg-legal-gold hover:bg-legal-goldhover text-slate-950 px-4 py-2 font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isValidating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                <span>Probar y Guardar Clave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacidad y Reseteo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-slate-900">Privacidad y Almacenamiento Local</h2>
              <p className="text-[11px] text-slate-500">Tus datos nunca se transfieren a servidores no autorizados</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Borrar datos locales</p>
              <p className="text-[11px] text-slate-400">Elimina el historial de casos y las credenciales guardadas</p>
            </div>
            <button
              type="button"
              onClick={handleClearAllData}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Limpiar Todo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
