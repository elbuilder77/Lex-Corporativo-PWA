import type { SavedDraft } from '../types';

const STORAGE_KEY = 'lex_saved_drafts_vault';

export function getAllDrafts(): SavedDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const drafts: SavedDraft[] = JSON.parse(raw);
    return Array.isArray(drafts)
      ? drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      : [];
  } catch (err) {
    console.error('Error al leer borradores de almacenamiento local:', err);
    return [];
  }
}

export function getDraftById(id: string): SavedDraft | undefined {
  const drafts = getAllDrafts();
  return drafts.find((d) => d.id === id);
}

export function saveDraft(draft: SavedDraft): void {
  if (typeof window === 'undefined') return;
  try {
    const drafts = getAllDrafts();
    const index = drafts.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      drafts[index] = draft;
    } else {
      drafts.unshift(draft);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error('Error al guardar borrador:', err);
  }
}

export function deleteDraft(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const drafts = getAllDrafts();
    const updated = drafts.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error al eliminar borrador:', err);
  }
}

export function exportVaultBackup(): string {
  const allDrafts = getAllDrafts();
  const backup = {
    app: 'Lex Corporativo PWA',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    drafts: allDrafts,
  };
  return JSON.stringify(backup, null, 2);
}

export function importVaultBackup(jsonString: string): number {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data.drafts)) {
      throw new Error('Formato de respaldo no válido.');
    }
    const current = getAllDrafts();
    let count = 0;
    for (const draft of data.drafts) {
      if (draft.id && draft.templateId) {
        const idx = current.findIndex((d) => d.id === draft.id);
        if (idx >= 0) {
          current[idx] = draft;
        } else {
          current.push(draft);
        }
        count++;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return count;
  } catch (err: any) {
    throw new Error(`Error al importar respaldo: ${err.message}`);
  }
}
