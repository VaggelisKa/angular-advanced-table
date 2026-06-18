import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/multiple-features');
});

test('navigates live tape features using keyboard only', async ({ page }) => {
  // Focus the simulation toggle button and press Enter to pause feed
  const toggleBtn = page.getByRole('button', { name: /(Pause feed|Resume feed)/ });
  await toggleBtn.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.session-label')).toContainText('Feed paused');

  // Focus status filter chips and toggle them using Space/Enter
  const watchingChip = page.locator('.status-chip[data-status="Watching"]');
  const decliningChip = page.locator('.status-chip[data-status="Declining"]');
  const haltedChip = page.locator('.status-chip[data-status="Halted"]');

  await watchingChip.focus();
  await page.keyboard.press('Space');

  await decliningChip.focus();
  await page.keyboard.press('Enter');

  await haltedChip.focus();
  await page.keyboard.press('Space');

  // Verify only Advancing status is visible
  const nonAdvancingRows = page.locator('td[data-column-id="status"]').filter({ hasText: /^(Watching|Declining|Halted)$/ });
  await expect(nonAdvancingRows).toHaveCount(0);

  // Focus search input, type NASDAQ, and press Enter
  await expect(page.locator('tbody tr').first()).toBeVisible();
  const searchInput = page.locator('app-table-search input');
  await searchInput.focus();
  await page.keyboard.type('NASDAQ');
  await page.keyboard.press('Enter');

  // Verify search result
  await expect(page.locator('td[data-column-id="exchange"]').first()).toHaveText('NASDAQ');
  const nonNasdaqCells = page.locator('td[data-column-id="exchange"]').filter({ hasText: /^(?!NASDAQ$).*$/ });
  await expect(nonNasdaqCells).toHaveCount(0);
});
