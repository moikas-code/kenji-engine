import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock OpenTUI React hooks
vi.mock('@opentui/react', () => ({
  useRenderer: () => ({
    setBackgroundColor: vi.fn(),
    console: { toggle: vi.fn() },
    toggleDebugOverlay: vi.fn(),
    stop: vi.fn(),
  }),
  useTerminalDimensions: () => ({
    width: 80,
    height: 24,
  }),
  useKeyHandler: vi.fn(),
}));

// Mock theme colors
vi.mock('../tui/shared/colors', () => ({
  themeColors: {
    hex: {
      background: '#000000',
      muted: '#666666',
      selectedBg: '#333333',
      accentBright: '#ffffff',
    },
  },
}));