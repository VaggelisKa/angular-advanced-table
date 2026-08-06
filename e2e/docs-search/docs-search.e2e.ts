import { expect, test } from '@playwright/test';

import { waitForHydration } from '../support/hydration';

test.describe('FEATURE: Docs search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/quick-start');
    await waitForHydration(page);
  });

  test.describe('GIVEN: the showcase shell is loaded on a docs page', () => {
    test.describe('WHEN: searching with the keyboard shortcut end to end', () => {
      test('THEN: it opens, filters, and navigates to a section anchor', async ({ page }) => {
        const dialog = page.getByTestId('docs-search-dialog');
        const input = page.getByTestId('docs-search-input');
        const options = page.getByTestId('docs-search-option');

        await test.step('THEN: it opens the dialog via the shortcut with the input focused', async () => {
          await page.keyboard.press('ControlOrMeta+KeyK');
          await expect(dialog).toBeVisible();
          await expect(input).toBeFocused();
        });

        await test.step('THEN: it lists highlighted results for "pinning"', async () => {
          await input.fill('pinning');
          await expect(options.first()).toBeVisible();
          await expect(dialog.locator('mark').first()).toContainText(/pinning/iu);
        });

        await test.step('THEN: it navigates to the chosen section and closes the dialog', async () => {
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
          await expect(dialog).toBeHidden();
          await expect(page).toHaveURL(/\/docs\/[a-z-]+#[a-z-]+/u);
        });

        await test.step('THEN: it scrolls the target heading into view', async () => {
          const fragment = new URL(page.url()).hash.slice(1);

          expect(fragment.length).toBeGreaterThan(0);
          await expect(page.locator(`[id="${fragment}"]`)).toBeInViewport();
        });
      });
    });

    test.describe('WHEN: searching with the pointer', () => {
      test('THEN: it opens from the sidebar trigger and navigates on option click', async ({ page }) => {
        const dialog = page.getByTestId('docs-search-dialog');

        await page.getByTestId('docs-search-trigger').click();
        await expect(dialog).toBeVisible();

        await page.getByTestId('docs-search-input').fill('sorting');
        await page.getByTestId('docs-search-option').first().click();

        await expect(dialog).toBeHidden();
        await expect(page).toHaveURL(/\/docs\//u);
      });
    });

    test.describe('WHEN: the query matches nothing', () => {
      test('THEN: it shows the no-results state and stays open', async ({ page }) => {
        await page.getByTestId('docs-search-trigger').click();
        await page.getByTestId('docs-search-input').fill('zzzznotarealword');

        await expect(page.getByTestId('docs-search-no-results')).toContainText('No results for "zzzznotarealword"');
        await expect(page.getByTestId('docs-search-dialog')).toBeVisible();
      });
    });
  });
});
