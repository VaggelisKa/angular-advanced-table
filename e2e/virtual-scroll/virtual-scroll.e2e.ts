import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

const ROW_HEIGHT = 44;
const TOTAL_ROWS = 5000;

test.describe('FEATURE: Virtual scrolling', () => {
  test.describe('GIVEN: the virtual scrolling demo page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtual-scroll');
      await loadDocsExamplePreview(page, 'virtual-scroll', 'Five thousand rows, one small DOM');
    });

    test.describe('WHEN: the region scrolls through five thousand rows', () => {
      test('THEN: it keeps a small mounted window whose spacers preserve the scroll geometry', async ({ page }) => {
        const preview = page.getByTestId('docs-example-virtual-scroll-preview-panel');
        const region = preview.getByTestId('nat-table-region');
        const dataRows = preview.locator('tbody tr.data-row');
        const gapRows = preview.getByTestId('nat-table-virtual-row-gap');
        const mountedWindow = preview.getByTestId('virtual-scroll-mounted-window');

        await test.step('THEN: it mounts a fraction of the rows plus a trailing spacer', async () => {
          await expect(mountedWindow).toContainText('1 –');
          expect(await dataRows.count()).toBeLessThan(80);
          await expect(gapRows).toHaveCount(1);
        });

        await test.step('THEN: scrolling to the middle moves the window and adds a leading spacer', async () => {
          await region.evaluate((element, offset) => {
            element.scrollTop = offset;
          }, 2500 * ROW_HEIGHT);

          await expect(async () => {
            const firstRowIndex = Number(await dataRows.first().getAttribute('aria-rowindex'));

            expect(firstRowIndex).toBeGreaterThan(2400);
          }).toPass();
          await expect(gapRows).toHaveCount(2);
          expect(await dataRows.count()).toBeLessThan(80);
        });

        await test.step('THEN: the jump buttons drive the imperative scrollToIndex API', async () => {
          await page.getByTestId('virtual-scroll-jump-top').click();

          await expect(async () => {
            expect(Number(await dataRows.first().getAttribute('aria-rowindex'))).toBe(2);
          }).toPass();

          await page.getByTestId('virtual-scroll-jump-middle').click();

          await expect(async () => {
            const scrollTop = await region.evaluate((element) => element.scrollTop);

            expect(scrollTop).toBe(2500 * ROW_HEIGHT);
          }).toPass();
        });

        await test.step('THEN: sorting resets the scroll position to the top', async () => {
          // Sort by Value: its pseudo-random values genuinely reorder the rows.
          // (Sorting by Name ascending is a no-op reorder here — alphanumeric
          // sorting keeps "Resource Node N" in numeric order — and a sort that
          // does not change the row sequence intentionally keeps the scroll.)
          await preview.getByRole('button', { name: 'Sort by Value' }).click();

          await expect(async () => {
            const scrollTop = await region.evaluate((element) => element.scrollTop);

            expect(scrollTop).toBe(0);
          }).toPass();
        });

        await test.step(`THEN: the grid still reports all ${TOTAL_ROWS} rows`, async () => {
          await expect(preview.getByRole('grid')).toHaveAttribute('aria-rowcount', String(TOTAL_ROWS + 1));
        });
      });
    });
  });
});
