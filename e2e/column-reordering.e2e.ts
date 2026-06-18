import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/reordering');
});

const headerColumnIds = (page: Page) =>
  page
    .getByTestId('reordering-order-item')
    .evaluateAll((items) =>
      items
        .map((item) => item.getAttribute('data-column-id'))
        .filter((id): id is string => id !== null),
    );

test('moves a focused column header with Ctrl+Shift+Arrow', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
  await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
  await expect.poll(() => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

  const categoryHeader = page.getByTestId('nat-table-header-category');

  await categoryHeader.focus();
  await expect(categoryHeader).toBeFocused();

  await page.keyboard.press('Control+Shift+ArrowRight');

  await expect.poll(() => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
  await expect(categoryHeader).toBeFocused();
  await expect(page.getByTestId('nat-table-live-region')).toContainText(
    'Moved Category column to position 3 of 4 in the unpinned region.',
  );
});

test('moves a column with the header actions menu as a non-drag pointer alternative', async ({
  page,
}) => {
  await expect(page.getByRole('heading', { name: 'Column Reordering' })).toBeVisible();
  await expect(page.getByTestId('reordering-demo-table')).toBeVisible();
  await expect.poll(() => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

  await page.getByTestId('nat-table-header-actions-menu-category').click();
  await expect(page.getByTestId('nat-table-header-pin-left-category')).toHaveCount(0);
  await expect(page.getByTestId('nat-table-header-pin-right-category')).toHaveCount(0);
  await page.getByTestId('nat-table-header-move-right-category').click();

  await expect.poll(() => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
  await expect(page.getByTestId('nat-table-live-region')).toContainText(
    'Moved Category column to position 3 of 4 in the unpinned region.',
  );
});
