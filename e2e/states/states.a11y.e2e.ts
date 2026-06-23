import { expect, test } from '@playwright/test';

test.describe('Table states accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/states');
  });

  test('displays initial states for loading, empty, and errored grids and tests retry via keyboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Table States' })).toBeVisible();

    // Loading state table
    const loadingTable = page.getByRole('grid', { name: 'Loading incidents table' });

    await expect(loadingTable.locator('.state-template')).toContainText('Loading incidents');

    // Empty state table
    const emptyTable = page.getByRole('grid', { name: 'Empty incidents table' });

    await expect(emptyTable.locator('.state-template')).toContainText('No incidents found');

    // Error state table
    const errorTable = page.getByRole('grid', { name: 'Errored incidents table' });

    await expect(errorTable.locator('.state-template-error')).toContainText('Incident queue unavailable');

    // Test retry inside error table via keyboard
    const retryBtn = errorTable.getByRole('button', { name: 'Retry' });

    await retryBtn.focus();
    await page.keyboard.press('Enter');

    // Status should change to loading
    await expect(errorTable.locator('.state-template')).toContainText('Retrying incident queue');
  });

  test('handles transition preview state switching via keyboard', async ({ page }) => {
    const transitionCard = page.locator('.card', { hasText: 'Transition preview' });
    const previewTable = transitionCard.getByRole('grid', { name: 'State transition preview table' });

    // Initial state should be loading
    await expect(previewTable.locator('.state-template')).toContainText('Loading queue');

    // Focus and trigger "Empty" option via Space
    const emptyBtn = transitionCard.getByRole('button', { name: 'Empty' });

    await emptyBtn.focus();
    await page.keyboard.press('Space');
    await expect(previewTable.locator('.state-template')).toContainText('No transition rows');

    // Focus and trigger "Error" option via Enter
    const errorBtn = transitionCard.getByRole('button', { name: 'Error' });

    await errorBtn.focus();
    await page.keyboard.press('Enter');
    await expect(previewTable.locator('.state-template-error')).toContainText('Transition request failed');

    // Focus and trigger "Rows" option via Space
    const rowsBtn = transitionCard.getByRole('button', { name: 'Rows' });

    await rowsBtn.focus();
    await page.keyboard.press('Space');
    await expect(previewTable.locator('tbody tr')).toHaveCount(3);
  });
});
