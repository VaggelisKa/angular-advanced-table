import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/simple-sorting');
});

test('renders simple sorting page with pinned columns', async ({ page }) => {
  const table = page.getByRole('grid', {
    name: 'Sortable order table with pinned company and row action columns',
  });
  await expect(table).toBeVisible();

  // Verify headers
  await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Company' })).toBeVisible();

  // Test sorting by Customer column
  const customerHeaderBtn = table.getByRole('button', { name: 'Sort by Customer' }).first();
  await expect(customerHeaderBtn).toBeVisible();

  // Initially:
  // ord-1007: Northstar Supply
  // ord-1002: Juniper Foods
  // ord-1011: Atlas Studio
  // ord-1004: Harbor Retail
  // ord-1009: Pioneer Labs
  // First row customer is "Northstar Supply"
  let firstRow = table.locator('tbody tr').first();
  await expect(firstRow.locator('td').nth(1)).toContainText('Northstar Supply');

  // Click sorting
  await customerHeaderBtn.click();

  // Now sorted asc:
  // Atlas Studio
  // Harbor Retail
  // Juniper Foods
  // Northstar Supply
  // Pioneer Labs
  // First row customer should be "Atlas Studio"
  firstRow = table.locator('tbody tr').first();
  await expect(firstRow.locator('td').nth(1)).toContainText('Atlas Studio');
});
