import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

/** Rendered width of `locator`'s bounding box, in CSS pixels. */
const boundingWidth = async (locator: Locator): Promise<number> => {
  const box = await locator.boundingBox();

  if (!box) throw new Error('Locator has no bounding box.');

  return box.width;
};

test.describe('FEATURE: Column resizing accessibility', () => {
  test.describe('GIVEN: the column resizing example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/column-layout');
      await loadDocsExamplePreview(page, 'column-resizing', 'Column resizing');
    });

    test.describe('WHEN: the Name column header is focused and resized with the keyboard', () => {
      test('THEN: it is keyboard-reachable and operable, and the live region announces the new width', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Column resizing demo table' });
        const nameHeader = table.getByTestId('nat-table-header-name');
        // The polite live region is a sibling of the <table>, inside the table-region
        // wrapper — NOT inside the grid — so scope it to the example preview panel.
        const liveRegion = page.getByTestId('docs-example-column-resizing-preview-panel').getByTestId('nat-table-live-region');

        await test.step('THEN: the header receives focus via the keyboard', async () => {
          await nameHeader.focus();
          await expect(nameHeader).toBeFocused();
        });

        let widthAfterGrow: number;

        await test.step('THEN: Alt+ArrowRight resizes the column and the live region announces the new width', async () => {
          const widthBefore = await boundingWidth(nameHeader);

          await page.keyboard.press('Alt+ArrowRight');

          // Keyboard resize applies via async change detection + layout — poll the width.
          await expect.poll(async () => boundingWidth(nameHeader)).toBeGreaterThan(widthBefore);
          widthAfterGrow = await boundingWidth(nameHeader);

          await expect(liveRegion).toHaveText(/^Name column width \d+ pixels\.$/);
          await expect(liveRegion).toContainText(String(Math.round(widthAfterGrow)));
        });

        await test.step('THEN: Alt+End jumps to the maximum and the live region announces the bound', async () => {
          await page.keyboard.press('Alt+End');

          await expect.poll(async () => boundingWidth(nameHeader)).toBeGreaterThan(widthAfterGrow);

          await expect(liveRegion).toHaveText(/^Name column width \d+ pixels \(maximum\)\.$/);
        });

        await test.step('THEN: Alt+Home jumps to the minimum and the live region announces the bound', async () => {
          await page.keyboard.press('Alt+Home');

          await expect.poll(async () => boundingWidth(nameHeader)).toBeLessThan(widthAfterGrow);

          await expect(liveRegion).toHaveText(/^Name column width \d+ pixels \(minimum\)\.$/);
        });
      });
    });

    test.describe('WHEN: the resizing example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-column-resizing-preview-panel"]');
      });
    });
  });
});
