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

  test.describe('GIVEN: the showcase shell is loaded on a phone-sized touch viewport', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test.describe('WHEN: searching from the mobile header trigger', () => {
      test('THEN: it opens fullscreen, locks the page behind it, and closes from the close button', async ({ page }) => {
        const dialog = page.getByTestId('docs-search-dialog');
        const trigger = page.getByTestId('docs-search-trigger-mobile');

        await test.step('THEN: it opens fullscreen without a backdrop', async () => {
          await trigger.tap();
          await expect(dialog).toBeVisible();
          await expect(page.getByTestId('docs-search-backdrop')).toBeHidden();

          const dialogBox = await dialog.boundingBox();

          expect(dialogBox).toEqual(expect.objectContaining({ x: 0, y: 0, width: 390, height: 844 }));
        });

        await test.step('THEN: it keeps the page behind locked and the input zoom-safe', async () => {
          await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

          const inputFontSize = await page
            .getByTestId('docs-search-input')
            .evaluate((element) => window.getComputedStyle(element).fontSize);

          expect(Number.parseFloat(inputFontSize)).toBeGreaterThanOrEqual(16);
        });

        await test.step('THEN: it scrolls results inside the dialog, not the page', async () => {
          await page.getByTestId('docs-search-input').fill('table');
          await expect(page.getByTestId('docs-search-option').first()).toBeVisible();

          await page.getByTestId('docs-search-listbox').hover();
          await page.mouse.wheel(0, 400);

          const pageScroll = await page.evaluate(() => window.scrollY);

          expect(pageScroll).toBe(0);
        });

        await test.step('THEN: it closes from the visible close button and restores page scroll', async () => {
          const closeButton = page.getByTestId('docs-search-close');

          await expect(closeButton).toBeVisible();
          await closeButton.tap();
          await expect(dialog).toBeHidden();
          await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
        });
      });
    });
  });
});
