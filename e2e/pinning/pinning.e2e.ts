import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/pinning');
});

test('renders pinning controls and applies column pinning styles', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Column Pinning' })).toBeVisible();

  // Find the controls for Name column
  const nameControl = page.locator('.column-control', { hasText: 'Name' });
  const nameLeftBtn = nameControl.getByRole('button', { name: 'Left' });
  const nameNoneBtn = nameControl.getByRole('button', { name: 'None' });

  // Initially "Name" is pinned left
  await expect(nameLeftBtn).toHaveClass(/active/);
  await expect(nameNoneBtn).not.toHaveClass(/active/);

  // Unpin "Name"
  await nameNoneBtn.click();
  await expect(nameNoneBtn).toHaveClass(/active/);
  await expect(nameLeftBtn).not.toHaveClass(/active/);

  // Pin "Name" to the right
  const nameRightBtn = nameControl.getByRole('button', { name: 'Right' });
  await nameRightBtn.click();
  await expect(nameRightBtn).toHaveClass(/active/);
  await expect(nameLeftBtn).not.toHaveClass(/active/);
  await expect(nameNoneBtn).not.toHaveClass(/active/);
});
