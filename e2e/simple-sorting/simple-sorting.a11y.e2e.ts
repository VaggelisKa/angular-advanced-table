import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/simple-sorting');
});

test('renders simple sorting page with pinned columns and sorts via keyboard', async ({ page }) => {
  const table = page.getByRole('grid', {
    name: 'Sortable order table with pinned company and row action columns',
  });
  await expect(table).toBeVisible();

  // Verify headers
  await expect(table.getByRole('columnheader', { name: 'Customer' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Company' })).toBeVisible();

  // Test sorting by Customer column via keyboard
  const customerHeaderBtn = table.getByRole('button', { name: 'Sort by Customer' }).first();
  await expect(customerHeaderBtn).toBeVisible();

  // Initially:
  // First row customer is "Northstar Supply"
  let firstRow = table.locator('tbody tr').first();
  await expect(firstRow.locator('td').nth(1)).toContainText('Northstar Supply');

  // Focus and trigger sort via keyboard
  await customerHeaderBtn.focus();
  await page.keyboard.press('Enter');

  // Now sorted asc:
  // First row customer should be "Atlas Studio"
  firstRow = table.locator('tbody tr').first();
  await expect(firstRow.locator('td').nth(1)).toContainText('Atlas Studio');
});
