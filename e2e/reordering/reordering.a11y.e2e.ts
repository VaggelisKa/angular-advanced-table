import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/reordering');
});

test('supports keyboard-based column reordering', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();

  // Initially order is: Name, Category, Status, Value
  const orderItems = page.locator('.order-item');
  await expect(orderItems.nth(0)).toContainText('Name');
  await expect(orderItems.nth(1)).toContainText('Category');

  // Focus the "Name" column header's sort button
  const nameHeader = page.getByRole('grid', { name: 'Reordering demo table' }).getByRole('button', { name: 'Sort by Name' });
  await nameHeader.focus();

  // Press Alt + Shift + ArrowRight to swap with Category
  await page.keyboard.press('Alt+Shift+ArrowRight');

  // Order should now be: Category, Name, Status, Value
  await expect(orderItems.nth(0)).toContainText('Category');
  await expect(orderItems.nth(1)).toContainText('Name');
});
