import { expect, test } from '@playwright/test';

test.describe('FEATURE: Sorting accessibility', () => {
  test.describe('GIVEN: the sorting example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/sorting');
    });

    test.describe('WHEN: programmatic sort buttons are activated via keyboard', () => {
      test('THEN: it applies and clears single-column sort', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Sorting Feature' })).toBeVisible();

        const stateTag = page.locator('.info-tag', { hasText: 'Current state' });

        await test.step('THEN: initial state is name (asc)', async () => {
          await expect(stateTag).toContainText('name (asc)');

          const sortValueAscBtn = page.getByRole('button', { name: 'Sort by Value (Asc)' });

          await sortValueAscBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the state reflects value (asc)', async () => {
          await expect(stateTag).toContainText('value (asc)');

          const sortNameDescBtn = page.getByRole('button', { name: 'Sort by Name (Desc)' });

          await sortNameDescBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the state reflects name (desc)', async () => {
          await expect(stateTag).toContainText('name (desc)');

          const clearBtn = page
            .locator('.card', { hasText: 'Programmatic Sort Actions' })
            .getByRole('button', { name: 'Clear Sorting' });

          await clearBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the state is cleared', async () => {
          await expect(stateTag).toContainText('None');
        });
      });
    });

    test.describe('WHEN: the Category column header is toggled via keyboard', () => {
      test('THEN: it cycles from ascending to descending sort', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Sorting demo table', exact: true });
        const categoryHeaderBtn = table.locator('th[data-column-id="category"] button.sort-button');
        const stateTag = page.locator('.info-tag', { hasText: 'Current state' });

        await test.step('THEN: initial state is name (asc)', async () => {
          await expect(stateTag).toContainText('name (asc)');

          await categoryHeaderBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: it sorts ascending', async () => {
          await expect(stateTag).toContainText('category (asc)');

          await page.keyboard.press('Enter');
        });

        await test.step('THEN: it sorts descending', async () => {
          await expect(stateTag).toContainText('category (desc)');
        });
      });
    });

    test.describe('WHEN: the multi-column sort preset and clear are activated via keyboard', () => {
      test('THEN: it applies and clears multi-column sort', async ({ page }) => {
        const multiStateTag = page.locator('.info-tag', { hasText: 'Current sorting' });

        await test.step('THEN: initial state is None', async () => {
          await expect(multiStateTag).toContainText('None');

          const multiBtn = page.getByRole('button', { name: 'Sort by Category, then Value' });

          await multiBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: both sort levels are reflected', async () => {
          await expect(multiStateTag).toContainText('1. category (asc), 2. value (desc)');

          const clearBtn = page.locator('.card', { hasText: 'Sort Priority' }).getByRole('button', { name: 'Clear Sorting' });

          await clearBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the state is cleared', async () => {
          await expect(multiStateTag).toContainText('None');
        });
      });
    });
  });
});
