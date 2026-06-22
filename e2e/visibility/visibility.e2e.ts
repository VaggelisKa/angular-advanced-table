import { expect, test } from '@playwright/test';

test.describe('Column visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/visibility');
  });

  test('toggles column visibility via chips', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Column Visibility' })).toBeVisible();

    const table = page.getByRole('grid', { name: 'Visibility demo table' });

    // Columns initially defined in tableState:
    // name: true, category: true, status: false, value: true
    // Let's verify "Status" header is not visible initially, and "Name" is.
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Status' })).toBeHidden();

    // Find the column chip for status and click it to show it
    const statusChip = page.locator('button[data-column-id="status"]');

    await expect(statusChip).toBeVisible();
    await expect(statusChip).not.toHaveClass(/is-active/);

    await statusChip.click();
    await expect(statusChip).toHaveClass(/is-active/);
    await expect(table.getByRole('columnheader', { name: 'Status' })).toBeVisible();

    // Click "Name" chip to hide it
    const nameChip = page.locator('button[data-column-id="name"]');

    await expect(nameChip).toHaveClass(/is-active/);
    await nameChip.click();
    await expect(nameChip).not.toHaveClass(/is-active/);
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeHidden();
  });
});
