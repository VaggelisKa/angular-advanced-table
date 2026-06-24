import { expect, test } from '@playwright/test';

test.describe('FEATURE: Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/pagination');
  });

  test.describe('GIVEN: the pagination example is loaded', () => {
    test.describe('WHEN: the page-size buttons and Next page are clicked (client-side)', () => {
      test('THEN: it supports client-side pagination and page size configuration', async ({ page }) => {
        const clientCard = page.locator('.card', { hasText: 'Paginated Grid (Client-Side)' });
        const clientTable = clientCard.locator('table');
        const pager = clientCard.getByRole('toolbar');
        const nextBtn = pager.getByRole('button', { name: 'Next page' });
        const prevBtn = pager.getByRole('button', { name: 'Previous page' });

        await test.step('THEN: the page renders', async () => {
          await expect(page.getByRole('heading', { name: 'Table Pagination' })).toBeVisible();
        });

        await test.step('THEN: the client-side grid starts with the default page size', async () => {
          // Initial page size is 3
          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: the page size is changed to 5', async () => {
          await pager.getByRole('button', { name: '5' }).click();
        });

        await test.step('THEN: five rows are shown', async () => {
          await expect(clientTable.locator('tbody tr')).toHaveCount(5);
        });

        await test.step('THEN: the page size is changed back to 3', async () => {
          await pager.getByRole('button', { name: '3' }).click();
        });

        await test.step('THEN: three rows are shown', async () => {
          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: the first page disables Previous', async () => {
          await expect(prevBtn).toBeDisabled();
        });

        await test.step('THEN: Next page is clicked', async () => {
          await nextBtn.click();
        });

        await test.step('THEN: Previous is enabled and the page still shows three rows', async () => {
          await expect(prevBtn).toBeEnabled();
          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });
      });
    });

    test.describe('WHEN: the Next page button is clicked (server-side)', () => {
      test('THEN: it supports manual/server-side pagination', async ({ page }) => {
        const manualCard = page.locator('.card', { hasText: 'Manual / Server-Side Pagination' });
        const manualTable = manualCard.locator('table');
        const pager = manualCard.getByRole('toolbar');
        const nextBtn = pager.getByRole('button', { name: 'Next page' });

        await test.step('THEN: page 1 shows the first three names', async () => {
          // Page 1 names come from mock dataset index 0-2
          await expect(manualTable.locator('tbody tr')).toHaveCount(3);
          const nameCells = manualTable.locator('tbody [data-column-id="name"]');

          await expect(nameCells).toContainText(['Alpha Searcher', 'Beta Runner', 'Gamma Processor']);
        });

        await test.step('THEN: Next page is clicked', async () => {
          await nextBtn.click();
        });

        await test.step('THEN: page 2 shows the next three names', async () => {
          // Page 2 names come from mock dataset index 3-5
          await expect(manualTable.locator('tbody tr')).toHaveCount(3);
          const nameCells = manualTable.locator('tbody [data-column-id="name"]');

          await expect(nameCells).toContainText(['Delta Watcher', 'Epsilon Shield', 'Zeta Pipeline']);
        });
      });
    });
  });
});
