import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/keyboard-interaction');
});

test('handles interactive cell controls and reports actions', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Keyboard Interaction' })).toBeVisible();

  const lastAction = page.locator('.info-tag');
  await expect(lastAction).toContainText('Last action: None yet');

  // Find the Acknowledge button for "Alpha Searcher"
  const ackBtn = page.getByRole('button', { name: 'Acknowledge Alpha Searcher' });
  await expect(ackBtn).toBeVisible();
  await ackBtn.click();
  await expect(lastAction).toContainText('Last action: Acknowledged Alpha Searcher');

  // Find the checkbox for "Alpha Searcher" (initially Active)
  const checkbox = page.getByRole('checkbox', { name: 'Active Alpha Searcher' });
  await expect(checkbox).toBeChecked();

  // Toggle status checkbox (to pause it)
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
  await expect(lastAction).toContainText('Last action: Paused Alpha Searcher');

  // Toggle status checkbox again (to resume it)
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(lastAction).toContainText('Last action: Resumed Alpha Searcher');
});
