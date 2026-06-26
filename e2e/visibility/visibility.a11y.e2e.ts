import { expect, test } from '@playwright/test';

test.describe('FEATURE: Column visibility', () => {
  test.describe('GIVEN: the column visibility demo page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/column-layout');
    });

    test.describe('WHEN: a column chip is activated via keyboard', () => {
      test('THEN: it toggles the corresponding column visibility', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Column visibility' })).toBeVisible();

        const table = page.getByRole('grid', { name: 'Visibility demo table' });
        const statusChip = page.locator('button[data-column-id="status"]');
        const nameChip = page.locator('button[data-column-id="name"]');

        // Columns initially defined in tableState:
        // name: true, category: true, status: false, value: true
        await test.step('THEN: Name is shown and Status is hidden initially', async () => {
          await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
          await expect(table.getByRole('columnheader', { name: 'Status' })).toBeHidden();

          await expect(statusChip).toBeVisible();
          await expect(statusChip).not.toHaveClass(/is-active/);
        });

        await test.step('THEN: the Status chip is focused and activated with Space', async () => {
          await statusChip.focus();
          await expect(statusChip).toBeFocused();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the Status column becomes visible', async () => {
          await expect(statusChip).toHaveClass(/is-active/);
          await expect(table.getByRole('columnheader', { name: 'Status' })).toBeVisible();

          await expect(nameChip).toHaveClass(/is-active/);
        });

        await test.step('THEN: the Name chip is focused and activated with Enter', async () => {
          await nameChip.focus();
          await expect(nameChip).toBeFocused();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the Name column becomes hidden', async () => {
          await expect(nameChip).not.toHaveClass(/is-active/);
          await expect(table.getByRole('columnheader', { name: 'Name' })).toBeHidden();
        });
      });
    });
  });
});
