import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

const TOTAL_ROWS = 5000;

test.describe('FEATURE: Virtual scrolling', () => {
  test.describe('GIVEN: the virtual scrolling demo page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtual-scroll');
      await loadDocsExamplePreview(page, 'virtual-scroll', 'Five thousand rows, one small DOM');
    });

    test.describe('WHEN: navigating the windowed grid with the keyboard', () => {
      test('THEN: it exposes absolute row positions and hands focus across unmounted targets', async ({ page }) => {
        const preview = page.getByTestId('docs-example-virtual-scroll-preview-panel');
        const grid = preview.getByRole('grid');
        const firstBodyCell = preview.locator('tbody tr.data-row').first().locator('td, th').first();

        await test.step('THEN: the grid reports the full row set while mounting a subset', async () => {
          await expect(grid).toHaveAttribute('aria-rowcount', String(TOTAL_ROWS + 1));
          await expect(preview.locator('tbody tr.data-row').first()).toHaveAttribute('aria-rowindex', '2');
        });

        await test.step('THEN: Ctrl+End pre-scrolls and focuses a cell in the last logical row', async () => {
          await firstBodyCell.click();
          await page.keyboard.press('ControlOrMeta+End');

          await expect(async () => {
            const focusedRowIndex = await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'));

            expect(focusedRowIndex).toBe(String(TOTAL_ROWS + 1));
          }).toPass();
        });

        await test.step('THEN: ArrowUp from the last row keeps sequential navigation working', async () => {
          await page.keyboard.press('ArrowUp');

          await expect(async () => {
            const focusedRowIndex = await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'));

            expect(focusedRowIndex).toBe(String(TOTAL_ROWS));
          }).toPass();
        });
      });
    });

    test.describe('WHEN: the virtual scrolling example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-virtual-scroll-preview-panel"]');
      });
    });
  });
});
