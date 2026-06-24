import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] ?? 'http://localhost:4201';

// nxE2EPreset supplies the Nx-recommended base: fullyParallel, CI retries,
// blob reports (for atomized report merging) and an Nx-cached outputDir.
// On CI it sets workers=1 per task on purpose — the Atomizer splits each spec
// into its own task and Nx runs those in parallel, so within-task parallelism
// is redundant. Local runs (`nx e2e`) stay fully parallel.
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './', openHtmlReport: 'never' }),
  // The preset doesn't set testMatch; without this the Atomizer and the runner
  // fall back to Playwright's *.spec.ts default and find no specs.
  testMatch: /.*\.e2e\.ts$/,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    viewport: { width: 1600, height: 900 },
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm exec nx run showcase:serve-e2e --port 4201',
    url: baseURL,
    // Reuse a server CI pre-starts (and any local dev server) so atomized tasks
    // share one instance instead of each binding :4201.
    reuseExistingServer: true,
    timeout: 180_000
  }
});
