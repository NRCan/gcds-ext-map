import { defineConfig, expect } from '@playwright/test';
import { matchers } from '@stencil/playwright';

expect.extend(matchers);

export default defineConfig({
  testDir: './src',
  testMatch: '*.e2e.ts',
  timeout: 25000,
  use: {
    baseURL: 'http://localhost:3333/',
    // Tests fetch tiles from external hosts whose cert chains can fail
    // transient validation in some environments (corporate proxies,
    // OCSP outages). Acceptable for a test runner.
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'node test-server.js',
    port: 3333,
    timeout: 10000,
    reuseExistingServer: !process.env.CI,
  },
});
