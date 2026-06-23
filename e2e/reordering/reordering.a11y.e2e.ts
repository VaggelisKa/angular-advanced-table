import { expect, test } from '@playwright/test';

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

test.describe('Column reordering accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/reordering');
  });

  test('supports keyboard-based column reordering', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();

    // Initially order is: Name, Category, Status, Value
    const orderItems = page.locator('.order-item');

    await expect(orderItems).toContainText(['Name', 'Category', 'Status', 'Value']);

    // Focus the "Name" column header's sort button
    const nameHeader = page.getByRole('grid', { name: 'Reordering demo table' }).getByRole('button', { name: 'Sort by Name' });

    await nameHeader.focus();
    await expect(nameHeader).toBeFocused();

    // Press Control + Shift + ArrowRight to swap with Category
    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);

    // Order should now be: Category, Name, Status, Value
    await expect(orderItems).toContainText(['Category', 'Name', 'Status', 'Value']);
  });
});
