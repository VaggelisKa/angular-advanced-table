import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { loadDocsExamplePreview } from './support/docs-example';

test.describe('FEATURE: Column reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
    await loadDocsExamplePreview(page, 'column-reordering', 'Column reordering');
  });

  const headerColumnIds = async (page: Page): Promise<string[]> =>
    page
      .getByTestId('reordering-order-item')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-column-id')).filter((id): id is string => id !== null));

  test.describe('GIVEN: the column reordering example is loaded', () => {
    test.describe('WHEN: Mod+Shift+ArrowRight is pressed on a focused column header', () => {
      test('THEN: it moves the column one position right, keeps focus, and announces the move', async ({ page }) => {
        const reorderingTable = page.getByTestId('reordering-demo-table');
        const categoryHeader = reorderingTable.getByTestId('nat-table-header-category');

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

          await categoryHeader.focus();
          await expect(categoryHeader).toBeFocused();

          await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');
        });

        await test.step('THEN: category moves one position right, keeps focus, and is announced', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect(categoryHeader).toBeFocused();
          await expect(reorderingTable.getByTestId('nat-table-live-region')).toContainText(
            'Moved Category column to position 3 of 4 in the unpinned region.'
          );
        });
      });
    });

    test.describe('WHEN: Mod+Shift+ArrowRight moves a focused header right out of view in an overflow region', () => {
      test('THEN: it scrolls the column into view, moves it right, and keeps focus', async ({ page }) => {
        await page.setViewportSize({ width: 420, height: 760 });
        await page.addStyleTag({
          content: `
        [data-testid^='nat-table-header-'],
        tbody th[data-column-id],
        tbody td[data-column-id] {
          min-width: 220px !important;
          width: 220px !important;
        }
      `
        });

        const reorderingTable = page.getByTestId('reordering-demo-table');
        const tableRegion = reorderingTable.getByTestId('nat-table-region');
        const categoryHeader = reorderingTable.getByTestId('nat-table-header-category');
        let scrollLeftBefore = 0;

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);
        });

        await test.step('THEN: the table region is horizontally scrollable', async () => {
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);

          await categoryHeader.focus();
          await expect(categoryHeader).toBeFocused();

          await tableRegion.evaluate((element) => {
            element.scrollLeft = 0;
          });
          scrollLeftBefore = await tableRegion.evaluate((element) => element.scrollLeft);

          await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');
        });

        await test.step('THEN: category moves right, the region scrolls it into view, and focus is kept', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollLeft)).toBeGreaterThan(scrollLeftBefore);
          await expect(categoryHeader).toBeFocused();
        });
      });
    });

    test.describe('WHEN: the header actions menu Move Right is clicked', () => {
      test('THEN: it moves the column one position right and announces the move', async ({ page }) => {
        await test.step('THEN: the demo renders with the default column order', async () => {
          const reorderingTable = page.getByTestId('reordering-demo-table');

          await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

          await reorderingTable.getByTestId('nat-table-header-actions-menu-category').click();
          await expect(reorderingTable.getByTestId('nat-table-header-pin-left-category')).toHaveCount(0);
          await expect(reorderingTable.getByTestId('nat-table-header-pin-right-category')).toHaveCount(0);
          await reorderingTable.getByTestId('nat-table-header-move-right-category').click();
        });

        await test.step('THEN: category moves one position right and the move is announced', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect(page.getByTestId('reordering-demo-table').getByTestId('nat-table-live-region')).toContainText(
            'Moved Category column to position 3 of 4 in the unpinned region.'
          );
        });
      });
    });
  });
});
