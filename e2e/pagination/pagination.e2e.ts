import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/pagination');
});

test('supports client-side pagination and page size configuration', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Table Pagination' })).toBeVisible();

  // Find client-side table container
  const clientCard = page.locator('.card', { hasText: 'Paginated Grid (Client-Side)' });
  const clientTable = clientCard.locator('table');
  const pager = clientCard.getByRole('toolbar');

  // Verify initial row count (page size is 3)
  await expect(clientTable.locator('tbody tr')).toHaveCount(3);

  // Change page size to 5
  await pager.getByRole('button', { name: '5' }).click();
  await expect(clientTable.locator('tbody tr')).toHaveCount(5);

  // Change page size back to 3
  await pager.getByRole('button', { name: '3' }).click();
  await expect(clientTable.locator('tbody tr')).toHaveCount(3);

  // Go to next page
  const nextBtn = pager.getByRole('button', { name: 'Next page' });
  const prevBtn = pager.getByRole('button', { name: 'Previous page' });
  await expect(prevBtn).toBeDisabled();

  await nextBtn.click();
  await expect(prevBtn).toBeEnabled();
  await expect(clientTable.locator('tbody tr')).toHaveCount(3);
});

test('supports manual/server-side pagination', async ({ page }) => {
  // Find manual table container
  const manualCard = page.locator('.card', { hasText: 'Manual / Server-Side Pagination' });
  const manualTable = manualCard.locator('table');
  const pager = manualCard.getByRole('toolbar');

  // Verify initial row count is 3
  await expect(manualTable.locator('tbody tr')).toHaveCount(3);
  const firstRowBefore = await manualTable.locator('tbody tr').first().innerText();

  // Click next page
  const nextBtn = pager.getByRole('button', { name: 'Next page' });
  await nextBtn.click();

  // Verify it changed pages and shows new rows (from our mock dataset index 3-5)
  await expect(manualTable.locator('tbody tr')).toHaveCount(3);
  await expect(manualTable.locator('tbody tr').first()).not.toContainText('Alpha Searcher');
  const firstRowAfter = await manualTable.locator('tbody tr').first().innerText();
  expect(firstRowAfter).not.toEqual(firstRowBefore);
});
