import { expect, test } from '@playwright/test';

test.describe('FEATURE: Simple sorting', () => {
  test.describe('GIVEN: the simple-sorting example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/simple-sorting');
    });

    test.describe('WHEN: the Customer header is clicked', () => {
      test('THEN: it sorts rows ascending by customer', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Sortable order table with pinned company and row action columns' });

        await expect(table).toBeVisible();

        await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
        await expect(table.getByRole('columnheader', { name: 'Company' })).toBeVisible();

        const customerHeaderBtn = table.getByRole('button', { name: 'Sort by Customer' });

        await expect(customerHeaderBtn).toBeVisible();

        // Customer cells in DOM/row order. Initial (unsorted) order:
        // ord-1007: Northstar Supply
        // ord-1002: Juniper Foods
        // ord-1011: Atlas Studio
        // ord-1004: Harbor Retail
        // ord-1009: Pioneer Labs
        const customerCells = table.locator('td[data-column-id="customer"]');

        await test.step('THEN: initial unsorted order is shown', async () => {
          await expect(customerCells).toContainText([
            'Northstar Supply',
            'Juniper Foods',
            'Atlas Studio',
            'Harbor Retail',
            'Pioneer Labs'
          ]);

          await customerHeaderBtn.click();
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
