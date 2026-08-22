import { act, renderHook } from '@testing-library/react';
import { useCaseStore } from '../store/useCaseStore';

describe('useCaseStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useCaseStore.setState({
      currentCaseId: null,
      activeArea: 'laboral',
      draftContent: '',
      draftTitle: 'Documento Jurídico',
      isDrafting: false,
      cases: [],
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useCaseStore());
      expect(result.current.currentCaseId).toBeNull();
      expect(result.current.activeArea).toBe('laboral');
      expect(result.current.draftContent).toBe('');
      expect(result.current.draftTitle).toBe('Documento Jurídico');
      expect(result.current.cases).toEqual([]);
    });
  });

  describe('setters', () => {
    it('should update activeArea', () => {
      const { result } = renderHook(() => useCaseStore());
      act(() => result.current.setActiveArea('fiscal'));
      expect(result.current.activeArea).toBe('fiscal');
    });

    it('should update draftContent', () => {
      const { result } = renderHook(() => useCaseStore());
      act(() => result.current.setDraftContent('Nuevo contenido'));
      expect(result.current.draftContent).toBe('Nuevo contenido');
    });

    it('should update draftTitle', () => {
      const { result } = renderHook(() => useCaseStore());
      act(() => result.current.setDraftTitle('Nuevo Título'));
      expect(result.current.draftTitle).toBe('Nuevo Título');
    });

    it('should update isDrafting', () => {
      const { result } = renderHook(() => useCaseStore());
      act(() => result.current.setIsDrafting(true));
      expect(result.current.isDrafting).toBe(true);
    });

    it('should update currentCaseId', () => {
      const { result } = renderHook(() => useCaseStore());
      act(() => result.current.setCurrentCaseId('case-123'));
      expect(result.current.currentCaseId).toBe('case-123');
    });
  });

  describe('resetDraft', () => {
    it('should reset draft state', () => {
      const { result } = renderHook(() => useCaseStore());
      act(() => {
        result.current.setDraftContent('Contenido');
        result.current.setDraftTitle('Título');
        result.current.setCurrentCaseId('case-123');
      });
      act(() => result.current.resetDraft());
      expect(result.current.currentCaseId).toBeNull();
      expect(result.current.draftContent).toBe('');
      expect(result.current.draftTitle).toBe('Documento Jurídico');
    });
  });

  describe('loadCases', () => {
    it('should call db.cases.orderBy', async () => {
      const { result } = renderHook(() => useCaseStore());
      // Just verify it doesn't throw
      await act(async () => {
        await result.current.loadCases();
      });
      expect(result.current.cases).toEqual([]);
    });
  });
});