import { expect, test } from '@playwright/test';

test.describe('Column visibility accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visibility');
  });

  test('toggles column visibility via chips using keyboard only', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Column Visibility' })).toBeVisible();

    const table = page.getByRole('grid', { name: 'Visibility demo table' });

    // Columns initially defined in tableState:
    // name: true, category: true, status: false, value: true
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Status' })).toBeHidden();

    // Find the column chip for status, focus and press Space to show it
    const statusChip = page.locator('button[data-column-id="status"]');

    await expect(statusChip).toBeVisible();
    await expect(statusChip).not.toHaveClass(/is-active/);

    await statusChip.focus();
    await expect(statusChip).toBeFocused();
    await page.keyboard.press('Space');

    await expect(statusChip).toHaveClass(/is-active/);
    await expect(table.getByRole('columnheader', { name: 'Status' })).toBeVisible();

    // Focus the "Name" chip and press Enter to hide it
    const nameChip = page.locator('button[data-column-id="name"]');

    await expect(nameChip).toHaveClass(/is-active/);

    await nameChip.focus();
    await expect(nameChip).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(nameChip).not.toHaveClass(/is-active/);
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeHidden();
  });
});
