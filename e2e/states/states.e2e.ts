import { expect, test } from '@playwright/test';

test.describe('Table states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/states');
  });

  test('displays initial states for loading, empty, and errored grids', async ({ page }) => {
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

    // Test retry inside error table
    const retryBtn = errorTable.getByRole('button', { name: 'Retry' });

    await retryBtn.click();
    // Status should change to loading
    await expect(errorTable.locator('.state-template')).toContainText('Retrying incident queue');
  });

  test('handles transition preview state switching', async ({ page }) => {
    const transitionCard = page.locator('.card', { hasText: 'Transition preview' });
    const previewTable = transitionCard.getByRole('grid', { name: 'State transition preview table' });

    // Initial state should be loading
    await expect(previewTable.locator('.state-template')).toContainText('Loading queue');

    // Click "Empty" option
    await transitionCard.getByRole('button', { name: 'Empty' }).click();
    await expect(previewTable.locator('.state-template')).toContainText('No transition rows');

    // Click "Error" option
    await transitionCard.getByRole('button', { name: 'Error' }).click();
    await expect(previewTable.locator('.state-template-error')).toContainText('Transition request failed');

    // Click "Rows" option
    await transitionCard.getByRole('button', { name: 'Rows' }).click();
    await expect(previewTable.locator('tbody tr')).toHaveCount(3);
  });
});
