import { expect, test } from '@playwright/test';

test.describe('FEATURE: Multiple features accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test.describe('GIVEN: the live market tape example is loaded', () => {
    test.describe('WHEN: live tape features are navigated via keyboard', () => {
      test('THEN: it navigates live tape features using keyboard only', async ({ page }) => {
        const toggleBtn = page.getByRole('button', { name: /(Pause feed|Resume feed)/ });

        await toggleBtn.focus();
        await page.keyboard.press('Enter');

        await test.step('THEN: the session reports the feed as paused', async () => {
          await expect(page.locator('.session-label')).toContainText('Feed paused');

          const advancingChip = page.locator('.status-chip[data-status="Advancing"]');

          await advancingChip.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: every visible row has the Advancing status', async () => {
          const advancingRows = page.locator('td[data-column-id="status"]').filter({ hasText: 'Advancing' });
          const totalRows = await page.locator('tbody tr').count();

          expect(totalRows).toBeGreaterThan(0);
          await expect(advancingRows).toHaveCount(totalRows);

          await expect(page.locator('tbody tr')).not.toHaveCount(0);
          const searchInput = page.locator('app-table-search input');

          await searchInput.focus();
          await page.keyboard.type('NASDAQ');
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: every visible exchange cell is NASDAQ', async () => {
          await expect(page.locator('td[data-column-id="exchange"]')).toContainText(['NASDAQ']);
          const nasdaqCells = page.locator('td[data-column-id="exchange"]').filter({ hasText: 'NASDAQ' });
          const totalRowsAfterSearch = await page.locator('tbody tr').count();

          await expect(nasdaqCells).toHaveCount(totalRowsAfterSearch);
        });
      });
    });
  });
});
