import { create } from 'zustand';
import type { LegalEngineeringArea, SavedCase } from '../types';
import { db } from '../db';

interface CaseState {
  currentCaseId: string | null;
  activeArea: LegalEngineeringArea;
  draftContent: string;
  draftTitle: string;
  isDrafting: boolean;
  cases: SavedCase[];

  // Actions
  setActiveArea: (area: LegalEngineeringArea) => void;
  setDraftContent: (content: string) => void;
  setDraftTitle: (title: string) => void;
  setIsDrafting: (isDrafting: boolean) => void;
  setCurrentCaseId: (id: string | null) => void;
  loadCases: () => Promise<void>;
  saveCurrentCase: () => Promise<string>;
  loadCaseById: (id: string) => Promise<void>;
  deleteCaseById: (id: string) => Promise<void>;
  resetDraft: () => void;
}

export const useCaseStore = create<CaseState>((set, get) => ({
  currentCaseId: null,
  activeArea: 'laboral',
  draftContent: '',
  draftTitle: 'Documento Jurídico',
  isDrafting: false,
  cases: [],

  setActiveArea: (activeArea) => set({ activeArea }),
  setDraftContent: (draftContent) => set({ draftContent }),
  setDraftTitle: (draftTitle) => set({ draftTitle }),
  setIsDrafting: (isDrafting) => set({ isDrafting }),
  setCurrentCaseId: (currentCaseId) => set({ currentCaseId }),

  loadCases: async () => {
    try {
      const allCases = await db.cases.orderBy('updatedAt').reverse().toArray();
      set({ cases: allCases });
    } catch {
      // fallback
    }
  },

  saveCurrentCase: async () => {
    const { currentCaseId, activeArea, draftContent, draftTitle } = get();
    const caseId = currentCaseId || `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const saved: SavedCase = {
      id: caseId,
      title: draftTitle || 'Documento sin título',
      area: activeArea,
      createdAt: now,
      updatedAt: now,
      draftContent,
    };

    await db.cases.put(saved);
    set({ currentCaseId: caseId });
    await get().loadCases();
    return caseId;
  },

  loadCaseById: async (id: string) => {
    try {
      const found = await db.cases.get(id);
      if (found) {
        set({
          currentCaseId: found.id,
          activeArea: found.area,
          draftContent: found.draftContent || '',
          draftTitle: found.title,
        });
      }
    } catch {
      // ignore
    }
  },

  deleteCaseById: async (id: string) => {
    try {
      await db.cases.delete(id);
      if (get().currentCaseId === id) {
        set({ currentCaseId: null, draftContent: '' });
      }
      await get().loadCases();
    } catch {
      // ignore
    }
  },

  resetDraft: () => {
    set({
      currentCaseId: null,
      draftContent: '',
      draftTitle: 'Documento Jurídico',
    });
  },
}));
