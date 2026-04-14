import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom'; // augments vitest's Assertion<T> with jest-dom matchers
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Polyfill crypto.randomUUID for JSDOM
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
    },
    writable: true,
    configurable: true,
  });
}
