import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // See tests/stubs/server-only.ts for why.
      'server-only': new URL('./tests/stubs/server-only.ts', import.meta.url).pathname,
      '@': import.meta.dirname,
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The DB integration test talks to a real Neon database; keep it serial and give it
    // room, since it deliberately exercises lock contention.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
