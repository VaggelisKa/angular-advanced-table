import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Simple sorting accessibility', () => {
  test.describe('GIVEN: the simple-sorting example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/sorting');
      await loadDocsExamplePreview(page, 'sorting-pinned-columns', 'Sorting with pinned columns');
    });

    test.describe('WHEN: the Customer header is activated via keyboard', () => {
      test('THEN: it sorts rows ascending by customer', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Sortable order table with pinned company and row action columns' });

        await expect(table).toBeVisible();

        await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Company' })).toBeVisible();

        const customerHeaderBtn = table.getByRole('button', { name: 'Sort by Customer' });

        await expect(customerHeaderBtn).toBeVisible();

        // Customer cells in DOM/row order. Initial (unsorted) order:
        const customerCells = table.locator('td[data-column-id="customer"]');

        await test.step('THEN: initial unsorted order is shown', async () => {
          await expect(customerCells).toContainText([
            'Northstar Supply',
            'Juniper Foods',
            'Atlas Studio',
            'Harbor Retail',
            'Pioneer Labs'
          ]);

          await customerHeaderBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: rows are sorted ascending by customer', async () => {
          // Now sorted ascending by customer:
          await expect(customerCells).toContainText([
            'Atlas Studio',
            'Harbor Retail',
            'Juniper Foods',
            'Northstar Supply',
            'Pioneer Labs'
          ]);
        });
      });
    });
  });
});
