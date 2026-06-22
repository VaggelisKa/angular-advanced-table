import { expect, test } from '@playwright/test';

test.describe('Multiple features accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test('navigates live tape features using keyboard only', async ({ page }) => {
    // Focus the simulation toggle button and press Enter to pause feed
    const toggleBtn = page.getByRole('button', { name: /(Pause feed|Resume feed)/ });

    await toggleBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.session-label')).toContainText('Feed paused');

    // Focus status filter chip and toggle it using Space
    const advancingChip = page.locator('.status-chip[data-status="Advancing"]');

    await advancingChip.focus();
    await page.keyboard.press('Space');

    // Verify only Advancing status is visible
    const advancingRows = page.locator('td[data-column-id="status"]').filter({ hasText: 'Advancing' });
    const totalRows = await page.locator('tbody tr').count();

    expect(totalRows).toBeGreaterThan(0);
    await expect(advancingRows).toHaveCount(totalRows);

    // Focus search input, type NASDAQ, and press Enter
    await expect(page.locator('tbody tr')).not.toHaveCount(0);
    const searchInput = page.locator('app-table-search input');

    await searchInput.focus();
    await page.keyboard.type('NASDAQ');
    await page.keyboard.press('Enter');

    // Verify search result — leading visible row's exchange is NASDAQ
    await expect(page.locator('td[data-column-id="exchange"]')).toContainText(['NASDAQ']);
    const nasdaqCells = page.locator('td[data-column-id="exchange"]').filter({ hasText: 'NASDAQ' });
    const totalRowsAfterSearch = await page.locator('tbody tr').count();

    await expect(nasdaqCells).toHaveCount(totalRowsAfterSearch);
  });
});
