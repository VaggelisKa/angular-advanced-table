import { expect, test } from '@playwright/test';

test.describe('FEATURE: Global search accessibility', () => {
  test.describe('GIVEN: the search example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/search');
    });

    test.describe('WHEN: a query is typed and then cleared via the keyboard', () => {
      test('THEN: it filters rows to matches and restores all rows on clear', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Global Search & Filter' })).toBeVisible();

        const table = page.getByRole('grid', { name: 'Search demo table' });
        const searchInput = page.locator('app-table-search input');

        await expect(searchInput).toBeVisible();

        // Initially we should have 6 rows (DEMO_DATA size)
        await expect(table.locator('tbody tr')).toHaveCount(6);

        await test.step('THEN: only the matching rows remain after typing "Security" via the keyboard', async () => {
          await searchInput.focus();
          await page.keyboard.type('Security');
          await page.keyboard.press('Enter');

          // Only 2 rows match "Security"
          await expect(table.locator('tbody tr')).toHaveCount(2);
        });

        await test.step('THEN: all rows are restored after clearing the query via the keyboard', async () => {
          await searchInput.focus();
          await page.keyboard.press('ControlOrMeta+A'); // Select all
          await page.keyboard.press('Backspace');
          await page.keyboard.press('Enter');

          // All 6 rows are back
          await expect(table.locator('tbody tr')).toHaveCount(6);
        });
      });
    });
  });
});
