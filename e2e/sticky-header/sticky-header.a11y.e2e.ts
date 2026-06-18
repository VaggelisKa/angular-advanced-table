import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/sticky-header');
});

test('toggles sticky header class on table via keyboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sticky Header' })).toBeVisible();

  const table = page.getByRole('grid', { name: 'Sticky header demo table' });
  const checkbox = page.getByRole('checkbox', { name: 'Enable Sticky Header' });

  // Initially sticky header is checked and class is present
  await expect(checkbox).toBeChecked();
  await expect(table).toHaveClass(/has-sticky-header/);

  // Uncheck the checkbox via Space
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).not.toBeChecked();
  await expect(table).not.toHaveClass(/has-sticky-header/);

  // Check it again via Space
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await expect(table).toHaveClass(/has-sticky-header/);
});
