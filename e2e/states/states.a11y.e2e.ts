import { expect, test } from '@playwright/test';

test.describe('FEATURE: Table states accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/states');
  });

  test.describe('GIVEN: the states example is loaded', () => {
    test.describe('WHEN: the retry button is activated via keyboard', () => {
      test('THEN: it displays loading, empty, and errored grids and re-enters loading when retry is triggered via keyboard', async ({ page }) => {
        const errorTable = page.getByRole('grid', { name: 'Errored incidents table' });

        await test.step('THEN: heading is visible', async () => {
          await expect(page.getByRole('heading', { name: 'Table States' })).toBeVisible();
        });

        await test.step('THEN: each grid shows its initial state', async () => {
          const loadingTable = page.getByRole('grid', { name: 'Loading incidents table' });

          await expect(loadingTable.locator('.state-template')).toContainText('Loading incidents');

          const emptyTable = page.getByRole('grid', { name: 'Empty incidents table' });

          await expect(emptyTable.locator('.state-template')).toContainText('No incidents found');

          await expect(errorTable.locator('.state-template-error')).toContainText('Incident queue unavailable');

          const retryBtn = errorTable.getByRole('button', { name: 'Retry' });

          await retryBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: it re-enters the loading state', async () => {
          await expect(errorTable.locator('.state-template')).toContainText('Retrying incident queue');
        });
      });
    });

    test.describe('WHEN: the state transition buttons are activated via keyboard', () => {
      test('THEN: it switches the preview grid between loading, empty, error, and rows states via keyboard', async ({ page }) => {
        const transitionCard = page.locator('.card', { hasText: 'Transition preview' });
        const previewTable = transitionCard.getByRole('grid', { name: 'State transition preview table' });
        const emptyBtn = transitionCard.getByRole('button', { name: 'Empty' });
        const errorBtn = transitionCard.getByRole('button', { name: 'Error' });
        const rowsBtn = transitionCard.getByRole('button', { name: 'Rows' });

        await test.step('THEN: preview starts in loading state', async () => {
          await expect(previewTable.locator('.state-template')).toContainText('Loading queue');

          await emptyBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the empty state shows', async () => {
          await expect(previewTable.locator('.state-template')).toContainText('No transition rows');

          await errorBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the error state shows', async () => {
          await expect(previewTable.locator('.state-template-error')).toContainText('Transition request failed');

          await rowsBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the populated grid shows', async () => {
          await expect(previewTable.locator('tbody tr')).toHaveCount(3);
        });
      });
    });
  });
});
