import { expect, test } from '@playwright/test';

test.describe('Sorting accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sorting');
  });

  test('renders sorting grids and handles programmatic single-column sort actions via keyboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sorting Feature' })).toBeVisible();

    const stateTag = page.locator('.info-tag', { hasText: 'Current state' });

    await expect(stateTag).toContainText('name (asc)');

    // Focus and trigger Sort by Value (Asc)
    const sortValueAscBtn = page.getByRole('button', { name: 'Sort by Value (Asc)' });

    await sortValueAscBtn.focus();
    await page.keyboard.press('Enter');
    await expect(stateTag).toContainText('value (asc)');

    // Focus and trigger Sort by Name (Desc)
    const sortNameDescBtn = page.getByRole('button', { name: 'Sort by Name (Desc)' });

    await sortNameDescBtn.focus();
    await page.keyboard.press('Space');
    await expect(stateTag).toContainText('name (desc)');

    // Focus and trigger Clear Sorting
    const clearBtn = page
      .locator('.card', { hasText: 'Programmatic Sort Actions' })
      .getByRole('button', { name: 'Clear Sorting' });

    await clearBtn.focus();
    await page.keyboard.press('Enter');
    await expect(stateTag).toContainText('None');
  });

  test('handles interactive sorting on column headers via keyboard', async ({ page }) => {
    const table = page.getByRole('grid', { name: 'Sorting demo table', exact: true });
    const categoryHeaderBtn = table.locator('th[data-column-id="category"] button.sort-button');
    const stateTag = page.locator('.info-tag', { hasText: 'Current state' });

    // Initially name (asc)
    await expect(stateTag).toContainText('name (asc)');

    // Focus category header and press Enter to sort ascending
    await categoryHeaderBtn.focus();
    await page.keyboard.press('Enter');
    await expect(stateTag).toContainText('category (asc)');

    // Press Enter again to sort descending
    await page.keyboard.press('Enter');
    await expect(stateTag).toContainText('category (desc)');
  });

  test('handles programmatic multi-column sorting via keyboard', async ({ page }) => {
    const multiStateTag = page.locator('.info-tag', { hasText: 'Current sorting' });

    await expect(multiStateTag).toContainText('None');

    // Focus and trigger multi preset button
    const multiBtn = page.getByRole('button', { name: 'Sort by Category, then Value' });

    await multiBtn.focus();
    await page.keyboard.press('Enter');
    await expect(multiStateTag).toContainText('1. category (asc), 2. value (desc)');

    // Focus and trigger Clear button
    const clearBtn = page
      .locator('.card', { hasText: 'Sort Priority' })
      .getByRole('button', { name: 'Clear Sorting' });

    await clearBtn.focus();
    await page.keyboard.press('Space');
    await expect(multiStateTag).toContainText('None');
  });
});
