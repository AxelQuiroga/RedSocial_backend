import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 30000,
    testTimeout: 30000,
    globalSetup: ['./tests/global-setup.ts'],
    fileParallelism: false,
    sequence: {
      concurrent: false,
      hooks: 'stack',
    },
    env: {
      JWT_SECRET: 'test-secret-key-for-unit-tests',
      BCRYPT_SALT_ROUNDS: '4',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '^(\\.\\./.*)\\.js$': '$1',
    },
  },
});
