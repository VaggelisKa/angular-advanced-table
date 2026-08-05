import type { Page } from '@playwright/test';

/**
 * Prerendered showcase pages hydrate in place: component-generated DOM ids
 * (e.g. `nat-table-<n>-summary`) regenerate with the client's instance counter
 * and SSR event bindings replay late. Reading a generated id or driving the
 * keyboard before Angular claims the DOM races against that swap. Angular
 * strips its `ngh`/`jsaction` hydration markers once claiming and event replay
 * are done, so their absence is the stable-DOM signal.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => !document.querySelector('[ngh], [jsaction]'));
}
