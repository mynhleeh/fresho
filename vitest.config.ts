import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globalSetup: ['./vitest.global-setup.ts'],
    setupFiles: ['./vitest.setup.ts'],
    // All test files share one SQLite test.db; run them sequentially so
    // one file's cleanup/seed doesn't race another file's in-flight writes.
    fileParallelism: false,
  },
});
