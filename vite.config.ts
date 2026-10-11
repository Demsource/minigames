import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/minigames/',
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        // Test suites themselves, not application code
        'src/**/*.{test,spec}.ts',
        // Ambient type declarations; erased at compile time, no runtime code
        'src/**/*.d.ts',
        // Static Firebase credentials passed to SDK initializers; no branching or app logic
        'src/config/firebase.ts',
        // Empty placeholder modules (`export {};` only); no code to cover yet
        'src/app/index.ts',
        'src/state/store.ts',
        'src/services/storage.ts',
        'src/features/slider/slider.ts',
      ],
    },
  },
});
