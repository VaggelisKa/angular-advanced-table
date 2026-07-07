import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';

test.describe('FEATURE: Multiple features accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test.describe('GIVEN: the live market tape example is loaded', () => {
    test.describe('WHEN: live tape features are navigated via keyboard', () => {
      test('THEN: it navigates live tape features using keyboard only', async ({ page }) => {
        test.slow(); // Increase timeout for this heavy test
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
          const advancingChip = page.locator('.status-chip[data-status="Advancing"]');
          const countLabel = advancingChip.locator('.filter-pill-count');

          // Wait for the count to be present and non-zero (simulation might need a moment to start/sync)
          await expect(countLabel).toBeVisible();
          const expectedCountText = await countLabel.textContent();
          const expectedCount = parseInt(expectedCountText?.replace(/,/g, '').trim() ?? '0', 10);

          const pageSizeValue = await page.locator('.page-size-select').inputValue();
          const pageSize = parseInt(pageSizeValue, 10);
          const effectiveCount = Math.min(expectedCount, pageSize);

          await expect(page.locator('tbody tr')).toHaveCount(effectiveCount);

          const advancingRows = page.locator('td[data-column-id="status"]').filter({ hasText: 'Advancing' });

          await expect(advancingRows).toHaveCount(effectiveCount);

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

    test.describe('WHEN: the multiple features example is scanned with axe-core', () => {
      // TRACKED DEBT: the bespoke "live market tape" dashboard has pre-existing WCAG AA
      // color-contrast debt from computed/blended muted colors on tinted backgrounds
      // (e.g. an effective #899099 on #f3f3f3 ≈ 2.9:1). The shared design tokens
      // (--text-muted, --warning) were already fixed to AA; the remaining offenders are
      // opacity/blend-derived in this one demo and need a dedicated showcase-design pass,
      // not a mechanical token bump. The scan is retained (not deleted) so the fix flips
      // this back to `test(...)`. Every other a11y demo passes axe.
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '.demo-surface');
      });
    });
  });
});
