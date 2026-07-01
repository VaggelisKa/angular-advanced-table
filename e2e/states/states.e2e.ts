import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Table states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/data-lifecycle');
    await loadDocsExamplePreview(page, 'table-states', 'State rows stay inside the table');
  });

  test.describe('GIVEN: the states example is loaded', () => {
    test.describe('WHEN: the retry button is clicked', () => {
      test('THEN: it shows loading, empty, and errored grids and re-enters loading on retry', async ({ page }) => {
        const errorTable = page.getByRole('grid', { name: 'Errored incidents table' });

        await test.step('THEN: heading is visible', async () => {
          await expect(page.getByRole('heading', { name: 'State rows stay inside the table' })).toBeVisible();
        });

        await test.step('THEN: each grid shows its initial state', async () => {
          const loadingTable = page.getByRole('grid', { name: 'Loading incidents table' });

          await expect(loadingTable.locator('.state-template')).toContainText('Loading incidents');

          const emptyTable = page.getByRole('grid', { name: 'Empty incidents table' });

          await expect(emptyTable.locator('.state-template')).toContainText('No incidents found');

          await expect(errorTable.locator('.state-template-error')).toContainText('Incident queue unavailable');

          const retryBtn = errorTable.getByRole('button', { name: 'Retry' });

          await retryBtn.click();
        });

        await test.step('THEN: it re-enters the loading state', async () => {
          await expect(errorTable.locator('.state-template')).toContainText('Retrying incident queue');
        });
      });
    });

    test.describe('WHEN: the state transition buttons are clicked', () => {
      test('THEN: it switches the preview grid between loading, empty, error, and rows states', async ({ page }) => {
        const transitionCard = page.locator('.card', { hasText: 'Transition preview' });
        const previewTable = transitionCard.getByRole('grid', { name: 'State transition preview table' });

        await test.step('THEN: preview starts in loading state', async () => {
          await expect(previewTable.locator('.state-template')).toContainText('Loading queue');

          await transitionCard.getByRole('button', { name: 'Empty' }).click();
        });

        await test.step('THEN: the empty state shows', async () => {
          await expect(previewTable.locator('.state-template')).toContainText('No transition rows');

          await transitionCard.getByRole('button', { name: 'Error' }).click();
        });

        await test.step('THEN: the error state shows', async () => {
          await expect(previewTable.locator('.state-template-error')).toContainText('Transition request failed');

          await transitionCard.getByRole('button', { name: 'Rows' }).click();
        });

        await test.step('THEN: the populated grid shows', async () => {
          await expect(previewTable.locator('tbody tr')).toHaveCount(3);
        });
      });
    });
  });
});
