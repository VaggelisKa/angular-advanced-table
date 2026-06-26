import { expect, test } from '@playwright/test';

test.describe('FEATURE: Column reordering accessibility', () => {
  test.describe('GIVEN: the reordering example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/reordering');
    });

    test.describe('WHEN: a column header is focused and Control+Shift+ArrowRight is pressed', () => {
      test('THEN: it swaps the column with its right neighbor', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();

        // Initially order is: Name, Category, Status, Value
        const orderItems = page.locator('.order-item');

        await expect(orderItems).toContainText(['Name', 'Category', 'Status', 'Value']);

        const nameHeader = page.getByRole('grid', { name: 'Reordering demo table' }).getByRole('button', { name: 'Sort by Name' });

        await nameHeader.focus();
        await expect(nameHeader).toBeFocused();

        const isMac = process.platform === 'darwin';
        await page.keyboard.press(`${isMac ? 'Meta' : 'Control'}+Shift+ArrowRight`);

        await test.step('THEN: Name swaps with Category', async () => {
          // Order should now be: Category, Name, Status, Value
          await expect(orderItems).toContainText(['Category', 'Name', 'Status', 'Value']);
        });
      });
    });
  });
});
