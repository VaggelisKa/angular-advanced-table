import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/keyboard-interaction');
});

test('handles interactive cell controls and reports actions via keyboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Keyboard Interaction' })).toBeVisible();

  const lastAction = page.locator('.info-tag');
  await expect(lastAction).toContainText('Last action: None yet');

  // Find the Acknowledge button for "Alpha Searcher", focus it, and press Enter
  const ackBtn = page.getByRole('button', { name: 'Acknowledge Alpha Searcher' });
  await expect(ackBtn).toBeVisible();
  await ackBtn.focus();
  await page.keyboard.press('Enter');
  await expect(lastAction).toContainText('Last action: Acknowledged Alpha Searcher');

  // Find the checkbox for "Alpha Searcher" (initially Active), focus it, and press Space to toggle
  const checkbox = page.getByRole('checkbox', { name: 'Active Alpha Searcher' });
  await expect(checkbox).toBeChecked();

  // Toggle status checkbox (to pause it) via Space
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).not.toBeChecked();
  await expect(lastAction).toContainText('Last action: Paused Alpha Searcher');

  // Toggle status checkbox again (to resume it) via Enter (checkboxes also toggle on Enter in many environments, but Space is standard. Let's use Space again or Enter)
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await expect(lastAction).toContainText('Last action: Resumed Alpha Searcher');
});
