import { expect, test } from '@playwright/test';

test.describe('FEATURE: Pagination accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/pagination');
  });

  test.describe('GIVEN: the pagination example is loaded', () => {
    test.describe('WHEN: keyboard activates page-size select and navigation buttons', () => {
      test('THEN: it navigates client-side pagination using keyboard only', async ({ page }) => {
        const clientCard = page.locator('.card', { hasText: 'Paginated Grid (Client-Side)' });
        const clientTable = clientCard.locator('table');
        const pager = clientCard.getByRole('toolbar');
        const rowsPerPageSelect = pager.getByRole('combobox');
        const nextBtn = pager.getByRole('button', { name: 'Next page' });
        const prevBtn = pager.getByRole('button', { name: 'Previous page' });

        await test.step('THEN: the client-side grid starts with the default page size', async () => {
          // Initial page size is 3
          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: five rows are shown after selecting page size 5 via keyboard', async () => {
          await rowsPerPageSelect.focus();
          await rowsPerPageSelect.selectOption('5');

          await expect(clientTable.locator('tbody tr')).toHaveCount(5);
        });

        await test.step('THEN: three rows are shown after selecting page size 3 via keyboard', async () => {
          await rowsPerPageSelect.focus();
          await rowsPerPageSelect.selectOption('3');

          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: the first page disables Previous', async () => {
          await expect(prevBtn).toBeDisabled();
        });

        await test.step('THEN: Previous is enabled after focusing Next and pressing Enter', async () => {
          await nextBtn.focus();
          await page.keyboard.press('Enter');

          await expect(prevBtn).toBeEnabled();
        });
      });
    });
  });
});
