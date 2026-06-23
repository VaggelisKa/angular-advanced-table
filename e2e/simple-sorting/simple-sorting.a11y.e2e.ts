import { expect, test } from '@playwright/test';

test.describe('Simple sorting accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/simple-sorting');
  });

  test('renders simple sorting page with pinned columns and sorts via keyboard', async ({ page }) => {
    const table = page.getByRole('grid', { name: 'Sortable order table with pinned company and row action columns' });

    await expect(table).toBeVisible();

    // Verify headers
    await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Company' })).toBeVisible();

    // Test sorting by Customer column via keyboard
    const customerHeaderBtn = table.getByRole('button', { name: 'Sort by Customer' });

    await expect(customerHeaderBtn).toBeVisible();

    // Customer cells in DOM/row order. Initial (unsorted) order:
    const customerCells = table.locator('td[data-column-id="customer"]');

    await expect(customerCells).toContainText(['Northstar Supply', 'Juniper Foods', 'Atlas Studio', 'Harbor Retail', 'Pioneer Labs']);

    // Focus and trigger sort via keyboard
    await customerHeaderBtn.focus();
    await page.keyboard.press('Enter');

    // Now sorted ascending by customer:
    await expect(customerCells).toContainText(['Atlas Studio', 'Harbor Retail', 'Juniper Foods', 'Northstar Supply', 'Pioneer Labs']);
  });
});
