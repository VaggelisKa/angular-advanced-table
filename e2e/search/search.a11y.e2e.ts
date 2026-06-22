import { expect, test } from '@playwright/test';

test.describe('Global search accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('filters table rows via global fuzzy search input using keyboard only', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Global Search & Filter' })).toBeVisible();

    const table = page.getByRole('grid', { name: 'Search demo table' });
    const searchInput = page.locator('app-table-search input');

    await expect(searchInput).toBeVisible();

    // Initially we should have 6 rows (DEMO_DATA size)
    await expect(table.locator('tbody tr')).toHaveCount(6);

    // Focus and type "Security"
    await searchInput.focus();
    await page.keyboard.type('Security');
    await page.keyboard.press('Enter');

    // Verify only 2 rows matching "Security" are visible
    await expect(table.locator('tbody tr')).toHaveCount(2);

    // Focus and clear search
    await searchInput.focus();
    await page.keyboard.press('ControlOrMeta+A'); // Select all
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Enter');

    // Verify all 6 rows are back
    await expect(table.locator('tbody tr')).toHaveCount(6);
  });
});
