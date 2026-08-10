import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { emulateForcedColors, emulateReducedMotion, focusIndicatorOf } from '../support/media';

const PREVIEW_PANEL = '[data-testid="docs-example-column-reordering-preview-panel"]';

const headerColumnIds = async (page: Page): Promise<string[]> =>
  page
    .getByTestId('reordering-order-item')
    .evaluateAll((items) => items.map((item) => item.getAttribute('data-column-id')).filter((id): id is string => id !== null));

test.describe('FEATURE: Column reordering accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
    await loadDocsExamplePreview(page, 'column-reordering', 'Column reordering');
  });

  test.describe('GIVEN: the column reordering example is loaded', () => {
    test.describe('WHEN: the example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });

    test.describe('WHEN: a reorderable header is reached by keyboard', () => {
      test('THEN: it is focusable as a column header and reports itself as enabled for reordering', async ({ page }) => {
        const categoryHeader = page.getByTestId('reordering-demo-table').getByTestId('nat-table-header-category');

        await categoryHeader.focus();

        await expect(categoryHeader).toBeFocused();
        await expect(categoryHeader).toHaveRole('columnheader');
        await expect(categoryHeader).toHaveAttribute('aria-disabled', 'false');
      });
    });

    test.describe('WHEN: a column is moved by keyboard and then scanned again', () => {
      test('THEN: it keeps the reordered grid free of WCAG A/AA violations', async ({ page }) => {
        const reorderingTable = page.getByTestId('reordering-demo-table');
        const categoryHeader = reorderingTable.getByTestId('nat-table-header-category');

        await categoryHeader.focus();
        await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');

        await expect.poll(async () => headerColumnIds(page)).toStrictEqual(['name', 'status', 'category', 'value']);

        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });
  });

  test.describe('GIVEN: a viewer who has asked the system to reduce motion', () => {
    test.beforeEach(async ({ page }) => {
      await emulateReducedMotion(page);
    });

    test.describe('WHEN: a column is moved by keyboard', () => {
      test('THEN: it still completes the move and keeps focus on the moved header', async ({ page }) => {
        const reorderingTable = page.getByTestId('reordering-demo-table');
        const categoryHeader = reorderingTable.getByTestId('nat-table-header-category');

        await categoryHeader.focus();
        await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');

        await expect.poll(async () => headerColumnIds(page)).toStrictEqual(['name', 'status', 'category', 'value']);
        await expect(reorderingTable.getByTestId('nat-table-header-category')).toBeFocused();
        await expect(reorderingTable.getByTestId('nat-table-live-region')).not.toBeEmpty();
      });
    });
  });

  test.describe('GIVEN: a viewer using a forced-colors (high contrast) mode', () => {
    test.beforeEach(async ({ page }) => {
      await emulateForcedColors(page);
    });

    test.describe('WHEN: the example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations under forced colors', async ({ page }) => {
        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });

    test.describe('WHEN: a reorderable header is focused', () => {
      // Forced colors forces `box-shadow` to `none`, and the cell focus ring is a
      // box-shadow paired with `outline: none`. Asserting the painted outline — not
      // mere visibility — is what proves a focus indicator actually survives here.
      test('THEN: it paints an outline focus indicator that survives the forced palette', async ({ page }) => {
        const categoryHeader = page.getByTestId('reordering-demo-table').getByTestId('nat-table-header-category');

        await categoryHeader.focus();
        await expect(categoryHeader).toBeFocused();

        const indicator = await focusIndicatorOf(categoryHeader);

        expect(indicator.outlineStyle).not.toBe('none');
        expect(indicator.outlineWidthPx).toBeGreaterThan(0);
      });
    });
  });
});
