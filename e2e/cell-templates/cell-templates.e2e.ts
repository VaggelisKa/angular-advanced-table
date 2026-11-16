import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Cell templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/columns');
    await loadDocsExamplePreview(page, 'cell-templates', 'Cell templates in the host template');
  });

  test.describe('GIVEN: the cell templates example is loaded', () => {
    test.describe('WHEN: a templated status button is clicked in the table and then in the list', () => {
      test('THEN: it updates the row through the host and renders the same template in the list', async ({ page }) => {
        const preview = page.getByTestId('docs-example-cell-templates-preview-panel');
        const grid = preview.getByRole('grid', { name: 'Resources with a templated status column' });

        await test.step('THEN: every status cell renders the projected template', async () => {
          await expect(grid.getByTestId('nat-table-cell-status').getByTestId('cell-templates-status')).toHaveCount(6);
        });

        await test.step('THEN: clicking Pause updates the row from the host', async () => {
          const firstStatus = grid.getByTestId('nat-table-cell-status').first();

          await expect(firstStatus).toContainText('Active');
          await grid.getByRole('button', { name: 'Pause Alpha Searcher' }).click();
          await expect(firstStatus).toContainText('Paused');
          await expect(grid.getByRole('button', { name: 'Activate Alpha Searcher' })).toBeVisible();
        });

        await test.step('THEN: the list renders the template as the field value', async () => {
          await preview.getByRole('button', { name: 'List', exact: true }).click();

          const list = preview.getByTestId('nat-list');

          await expect(list.getByTestId('nat-list-field-value').getByTestId('cell-templates-status')).toHaveCount(6);
          await list.getByRole('button', { name: 'Activate Alpha Searcher' }).click();
          await expect(list.getByRole('button', { name: 'Pause Alpha Searcher' })).toBeVisible();
        });
      });
    });
  });
});
