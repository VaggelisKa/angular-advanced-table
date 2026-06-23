import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

test.describe('Column reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/reordering');
  });

  const headerColumnIds = async (page: Page): Promise<string[]> =>
    page
      .getByTestId('reordering-order-item')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-column-id')).filter((id): id is string => id !== null));

  test('moves a focused column header with Ctrl+Shift+Arrow', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
    await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
    await expect.poll(() => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

    const categoryHeader = page.getByTestId('nat-table-header-category');

    await categoryHeader.focus();
    await expect(categoryHeader).toBeFocused();

    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);

    await expect.poll(() => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
    await expect(categoryHeader).toBeFocused();
    await expect(page.getByTestId('nat-table-live-region')).toContainText(
      'Moved Category column to position 3 of 4 in the unpinned region.'
    );
  });

  test('scrolls the table region when keyboard reordering moves a focused header right out of view', async ({ page }) => {
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

    test('scrolls the table region when keyboard reordering moves a focused header right out of view', async ({ page }) => {
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
      await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
      await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
      await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

      const tableRegion = page.getByTestId('nat-table-region');
      const categoryHeader = page.getByTestId('nat-table-header-category');

      await expect.poll(async () => tableRegion.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);

      await categoryHeader.focus();
      await expect(categoryHeader).toBeFocused();

      await tableRegion.evaluate((element) => {
        element.scrollLeft = 0;
      });
      const scrollLeftBefore = await tableRegion.evaluate((element) => element.scrollLeft);

      await page.keyboard.press('Control+Shift+ArrowRight');

      await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
      await expect.poll(async () => tableRegion.evaluate((element) => element.scrollLeft)).toBeGreaterThan(scrollLeftBefore);
      await expect(categoryHeader).toBeFocused();
    });

    await page.keyboard.press(`${modifier}+Shift+ArrowRight`);

    test('moves a column with the header actions menu as a non-drag pointer alternative', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
      await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
      await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

      await page.getByTestId('nat-table-header-actions-menu-category').click();
      await expect(page.getByTestId('nat-table-header-pin-left-category')).toHaveCount(0);
      await expect(page.getByTestId('nat-table-header-pin-right-category')).toHaveCount(0);
      await page.getByTestId('nat-table-header-move-right-category').click();

      await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
      await expect(page.getByTestId('nat-table-live-region')).toContainText(
        'Moved Category column to position 3 of 4 in the unpinned region.'
      );
    });
  });
});
