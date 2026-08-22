import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface UiState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  isOnline: boolean;
  notifications: AppNotification[];
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setIsOnline: (online: boolean) => void;
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error', title?: string) => void;
  dismissNotification: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  isOnline: navigator.onLine,
  notifications: [],

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setIsOnline: (isOnline) => set({ isOnline }),

  notify: (message, type = 'info', title) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type, title, timestamp: Date.now() }],
    }));

    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4500);
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
