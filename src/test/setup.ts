import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
});

// Mock navigator.wakeLock
Object.defineProperty(navigator, 'wakeLock', {
  value: {
    request: vi.fn().mockResolvedValue({ released: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  },
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

// Mock fetch
global.fetch = vi.fn();

// Mock IndexedDB/Dexie
vi.mock('dexie', () => {
  const mockTable = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    orderBy: () => ({
      reverse: () => ({
        toArray: vi.fn().mockResolvedValue([]),
      }),
    }),
    where: () => ({
      equals: () => ({
        first: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  };
  return {
    default: class MockDexie {
      cases = mockTable;
      constructor() { }
      version() { return this; }
      stores() { return this; }
      open() { return Promise.resolve(); }
    },
  };
});

// Mock sql.js
vi.mock('sql.js', () => ({
  default: vi.fn().mockResolvedValue({
    Database: class MockDatabase {
      run() { }
      prepare() { return { bind: vi.fn(), step: vi.fn().mockReturnValue(false), free: vi.fn(), getAsObject: vi.fn() }; }
      create_function() { }
      close() { }
      export() { return new Uint8Array(); }
    },
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/buscador' }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Navigate: () => null,
  Routes: ({ children }: any) => React.createElement(React.Fragment, null, children),
  Route: () => null,
}));

// Suppress console.error in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) return;
    originalError.call(console, ...args);
  };
});
afterAll(() => {
  console.error = originalError;
});