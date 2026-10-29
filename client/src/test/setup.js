import '@testing-library/jest-dom/vitest';

// jsdom no implementa ResizeObserver (lo usa ResponsiveContainer de Recharts).
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
