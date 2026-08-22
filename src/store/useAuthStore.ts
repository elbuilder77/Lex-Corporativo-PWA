import { create } from 'zustand';
import type { AccessMode, GoogleAiSettings } from '../types';

interface AuthState {
  mode: AccessMode;
  licenseKey: string;
  apiKey: string;
  model: string;
  strictPrivacy: boolean;
  isConfigured: boolean;
  tutorialCompleted: boolean;
  showTutorialModal: boolean;
  showUnlockModal: boolean;
  
  // Actions
  setMode: (mode: AccessMode) => void;
  setLicenseKey: (key: string) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setStrictPrivacy: (enabled: boolean) => void;
  setTutorialCompleted: (completed: boolean) => void;
  setShowTutorialModal: (show: boolean) => void;
  setShowUnlockModal: (show: boolean) => void;
  unlockWithLicense: (licenseKey: string) => boolean;
  saveGoogleKey: (apiKey: string, model?: string) => void;
  resetCredentials: () => void;
}

const STORAGE_KEY = 'lex_corp_pwa_auth_v1';

const getInitialSettings = (): GoogleAiSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return {
    mode: 'trial',
    licenseKey: '',
    apiKey: '',
    model: 'gemini-2.5-flash',
    strictPrivacy: true,
    isConfigured: false,
    tutorialCompleted: false,
  };
};

export const useAuthStore = create<AuthState>((set, get) => {
  const initial = getInitialSettings();

  const persist = (updated: Partial<GoogleAiSettings>) => {
    const current = get();
    const payload: GoogleAiSettings = {
      mode: updated.mode ?? current.mode,
      licenseKey: updated.licenseKey ?? current.licenseKey,
      apiKey: updated.apiKey ?? current.apiKey,
      model: updated.model ?? current.model,
      strictPrivacy: updated.strictPrivacy ?? current.strictPrivacy,
      isConfigured: updated.isConfigured ?? current.isConfigured,
      tutorialCompleted: updated.tutorialCompleted ?? current.tutorialCompleted,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  return {
    mode: initial.mode,
    licenseKey: initial.licenseKey || '',
    apiKey: initial.apiKey || '',
    model: initial.model || 'gemini-2.5-flash',
    strictPrivacy: initial.strictPrivacy ?? true,
    isConfigured: initial.isConfigured || Boolean(initial.apiKey) || initial.mode === 'unlocked',
    tutorialCompleted: initial.tutorialCompleted ?? false,
    showTutorialModal: false,
    showUnlockModal: false,

    setMode: (mode) => {
      set({ mode });
      persist({ mode });
    },

    setLicenseKey: (licenseKey) => {
      set({ licenseKey });
      persist({ licenseKey });
    },

    setApiKey: (apiKey) => {
      const isConfigured = Boolean(apiKey.trim());
      set({ apiKey, isConfigured });
      persist({ apiKey, isConfigured });
    },

    setModel: (model) => {
      set({ model });
      persist({ model });
    },

    setStrictPrivacy: (strictPrivacy) => {
      set({ strictPrivacy });
      persist({ strictPrivacy });
    },

    setTutorialCompleted: (tutorialCompleted) => {
      set({ tutorialCompleted });
      persist({ tutorialCompleted });
    },

    setShowTutorialModal: (showTutorialModal) => set({ showTutorialModal }),
    setShowUnlockModal: (showUnlockModal) => set({ showUnlockModal }),

    unlockWithLicense: (key: string) => {
      const cleanKey = key.trim().toUpperCase();
      // Validar formato de licencia (ej: LEX-CORP-XXXX o clave institucional)
      if (cleanKey.length >= 8) {
        set({
          mode: 'unlocked',
          licenseKey: cleanKey,
          isConfigured: true,
          showUnlockModal: false,
        });
        persist({
          mode: 'unlocked',
          licenseKey: cleanKey,
          isConfigured: true,
        });
        return true;
      }
      return false;
    },

    saveGoogleKey: (apiKey: string, model?: string) => {
      const selectedModel = model || get().model || 'gemini-2.5-flash';
      set({
        mode: 'byok',
        apiKey: apiKey.trim(),
        model: selectedModel,
        isConfigured: true,
        tutorialCompleted: true,
        showTutorialModal: false,
        showUnlockModal: false,
      });
      persist({
        mode: 'byok',
        apiKey: apiKey.trim(),
        model: selectedModel,
        isConfigured: true,
        tutorialCompleted: true,
      });
    },

    resetCredentials: () => {
      set({
        mode: 'trial',
        licenseKey: '',
        apiKey: '',
        isConfigured: false,
      });
      persist({
        mode: 'trial',
        licenseKey: '',
        apiKey: '',
        isConfigured: false,
      });
    },
  };
});
