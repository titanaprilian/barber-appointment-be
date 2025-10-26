import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@app': '/src/app',
      '@plugins': '/src/plugins',
      '@database': '/src/database',
      '@config': '/src/config',
      '@queue': '/src/queue',
      '@utils': '/src/utils',
      '@tests': '/src/tests',
    },
  },
});
