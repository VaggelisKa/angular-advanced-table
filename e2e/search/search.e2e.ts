import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/search');
});

test('filters table rows via global fuzzy search input', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Global Search & Filter' })).toBeVisible();

  const table = page.getByRole('grid', { name: 'Search demo table' });
  const searchInput = page.locator('app-table-search input');
  await expect(searchInput).toBeVisible();

  // Initially we should have 6 rows (DEMO_DATA size)
  await expect(table.locator('tbody tr')).toHaveCount(6);

  // Type "Security"
  await searchInput.fill('Security');
  await searchInput.press('Enter');

  // Verify only 2 rows matching "Security" are visible (Delta Watcher and Epsilon Shield)
  await expect(table.locator('tbody tr')).toHaveCount(2);

  // Clear search
  await searchInput.fill('');
  await searchInput.press('Enter');

  // Verify all 6 rows are back
  await expect(table.locator('tbody tr')).toHaveCount(6);
});
