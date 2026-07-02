import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

/**
 * The row selection demo is the only showcase example wired to `(rowActivate)`
 * (added alongside this spec — see selection.ts/.html). Its selection checkbox
 * doubles as the interactive-descendant fixture for the "does not activate" case.
 */
const table = (page: Page): Locator => page.getByRole('grid', { name: 'Row selection demo table' });

/** A row located by its unique Name-column text — every demo row name is distinct. */
const rowNamed = (page: Page, name: string): Locator => table(page).locator('tbody tr', { hasText: name });

/** A non-interactive body cell of a row — safe to click/focus without hitting a control. */
const categoryCell = (page: Page, rowName: string): Locator => rowNamed(page, rowName).locator('[data-column-id="category"]');

/** The "Last activated: ..." readout added to the demo for this spec. */
const lastActivated = (page: Page): Locator => page.getByTestId('last-activated');

test.describe('FEATURE: Row activation', () => {
  test.describe('GIVEN: the row selection example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/row-selection');
      await loadDocsExamplePreview(page, 'row-selection', 'Row selection and bulk actions');
    });

    test.describe('WHEN: a non-interactive cell in a row is clicked', () => {
      test('THEN: it fires rowActivate for that row', async ({ page }) => {
        await test.step('THEN: no row has been activated yet', async () => {
          await expect(lastActivated(page)).toHaveText('Last activated: None');
        });

        await test.step('THEN: clicking the Category cell activates the row', async () => {
          await categoryCell(page, 'Gamma Processor').click();

          await expect(lastActivated(page)).toHaveText('Last activated: Gamma Processor');
        });

        await test.step('THEN: clicking a different row activates that row instead', async () => {
          await categoryCell(page, 'Delta Watcher').click();

          await expect(lastActivated(page)).toHaveText('Last activated: Delta Watcher');
        });
      });
    });

    test.describe('WHEN: a non-interactive cell is focused and Enter or Space is pressed', () => {
      test('THEN: both keys fire rowActivate for the focused row', async ({ page }) => {
        await test.step('THEN: focusing the Epsilon Shield cell and pressing Enter activates it', async () => {
          const cell = categoryCell(page, 'Epsilon Shield');

          await cell.focus();
          await expect(cell).toBeFocused();

          await page.keyboard.press('Enter');

          await expect(lastActivated(page)).toHaveText('Last activated: Epsilon Shield');
        });

        await test.step('THEN: focusing the Zeta Pipeline cell and pressing Space activates it', async () => {
          const cell = categoryCell(page, 'Zeta Pipeline');

          await cell.focus();
          await page.keyboard.press('Space');

          await expect(lastActivated(page)).toHaveText('Last activated: Zeta Pipeline');
        });
      });
    });

    test.describe('WHEN: the row selection checkbox — an interactive descendant — is clicked', () => {
      test('THEN: it selects the row but does not fire rowActivate', async ({ page }) => {
        await test.step('THEN: a prior click activation is recorded', async () => {
          await categoryCell(page, 'Alpha Searcher').click();

          await expect(lastActivated(page)).toHaveText('Last activated: Alpha Searcher');
        });

        await test.step('THEN: clicking the Beta Runner checkbox selects it without changing the activation readout', async () => {
          const checkbox = table(page).getByRole('checkbox', { name: 'Select Beta Runner' });

          await checkbox.click();

          await expect(checkbox).toBeChecked();
          await expect(rowNamed(page, 'Beta Runner')).toHaveAttribute('aria-selected', 'true');
          await expect(lastActivated(page)).toHaveText('Last activated: Alpha Searcher');
        });

        await test.step('THEN: toggling the checkbox via keyboard Space also leaves the activation readout unchanged', async () => {
          const checkbox = table(page).getByRole('checkbox', { name: 'Select Beta Runner' });

          await checkbox.focus();
          await page.keyboard.press('Space');

          await expect(checkbox).not.toBeChecked();
          await expect(lastActivated(page)).toHaveText('Last activated: Alpha Searcher');
        });
      });
    });
  });
});
