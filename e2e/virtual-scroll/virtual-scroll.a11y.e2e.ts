import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

const TOTAL_ROWS = 10_000;

test.describe('FEATURE: Virtual scrolling', () => {
  test.describe('GIVEN: the virtual scrolling demo page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtual-scroll');
      await loadDocsExamplePreview(page, 'virtual-scroll', 'Ten thousand rows, eight columns, one small DOM');
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
          await grid.evaluate((table) => {
            (table as HTMLElement).style.minWidth = '1600px';

            for (const column of table.querySelectorAll('col')) {
              (column as HTMLElement).style.width = '400px';
            }
          });
          await firstBodyCell.click();
          await page.keyboard.press('ControlOrMeta+End');

          await expect(async () => {
            const focusedTarget = await page.evaluate(() => {
              const active = document.activeElement as HTMLElement | null;
              const cell = active?.closest<HTMLElement>('[data-column-id]');
              const region = active?.closest<HTMLElement>('[data-testid="nat-table-region"]');
              const cellRect = cell?.getBoundingClientRect();
              const regionRect = region?.getBoundingClientRect();

              return {
                rowIndex: active?.closest('tr')?.getAttribute('aria-rowindex'),
                columnId: cell?.dataset['columnId'],
                intersectsScrollport:
                  cellRect !== undefined &&
                  regionRect !== undefined &&
                  cellRect.left >= regionRect.left &&
                  cellRect.right <= regionRect.right
              };
            });

            expect(focusedTarget).toStrictEqual({
              rowIndex: String(TOTAL_ROWS + 1),
              columnId: 'total',
              intersectsScrollport: true
            });
          }).toPass();
        });

        await test.step('THEN: ArrowUp from the last row keeps sequential navigation working', async () => {
          await page.keyboard.press('ArrowUp');

          await expect(async () => {
            const focusedRowIndex = await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'));

            expect(focusedRowIndex).toBe(String(TOTAL_ROWS));
          }).toPass();
        });

        await test.step('THEN: PageUp and PageDown move focus by the visible row-page size', async () => {
          await page.keyboard.press('PageUp');

          await expect(async () => {
            const focusedRowIndex = Number(
              await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'))
            );

            expect(focusedRowIndex).toBeLessThan(TOTAL_ROWS - 1);
          }).toPass();

          await page.keyboard.press('PageDown');

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
