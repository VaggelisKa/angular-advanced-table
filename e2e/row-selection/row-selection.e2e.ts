import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

/** The demo table, scoped by its accessible name. */
const table = (page: Page): Locator => page.getByRole('grid', { name: 'Row selection demo table' });

/** A row located by its unique Name-column text — every demo row name is distinct. */
const rowNamed = (page: Page, name: string): Locator => table(page).locator('tbody tr', { hasText: name });

/** The per-row selection checkbox, located by its generated accessible name. */
const rowCheckbox = (page: Page, name: string): Locator => table(page).getByRole('checkbox', { name: `Select ${name}` });

/** The header select-all checkbox. */
const selectAllCheckbox = (page: Page): Locator => table(page).getByRole('checkbox', { name: 'Select all services' });

/** The "Selected (N): ..." bulk-actions readout. */
const selectedInfo = (page: Page): Locator => page.locator('.info-tag', { hasText: 'Selected' });

test.describe('FEATURE: Row selection', () => {
  test.describe('GIVEN: the row selection example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/row-selection');
      await loadDocsExamplePreview(page, 'row-selection', 'Row selection and bulk actions');
    });

    test.describe('WHEN: a row selection checkbox is clicked', () => {
      test('THEN: it selects the row and updates the bulk-actions readout', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Row selection and bulk actions' })).toBeVisible();

        const checkbox = rowCheckbox(page, 'Alpha Searcher');
        const row = rowNamed(page, 'Alpha Searcher');

        await test.step('THEN: the row and readout start unselected', async () => {
          await expect(checkbox).not.toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'false');
          await expect(selectedInfo(page)).toHaveText('Selected (0): None');
        });

        await test.step('THEN: clicking the checkbox selects the row', async () => {
          await checkbox.click();

          await expect(checkbox).toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'true');
          await expect(selectedInfo(page)).toHaveText('Selected (1): Alpha Searcher');
        });

        await test.step('THEN: clicking the checkbox again clears the selection', async () => {
          await checkbox.click();

          await expect(checkbox).not.toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'false');
          await expect(selectedInfo(page)).toHaveText('Selected (0): None');
        });
      });
    });

    test.describe('WHEN: multiple row checkboxes are clicked', () => {
      test('THEN: it accumulates the selection in data order and enables bulk delete', async ({ page }) => {
        const deleteBtn = page.getByRole('button', { name: /Delete selected/ });

        await test.step('THEN: delete starts disabled with nothing selected', async () => {
          await expect(deleteBtn).toBeDisabled();
        });

        await test.step('THEN: selecting Beta Runner then Alpha Searcher lists them in data order', async () => {
          await rowCheckbox(page, 'Beta Runner').click();
          await rowCheckbox(page, 'Alpha Searcher').click();

          await expect(selectedInfo(page)).toHaveText('Selected (2): Alpha Searcher, Beta Runner');
          await expect(deleteBtn).toBeEnabled();
          await expect(deleteBtn).toHaveText('Delete selected (2)');
        });

        await test.step('THEN: both row checkboxes reflect the selection', async () => {
          await expect(rowCheckbox(page, 'Alpha Searcher')).toBeChecked();
          await expect(rowCheckbox(page, 'Beta Runner')).toBeChecked();
          await expect(rowCheckbox(page, 'Gamma Processor')).not.toBeChecked();
        });
      });
    });

    test.describe('WHEN: the select-all header checkbox is clicked', () => {
      test('THEN: it selects then clears every row', async ({ page }) => {
        const selectAll = selectAllCheckbox(page);
        const selectedRows = table(page).locator('tbody tr[aria-selected="true"]');

        await test.step('THEN: select-all starts unchecked', async () => {
          await expect(selectAll).not.toBeChecked();
        });

        await test.step('THEN: clicking select-all checks every row', async () => {
          await selectAll.click();

          await expect(selectAll).toBeChecked();
          await expect(selectedRows).toHaveCount(6);
          await expect(selectedInfo(page)).toHaveText(
            'Selected (6): Alpha Searcher, Beta Runner, Gamma Processor, Delta Watcher, Epsilon Shield, Zeta Pipeline'
          );
        });

        await test.step('THEN: clicking select-all again clears every row', async () => {
          await selectAll.click();

          await expect(selectAll).not.toBeChecked();
          await expect(selectedRows).toHaveCount(0);
          await expect(selectedInfo(page)).toHaveText('Selected (0): None');
        });
      });
    });

    test.describe('WHEN: only some rows are selected', () => {
      test('THEN: the select-all checkbox reports the indeterminate state', async ({ page }) => {
        await rowCheckbox(page, 'Alpha Searcher').click();

        // `indeterminate` is a DOM property, not a reflected attribute, so read it
        // via the element's JS property rather than an ARIA/attribute assertion.
        await expect(selectAllCheckbox(page)).toHaveJSProperty('indeterminate', true);

        await rowCheckbox(page, 'Alpha Searcher').click();

        await expect(selectAllCheckbox(page)).toHaveJSProperty('indeterminate', false);
      });
    });

    test.describe('WHEN: a row checkbox is focused and toggled with the keyboard', () => {
      test('THEN: Space toggles the row selection', async ({ page }) => {
        const checkbox = rowCheckbox(page, 'Gamma Processor');
        const row = rowNamed(page, 'Gamma Processor');

        await test.step('THEN: the checkbox receives focus via the keyboard', async () => {
          await checkbox.focus();
          await expect(checkbox).toBeFocused();
        });

        await test.step('THEN: Space selects the row', async () => {
          await page.keyboard.press('Space');

          await expect(checkbox).toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'true');
        });

        await test.step('THEN: Space again clears the row', async () => {
          await page.keyboard.press('Space');

          await expect(checkbox).not.toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'false');
        });
      });
    });
  });
});
