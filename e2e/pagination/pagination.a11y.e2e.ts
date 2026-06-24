import { expect, test } from '@playwright/test';

test.describe('FEATURE: Pagination accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/pagination');
  });

  test.describe('GIVEN: the pagination example is loaded', () => {
    test.describe('WHEN: keyboard activates page-size and navigation buttons', () => {
      test('THEN: it navigates client-side pagination using keyboard only', async ({ page }) => {
        const clientCard = page.locator('.card', { hasText: 'Paginated Grid (Client-Side)' });
        const clientTable = clientCard.locator('table');
        const pager = clientCard.getByRole('toolbar');
        const btn5 = pager.getByRole('button', { name: '5' });
        const btn3 = pager.getByRole('button', { name: '3' });
        const nextBtn = pager.getByRole('button', { name: 'Next page' });
        const prevBtn = pager.getByRole('button', { name: 'Previous page' });

        await test.step('THEN: the client-side grid starts with the default page size', async () => {
          // Initial page size is 3
          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: five rows are shown after focusing size 5 and pressing Space', async () => {
          await btn5.focus();
          await page.keyboard.press('Space');

          await expect(clientTable.locator('tbody tr')).toHaveCount(5);
        });

        await test.step('THEN: three rows are shown after focusing size 3 and pressing Enter', async () => {
          await btn3.focus();
          await page.keyboard.press('Enter');

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
