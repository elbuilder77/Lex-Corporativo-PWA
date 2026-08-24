import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage with working in-memory store
const store = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store.set(key, String(value));
  }),
  removeItem: vi.fn((key: string) => {
    store.delete(key);
  }),
  clear: vi.fn(() => {
    store.clear();
  }),
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

// Mock fetch for the local corpus files.
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue([]),
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
