import { act, renderHook } from '@testing-library/react';
import { useUiStore } from '../store/useUiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUiStore.setState({
      sidebarCollapsed: false,
      sidebarOpen: false,
      isOnline: true,
      notifications: [],
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useUiStore());
      expect(result.current.sidebarCollapsed).toBe(false);
      expect(result.current.sidebarOpen).toBe(false);
      expect(result.current.isOnline).toBe(true);
      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('setters', () => {
    it('should update sidebarCollapsed', () => {
      const { result } = renderHook(() => useUiStore());
      act(() => result.current.setSidebarCollapsed(true));
      expect(result.current.sidebarCollapsed).toBe(true);
    });

    it('should update sidebarOpen', () => {
      const { result } = renderHook(() => useUiStore());
      act(() => result.current.setSidebarOpen(true));
      expect(result.current.sidebarOpen).toBe(true);
    });

    it('should update isOnline', () => {
      const { result } = renderHook(() => useUiStore());
      act(() => result.current.setIsOnline(false));
      expect(result.current.isOnline).toBe(false);
    });
  });

  describe('notify', () => {
    it('should add notification with auto-dismiss timer', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useUiStore());
      act(() => result.current.notify('Test message', 'success', 'Test Title'));
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        message: 'Test message',
        type: 'success',
        title: 'Test Title',
      });
      expect(result.current.notifications[0].id).toBeDefined();
      expect(result.current.notifications[0].timestamp).toBeDefined();

      // Fast-forward timer
      act(() => vi.advanceTimersByTime(5000));
      expect(result.current.notifications).toHaveLength(0);
      vi.useRealTimers();
    });

    it('should default to info type when not specified', () => {
      const { result } = renderHook(() => useUiStore());
      act(() => result.current.notify('Info message'));
      expect(result.current.notifications[0].type).toBe('info');
    });
  });

  describe('dismissNotification', () => {
    it('should remove notification by id', () => {
      const { result } = renderHook(() => useUiStore());
      act(() => result.current.notify('Test message'));
      const id = result.current.notifications[0].id;
      act(() => result.current.dismissNotification(id));
      expect(result.current.notifications).toHaveLength(0);
    });
  });
});