import { defineConfig, expect } from '@playwright/test';
import { matchers } from '@stencil/playwright';

expect.extend(matchers);

export default defineConfig({
  testDir: './src',
  testMatch: '*.e2e.ts',
  timeout: 25000,
  use: {
    baseURL: 'http://localhost:3333/',
  },
  webServer: {
    command: 'node test-server.js',
    port: 3333,
    timeout: 10000,
    reuseExistingServer: !process.env.CI,
  },
});
