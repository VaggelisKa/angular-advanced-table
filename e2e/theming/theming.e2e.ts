import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Theming inheritance', () => {
  const wrapper = (page: Page): Locator => page.locator('section.theming-playground');
  const table = (page: Page): Locator => page.getByRole('grid', { name: 'Themed orders table' });
  const headerCell = (page: Page): Locator => table(page).getByTestId('nat-table-header-id');
  const dataCell = (page: Page): Locator => table(page).getByRole('rowheader', { name: 'ORD-10000' });

  const setWrapperTokens = async (page: Page, tokens: Record<string, string>): Promise<void> =>
    wrapper(page).evaluate((element, entries) => {
      for (const [token, value] of entries) {
        element.style.setProperty(token, value);
      }
    }, Object.entries(tokens));

  const computedStyle = async (locator: Locator, property: string): Promise<string> =>
    locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

  test.describe('GIVEN: the theming example is loaded with host-level theming neutralized', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/theming');
      await loadDocsExamplePreview(page, 'theme-example', 'Theme example');

      // The demo themes the surface HOST (`.ledger-surface`) and gallery pages
      // theme it via `.showcase-page nat-table-surface`. Tokens declared on or
      // above the host at elevated specificity legitimately win — but the
      // contract under test (#243) is the documented ancestor-WRAPPER
      // inheritance path, so strip both and assert against the stock theme.
      await page.locator('nat-table-surface.ledger-surface').evaluate((element) => {
        element.classList.remove('ledger-surface');
        element.closest('.showcase-page')?.classList.remove('showcase-page');
      });
    });

    test.describe('WHEN: consumer tokens are set on a wrapper ancestor', () => {
      test('THEN: it applies the inherited tokens through the surface to table cells', async ({ page }) => {
        await setWrapperTokens(page, {
          '--nat-table-color-text': 'rgb(1, 2, 3)',
          '--nat-table-header-background': 'rgb(4, 5, 6)',
          '--nat-table-space-cell-y': '17px'
        });

        await expect.poll(async () => computedStyle(dataCell(page), 'color')).toBe('rgb(1, 2, 3)');
        expect(await computedStyle(headerCell(page), 'background-color')).toBe('rgb(4, 5, 6)');
        expect(await computedStyle(dataCell(page), 'padding-top')).toBe('17px');
      });
    });

    test.describe('WHEN: no consumer tokens are set', () => {
      test('THEN: it renders the stock surface theme', async ({ page }) => {
        // stock --nat-table-color-text default: #ecf5fb
        await expect.poll(async () => computedStyle(dataCell(page), 'color')).toBe('rgb(236, 245, 251)');
      });
    });

    test.describe('WHEN: only a palette token is overridden on the wrapper', () => {
      test('THEN: it recomputes derived stock defaults from the overridden palette', async ({ page }) => {
        // cell borders derive from a color-mix over the text color; overriding
        // only the palette token must flow into the derived default
        const stockBorderColor = await computedStyle(dataCell(page), 'border-bottom-color');

        await setWrapperTokens(page, { '--nat-table-color-text': 'rgb(200, 10, 10)' });

        await expect.poll(async () => computedStyle(dataCell(page), 'border-bottom-color')).not.toBe(stockBorderColor);
      });
    });
  });
});
