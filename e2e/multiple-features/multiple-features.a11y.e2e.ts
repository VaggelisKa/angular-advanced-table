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

    test.describe('WHEN: Tab traverses the toolbar and the pagination row', () => {
      // The toolbar and the pagination row are siblings on purpose. The toolbar
      // is a WAI-ARIA toolbar (one roving Tab stop, arrows inside); pagination
      // is a plain control row (three ordinary Tab stops). Nesting them made
      // Tab stop at the page-size select and skip both pager buttons entirely.
      test('THEN: the toolbar keeps one tab stop while every pagination control gets its own', async ({ page }) => {
        const toolbar = page.getByRole('toolbar', { name: 'Live movers table toolbar' });
        const pager = page.getByRole('group', { name: 'Table pagination' });
        const searchInput = page.locator('app-table-search input');
        const sizeSelect = page.locator('.page-size-select');
        const nextBtn = pager.getByRole('button', { name: 'Next page' });
        const prevBtn = pager.getByRole('button', { name: 'Previous page' });

        await test.step('GIVEN: pagination is not nested inside the toolbar', async () => {
          await expect(toolbar).toHaveCount(1);
          await expect(toolbar.locator('nat-table-pagination')).toHaveCount(0);
          await expect(pager).toHaveCount(1);
        });

        await test.step('THEN: Tab leaves the toolbar rather than walking its items', async () => {
          await searchInput.focus();
          await page.keyboard.press('Tab');

          const focusInsideToolbar = await toolbar.evaluate((element) => element.contains(document.activeElement));

          expect(focusInsideToolbar).toBe(false);
        });

        await test.step('THEN: Tab reaches the page-size select and then Next', async () => {
          // Previous is disabled on the first page, so it is skipped by Tab.
          await expect(prevBtn).toBeDisabled();

          await sizeSelect.press('Tab');

          await expect(nextBtn).toBeFocused();
        });

        await test.step('THEN: after paging forward Tab reaches Previous too', async () => {
          await nextBtn.press('Enter');
          await expect(prevBtn).toBeEnabled();

          await sizeSelect.press('Tab');
          await expect(prevBtn).toBeFocused();

          await prevBtn.press('Tab');
          await expect(nextBtn).toBeFocused();
        });
      });
    });

    test.describe('WHEN: keyboard focus moves into a cell control', () => {
      test('THEN: it lifts cell overflow clipping while the control is focus-visible and restores it on exit', async ({ page }) => {
        const toggleBtn = page.getByRole('button', { name: /(Pause feed|Resume feed)/ });
        const actionsCell = page.locator('td[data-column-id="actions"]').first();
        const actionsButton = actionsCell.locator('button');
        const readClipState = async (): Promise<{ buttonIsFocusVisible: boolean; cellOverflow: string; contentOverflow: string }> =>
          actionsCell.evaluate((cell) => ({
            buttonIsFocusVisible: cell.querySelector('button')?.matches(':focus-visible') ?? false,
            cellOverflow: getComputedStyle(cell).overflow,
            contentOverflow: getComputedStyle(cell.querySelector('.data-cell-content') as Element).overflow
          }));

        await test.step('GIVEN: the feed is paused so rows stop re-rendering', async () => {
          await toggleBtn.focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('.session-label')).toContainText('Feed paused');
        });

        await test.step('GIVEN: the actions cell clips its content while unfocused', async () => {
          const state = await readClipState();

          expect(state.cellOverflow).toBe('hidden');
          expect(state.contentOverflow).toBe('hidden');
        });

        await test.step('WHEN: Enter delegates the grid cell to its menu trigger and Escape closes the opened menu', async () => {
          // Enter both focuses and activates the trigger, so the row menu opens;
          // Escape closes it and keyboard-returns focus to the trigger, which is
          // the stable focus-visible state the clipping escape hatch targets.
          await actionsCell.click();
          await page.keyboard.press('Enter');
          await page.keyboard.press('Escape');
          await expect(actionsButton).toBeFocused();
        });

        await test.step('THEN: the focused control is focus-visible and the cell stops clipping its focus ring', async () => {
          const state = await readClipState();

          expect(state.buttonIsFocusVisible).toBe(true);
          expect(state.cellOverflow).toBe('visible');
          expect(state.contentOverflow).toBe('visible');
        });

        await test.step('THEN: moving focus to another cell restores the clipping', async () => {
          await page.locator('td[data-column-id="updatedAt"]').first().click();

          const state = await readClipState();

          expect(state.buttonIsFocusVisible).toBe(false);
          expect(state.cellOverflow).toBe('hidden');
          expect(state.contentOverflow).toBe('hidden');
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
