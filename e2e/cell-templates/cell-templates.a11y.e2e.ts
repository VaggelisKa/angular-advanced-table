import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Cell templates accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/columns');
    await loadDocsExamplePreview(page, 'cell-templates', 'Cell templates in the host template');
  });

  test.describe('GIVEN: the cell templates example is loaded', () => {
    test.describe('WHEN: a templated status button is reached and activated via keyboard', () => {
      test('THEN: it enters the cell with Enter and toggles the row with the keyboard', async ({ page }) => {
        const preview = page.getByTestId('docs-example-cell-templates-preview-panel');
        const grid = preview.getByRole('grid', { name: 'Resources with a templated status column' });
        const firstStatus = grid.getByTestId('nat-table-cell-status').first();

        await test.step('THEN: the templated button is reachable from its cell', async () => {
          await firstStatus.focus();
          await page.keyboard.press('Enter');
          await expect(grid.getByRole('button', { name: 'Pause Alpha Searcher' })).toBeFocused();
        });

        await test.step('THEN: activating it updates the row', async () => {
          await page.keyboard.press('Enter');
          await expect(firstStatus).toContainText('Paused');
        });
      });
    });

    test.describe('WHEN: the table and the list are scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations in either renderer', async ({ page }) => {
        const preview = page.getByTestId('docs-example-cell-templates-preview-panel');

        await test.step('THEN: the table passes', async () => {
          await expectNoAxeViolations(page, '[data-testid="docs-example-cell-templates-preview-panel"]');
        });

        await test.step('THEN: the list passes', async () => {
          await preview.getByRole('button', { name: 'List', exact: true }).click();
          await expect(preview.getByTestId('nat-list')).toBeVisible();
          await expectNoAxeViolations(page, '[data-testid="docs-example-cell-templates-preview-panel"]');
        });
      });
    });
  });
});
