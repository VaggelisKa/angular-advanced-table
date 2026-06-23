import { expect, test } from '@playwright/test';

test.describe('Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/sorting');
  });

  test('renders sorting grids and handles programmatic single-column sort actions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sorting Feature' })).toBeVisible();

    const stateTag = page.locator('.info-tag', { hasText: 'Current state' });

    await expect(stateTag).toContainText('name (asc)');

    // Sort by Value (Asc)
    await page.getByRole('button', { name: 'Sort by Value (Asc)' }).click();
    await expect(stateTag).toContainText('value (asc)');

    // Sort by Name (Desc)
    await page.getByRole('button', { name: 'Sort by Name (Desc)' }).click();
    await expect(stateTag).toContainText('name (desc)');

    // Clear Sorting
    await page.locator('.card', { hasText: 'Programmatic Sort Actions' }).getByRole('button', { name: 'Clear Sorting' }).click();
    await expect(stateTag).toContainText('None');
  });

  test('handles interactive sorting on column headers', async ({ page }) => {
    const table = page.getByRole('grid', { name: 'Sorting demo table', exact: true });
    const categoryHeaderBtn = table.locator('th[data-column-id="category"] button.sort-button');
    const stateTag = page.locator('.info-tag', { hasText: 'Current state' });

    // Initially name (asc)
    await expect(stateTag).toContainText('name (asc)');

    // Click category to sort ascending
    await categoryHeaderBtn.click();
    await expect(stateTag).toContainText('category (asc)');

    // Click category again to sort descending
    await categoryHeaderBtn.click();
    await expect(stateTag).toContainText('category (desc)');
  });

  test('handles programmatic multi-column sorting', async ({ page }) => {
    const multiStateTag = page.locator('.info-tag', { hasText: 'Current sorting' });

    await expect(multiStateTag).toContainText('None');

    // Apply multi preset
    await page.getByRole('button', { name: 'Sort by Category, then Value' }).click();
    await expect(multiStateTag).toContainText('1. category (asc), 2. value (desc)');

    // Clear
    await page.locator('.card', { hasText: 'Sort Priority' }).getByRole('button', { name: 'Clear Sorting' }).click();
    await expect(multiStateTag).toContainText('None');
  });
});
