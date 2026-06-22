import { expect, test } from '@playwright/test';

test.describe('Simple sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/simple-sorting');
  });

  test('renders simple sorting page with pinned columns', async ({ page }) => {
    const table = page.getByRole('grid', { name: 'Sortable order table with pinned company and row action columns' });

    await expect(table).toBeVisible();

    // Verify headers
    await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Company' })).toBeVisible();

    // Test sorting by Customer column
    const customerHeaderBtn = table.getByRole('button', { name: 'Sort by Customer' });

    await expect(customerHeaderBtn).toBeVisible();

    // Customer cells in DOM/row order. Initial (unsorted) order:
    // ord-1007: Northstar Supply
    // ord-1002: Juniper Foods
    // ord-1011: Atlas Studio
    // ord-1004: Harbor Retail
    // ord-1009: Pioneer Labs
    const customerCells = table.locator('td[data-column-id="customer"]');

    await expect(customerCells).toContainText([
      'Northstar Supply',
      'Juniper Foods',
      'Atlas Studio',
      'Harbor Retail',
      'Pioneer Labs',
    ]);

    // Click sorting
    await customerHeaderBtn.click();

    // Now sorted ascending by customer:
    await expect(customerCells).toContainText([
      'Atlas Studio',
      'Harbor Retail',
      'Juniper Foods',
      'Northstar Supply',
      'Pioneer Labs',
    ]);
  });
});
