import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/pagination');
});

test('navigates client-side pagination using keyboard only', async ({ page }) => {
  const clientCard = page.locator('.card', { hasText: 'Paginated Grid (Client-Side)' });
  const clientTable = clientCard.locator('table');
  const pager = clientCard.getByRole('toolbar');

  // Verify initial rows (page size is 3)
  await expect(clientTable.locator('tbody tr')).toHaveCount(3);

  // Focus the "5" page size button and press Space to toggle page size to 5
  const btn5 = pager.getByRole('button', { name: '5' });
  await btn5.focus();
  await page.keyboard.press('Space');
  await expect(clientTable.locator('tbody tr')).toHaveCount(5);

  // Focus the "3" page size button and press Enter to toggle back to 3
  const btn3 = pager.getByRole('button', { name: '3' });
  await btn3.focus();
  await page.keyboard.press('Enter');
  await expect(clientTable.locator('tbody tr')).toHaveCount(3);

  // Focus Next Page button and press Enter to go to page 2
  const nextBtn = pager.getByRole('button', { name: 'Next page' });
  const prevBtn = pager.getByRole('button', { name: 'Previous page' });
  await expect(prevBtn).toBeDisabled();

  await nextBtn.focus();
  await page.keyboard.press('Enter');
  
  await expect(prevBtn).toBeEnabled();
});
