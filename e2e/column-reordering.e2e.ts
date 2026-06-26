import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('FEATURE: Column reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/reordering');
  });

  const headerColumnIds = async (page: Page): Promise<string[]> =>
    page
      .getByTestId('reordering-order-item')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-column-id')).filter((id): id is string => id !== null));

  test.describe('GIVEN: the column reordering example is loaded', () => {
    test.describe('WHEN: Ctrl+Shift+ArrowRight is pressed on a focused column header', () => {
      test('THEN: it moves the column one position right, keeps focus, and announces the move', async ({ page }) => {
        const categoryHeader = page.getByTestId('nat-table-header-category');

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
          await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

          await categoryHeader.focus();
          await expect(categoryHeader).toBeFocused();

          const isMac = process.platform === 'darwin';

          await page.keyboard.press(`${isMac ? 'Meta' : 'Control'}+Shift+ArrowRight`);
        });

        await test.step('THEN: category moves one position right, keeps focus, and is announced', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect(categoryHeader).toBeFocused();
          await expect(page.getByTestId('nat-table-live-region')).toContainText(
            'Moved Category column to position 3 of 4 in the unpinned region.'
          );
        });
      });
    });

    test.describe('WHEN: Ctrl+Shift+ArrowRight moves a focused header right out of view in an overflow region', () => {
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

        const tableRegion = page.getByTestId('nat-table-region');
        const categoryHeader = page.getByTestId('nat-table-header-category');
        let scrollLeftBefore = 0;

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
          await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
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

          const isMac = process.platform === 'darwin';

          await page.keyboard.press(`${isMac ? 'Meta' : 'Control'}+Shift+ArrowRight`);
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
          await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
          await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

          await page.getByTestId('nat-table-header-actions-menu-category').click();
          await expect(page.getByTestId('nat-table-header-pin-left-category')).toHaveCount(0);
          await expect(page.getByTestId('nat-table-header-pin-right-category')).toHaveCount(0);
          await page.getByTestId('nat-table-header-move-right-category').click();
        });

        await test.step('THEN: category moves one position right and the move is announced', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect(page.getByTestId('nat-table-live-region')).toContainText(
            'Moved Category column to position 3 of 4 in the unpinned region.'
          );
        });
      });
    });
  });
});
