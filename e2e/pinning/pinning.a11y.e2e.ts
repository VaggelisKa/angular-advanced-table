import { expect, test } from '@playwright/test';

test.describe('Column pinning accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/pinning');
  });

  test('renders pinning controls and applies column pinning styles via keyboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Column Pinning' })).toBeVisible();

    // Find the controls for Name column
    const nameControl = page.locator('.column-control', { hasText: 'Name' });
    const nameLeftBtn = nameControl.getByRole('button', { name: 'Left' });
    const nameNoneBtn = nameControl.getByRole('button', { name: 'None' });

    // Initially "Name" is pinned left
    await expect(nameLeftBtn).toHaveClass(/active/);
    await expect(nameNoneBtn).not.toHaveClass(/active/);

    // Unpin "Name" via keyboard
    await nameNoneBtn.focus();
    await expect(nameNoneBtn).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(nameNoneBtn).toHaveClass(/active/);
    await expect(nameLeftBtn).not.toHaveClass(/active/);

    // Pin "Name" to the right via keyboard
    const nameRightBtn = nameControl.getByRole('button', { name: 'Right' });

    await nameRightBtn.focus();
    await expect(nameRightBtn).toBeFocused();
    await page.keyboard.press('Space');
    await expect(nameRightBtn).toHaveClass(/active/);
  });
});
