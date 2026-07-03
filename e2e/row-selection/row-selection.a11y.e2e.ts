import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Row selection accessibility', () => {
  test.describe('GIVEN: the row selection example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/row-selection');
      await loadDocsExamplePreview(page, 'row-selection', 'Row selection and bulk actions');
    });

    test.describe('WHEN: the example renders in multiple-selection mode', () => {
      test('THEN: the grid is aria-multiselectable and every row exposes aria-selected', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Row selection demo table' });

        await expect(table).toHaveAttribute('aria-multiselectable', 'true');
        await expect(table.locator('tbody tr[aria-selected="false"]')).toHaveCount(6);
      });
    });

    test.describe('WHEN: a row checkbox is focused and toggled with the keyboard', () => {
      test('THEN: it is keyboard-reachable and operable, and the live region announces the selection count', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Row selection demo table' });
        const checkbox = table.getByRole('checkbox', { name: 'Select Alpha Searcher' });
        const row = table.locator('tbody tr', { hasText: 'Alpha Searcher' });
        // The polite live region is a sibling of the <table>, inside the table-region
        // wrapper — NOT inside the grid — so scope it to the example preview panel.
        const liveRegion = page.getByTestId('docs-example-row-selection-preview-panel').getByTestId('nat-table-live-region');

        await test.step('THEN: the checkbox receives focus via the keyboard', async () => {
          await checkbox.focus();
          await expect(checkbox).toBeFocused();
        });

        await test.step('THEN: Space selects the row and the live region announces the new count', async () => {
          await page.keyboard.press('Space');

          await expect(checkbox).toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'true');
          await expect(liveRegion).toHaveText('1 row selected.');
        });

        await test.step('THEN: Space again clears the row and the live region announces the clear', async () => {
          await page.keyboard.press('Space');

          await expect(checkbox).not.toBeChecked();
          await expect(row).toHaveAttribute('aria-selected', 'false');
          await expect(liveRegion).toHaveText('Selection cleared.');
        });
      });
    });

    test.describe('WHEN: the row selection example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-row-selection-preview-panel"]');
      });
    });
  });
});
