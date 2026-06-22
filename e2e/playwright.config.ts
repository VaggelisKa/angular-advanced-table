import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.e2e\.ts$/,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4201',
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    viewport: { width: 1600, height: 900 },
  },
  webServer: {
    command: 'pnpm exec nx run showcase:serve-e2e --port 4201',
    url: 'http://localhost:4201',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
