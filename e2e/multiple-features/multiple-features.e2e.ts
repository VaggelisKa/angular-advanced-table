import { expect, test } from '@playwright/test';

test.describe('FEATURE: Multiple features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test.describe('GIVEN: the live market tape example is loaded', () => {
    test.describe('WHEN: the page is rendered', () => {
      test('THEN: it shows the branding, heading, and kpi cards', async ({ page }) => {
        // test.slow();

        await test.step('THEN: it shows the branding and Live movers heading', async () => {
          await expect(page.locator('.brand-name')).toHaveText('Advanced Table');
          await expect(page.locator('.brand-context')).toHaveText('Live market tape');
          await expect(page.getByRole('heading', { name: 'Live movers' })).toBeVisible();
        });

        await test.step('THEN: it shows the kpi cards', async () => {
          await expect(page.locator('.kpis')).toBeVisible();
          await expect(page.locator('.kpi', { hasText: 'Instruments' })).toContainText('Instruments');
        });
      });
    });

    test.describe('WHEN: the feed toggle is clicked to pause and resume', () => {
      test('THEN: it pauses and resumes the live feed simulation', async ({ page }) => {
        // test.slow();
        const sessionLabel = page.locator('.session-label');
        const toggleBtn = page.getByRole('button', { name: /(Pause feed|Resume feed)/ });

        await toggleBtn.click();

        await test.step('THEN: the session reports the feed as paused', async () => {
          await expect(sessionLabel).toContainText('Feed paused');

          await toggleBtn.click();
        });

        await test.step('THEN: the session reports the feed as live', async () => {
          await expect(sessionLabel).toContainText('Feed live');
        });
      });
    });

    test.describe('WHEN: a manual tick is triggered while the feed is paused', () => {
      test('THEN: it increments the total ticks count', async ({ page }) => {
        // test.slow();
        // Feed starts live; pause it so the tick count only changes on manual ticks.
        await page.getByRole('button', { name: 'Pause feed' }).click();
        await expect(page.locator('.session-label')).toContainText('Feed paused');

        const tickBtn = page.getByRole('button', { name: 'Tick once' });
        const totalTicksValue = page.locator('.kpi', { hasText: 'Total ticks' }).locator('.kpi-value');
        const totalTicksBefore = await totalTicksValue.textContent();

        await tickBtn.click();

        await test.step('THEN: the total ticks count changes', async () => {
          await expect(totalTicksValue).not.toHaveText(totalTicksBefore ?? '');
        });
      });
    });

    test.describe('WHEN: a signal chip is selected', () => {
      test('THEN: it filters the table to show only rows with that status', async ({ page }) => {
        // Pause simulation to prevent rows from mutating dynamically (feed starts live)
        await page.getByRole('button', { name: 'Pause feed' }).click();
        await expect(page.locator('.session-label')).toContainText('Feed paused');

        const advancingChip = page.locator('.status-chip[data-status="Advancing"]');

        await advancingChip.click();

        await test.step('THEN: the table is filtered to show only rows with that status', async () => {
          const advancingChipInStep = page.locator('.status-chip[data-status="Advancing"]');
          const countLabel = advancingChipInStep.locator('.filter-pill-count');

          // Wait for the count to be present and non-zero (simulation might need a moment to start/sync)
          await expect(countLabel).toBeVisible();
          await expect(countLabel).not.toBeEmpty();
          const expectedCountText = await countLabel.textContent();
          const expectedCount = parseInt(expectedCountText?.replace(/,/g, '').trim() ?? '0', 10);

          expect(expectedCount).toBeGreaterThan(0);

          const pageSizeValue = await page.locator('.page-size-select').inputValue();
          const pageSize = parseInt(pageSizeValue, 10);
          const effectiveCount = Math.min(expectedCount, pageSize);

          await expect(page.locator('tbody tr')).toHaveCount(effectiveCount);

          const advancingRows = page.locator('td[data-column-id="status"]').filter({ hasText: 'Advancing' });

          await expect(advancingRows).toHaveCount(effectiveCount);
        });
      });
    });

    test.describe('WHEN: NASDAQ is entered into the global search', () => {
      test('THEN: it filters table rows to show only NASDAQ exchange entries', async ({ page }) => {
        // test.slow();
        // Pause simulation to prevent rows from mutating dynamically (feed starts live)
        await page.getByRole('button', { name: 'Pause feed' }).click();
        await expect(page.locator('.session-label')).toContainText('Feed paused');

        await expect(page.locator('tbody tr')).not.toHaveCount(0);

        const searchInput = page.locator('app-table-search input');

        await expect(searchInput).toBeVisible();

        await searchInput.fill('NASDAQ');
        await searchInput.press('Enter');

        await test.step('THEN: every visible exchange cell is NASDAQ', async () => {
          await expect(page.locator('td[data-column-id="exchange"]')).toContainText(['NASDAQ']);
          await expect(page.locator('tbody tr')).not.toHaveCount(0);

          const nasdaqCells = page.locator('td[data-column-id="exchange"]').filter({ hasText: 'NASDAQ' });
          const totalRows = await page.locator('tbody tr').count();

          await expect(nasdaqCells).toHaveCount(totalRows);
        });
      });
    });

    test.describe('WHEN: the Next page button is clicked', () => {
      test('THEN: it enables the Previous page button', async ({ page }) => {
        // test.slow();
        const pager = page.getByRole('toolbar', { name: 'Live movers table toolbar' });
        const nextBtn = pager.getByRole('button', { name: 'Next page' });
        const prevBtn = pager.getByRole('button', { name: 'Previous page' });

        await test.step('THEN: the first page disables Previous and enables Next', async () => {
          await expect(prevBtn).toBeDisabled();
          await expect(nextBtn).toBeEnabled();

          await nextBtn.click();
        });

        await test.step('THEN: Previous is enabled', async () => {
          await expect(prevBtn).toBeEnabled();
        });
      });
    });
  });
});
