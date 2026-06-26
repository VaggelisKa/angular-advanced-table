import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe('FEATURE: Column reordering', () => {
  const visibleColumnIds = async (page: Page): Promise<string[]> =>
    page
      .getByTestId('reordering-order-item')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-column-id')).filter((id): id is string => id !== null));

  test.describe('GIVEN: the reordering example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/column-layout');
    });

    test.describe('WHEN: a column header is focused and Mod+Shift+ArrowRight is pressed', () => {
      test('THEN: it swaps the column with its right neighbor', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();

        // Initially order is: Name, Category, Status, Value
        await expect.poll(async () => visibleColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

        const nameHeader = page.getByRole('grid', { name: 'Reordering demo table' }).getByRole('button', { name: 'Sort by Name' });

        await nameHeader.focus();

        await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');

        await test.step('THEN: Name swaps with Category', async () => {
          // Order should now be: Category, Name, Status, Value
          await expect.poll(async () => visibleColumnIds(page)).toEqual(['category', 'name', 'status', 'value']);
        });
      });
    });
  });
});
