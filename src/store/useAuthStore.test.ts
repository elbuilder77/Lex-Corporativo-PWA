import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Reset store to initial state
    useAuthStore.setState({
      mode: 'trial',
      licenseKey: '',
      apiKey: '',
      model: 'gemini-2.5-flash',
      strictPrivacy: true,
      isConfigured: false,
      tutorialCompleted: false,
      showTutorialModal: false,
      showUnlockModal: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.mode).toBe('trial');
      expect(result.current.licenseKey).toBe('');
      expect(result.current.apiKey).toBe('');
      expect(result.current.model).toBe('gemini-2.5-flash');
      expect(result.current.strictPrivacy).toBe(true);
      expect(result.current.isConfigured).toBe(false);
      expect(result.current.tutorialCompleted).toBe(false);
    });
  });

  describe('setMode', () => {
    it('should update mode and persist to localStorage', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => result.current.setMode('unlocked'));
      expect(result.current.mode).toBe('unlocked');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'lex_corp_pwa_auth_v1',
        expect.stringContaining('"mode":"unlocked"')
      );
    });
  });

  describe('unlockWithLicense', () => {
    it('should unlock with valid license key (>= 8 chars)', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        const success = result.current.unlockWithLicense('LEX-PRO-2026');
        expect(success).toBe(true);
      });
      expect(result.current.mode).toBe('unlocked');
      expect(result.current.licenseKey).toBe('LEX-PRO-2026');
      expect(result.current.isConfigured).toBe(true);
    });

    it('should reject short license key', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        const success = result.current.unlockWithLicense('SHORT');
        expect(success).toBe(false);
      });
      expect(result.current.mode).toBe('trial');
    });
  });

  describe('saveGoogleKey', () => {
    it('should save API key and switch to BYOK mode', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => result.current.saveGoogleKey('AIzaSyTestKey123', 'gemini-2.0-flash'));
      expect(result.current.mode).toBe('byok');
      expect(result.current.apiKey).toBe('AIzaSyTestKey123');
      expect(result.current.model).toBe('gemini-2.0-flash');
      expect(result.current.isConfigured).toBe(true);
      expect(result.current.tutorialCompleted).toBe(true);
    });
  });

  describe('resetCredentials', () => {
    it('should reset to trial mode and clear credentials', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => result.current.saveGoogleKey('AIzaSyTestKey123'));
      act(() => result.current.resetCredentials());
      expect(result.current.mode).toBe('trial');
      expect(result.current.licenseKey).toBe('');
      expect(result.current.apiKey).toBe('');
      expect(result.current.isConfigured).toBe(false);
    });
  });
});