import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

const PREVIEW_SELECTOR = '[data-testid="docs-example-virtualization-remote-window-preview-panel"]';
const ROW_HEIGHT = 44;
const REMOTE_TOTAL = 250_000;

const scrollToRow = async (region: Locator, rowIndex: number): Promise<void> => {
  await region.evaluate((element, target) => {
    element.scrollTop = target;
    element.dispatchEvent(new Event('scroll'));
  }, rowIndex * ROW_HEIGHT);
};

test.describe('FEATURE: Remote windowing accessibility', () => {
  test.describe('GIVEN: the remote windowing example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtualization');
      await loadDocsExamplePreview(page, 'virtualization-remote-window', 'Remote windowing');
    });

    test.describe('WHEN: the grid is checked at the start and after a deep jump', () => {
      test('THEN: it exposes the remote total with absolute row metadata and passes axe in both states', async ({ page }) => {
        const demo = page.getByTestId('virtualization-remote-demo');
        const tableHost = demo.getByTestId('virtualization-remote-table');
        const table = tableHost.getByRole('grid', { name: 'Remotely windowed orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const rows = table.getByTestId('nat-table-row');

        await test.step('THEN: the initial loaded window passes axe with the remote aria-rowcount', async () => {
          await expect(table).toHaveAttribute('aria-rowcount', String(REMOTE_TOTAL + 1));
          await expect(table.getByTestId('nat-table-virtual-spacer')).toHaveAttribute('aria-hidden', 'true');
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });

        await test.step('THEN: the filled window after a deep jump keeps absolute indices and passes axe', async () => {
          await scrollToRow(region, REMOTE_TOTAL / 2);

          await expect(demo.getByTestId('remote-fetches')).toHaveText('1');
          await expect
            .poll(async () =>
              rows.evaluateAll((elements) =>
                elements.every(
                  (element) => Number(element.getAttribute('aria-rowindex')) === Number(element.getAttribute('data-row-index')) + 2
                )
              )
            )
            .toBe(true);
          await expect.poll(async () => (await rows.count()) > 0).toBe(true);
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });
      });
    });

    test.describe('WHEN: Control or Command End targets the final unfetched row of the remote dataset', () => {
      test('THEN: focus lands on a busy placeholder cell and transfers to the fetched row without being lost', async ({ page }) => {
        const demo = page.getByTestId('virtualization-remote-demo');
        const tableHost = demo.getByTestId('virtualization-remote-table');
        const table = tableHost.getByRole('grid', { name: 'Remotely windowed orders' });
        const finalRow = table.locator(`tbody tr[data-row-index="${REMOTE_TOTAL - 1}"]`);
        const finalCell = finalRow.locator('[data-column-id="total"]');

        await tableHost.getByTestId('nat-table-header-customer').focus();
        await page.keyboard.press('ControlOrMeta+End');

        await test.step('THEN: the final logical cell receives focus, placeholder or fetched', async () => {
          await expect(finalCell).toBeFocused();
          await expect(finalRow).toHaveAttribute('aria-rowindex', String(REMOTE_TOTAL + 1));
        });

        await test.step('THEN: the window fill hands focus to the fetched row cell in place', async () => {
          await expect(demo.getByTestId('remote-fetches')).toHaveText('1');
          await expect(finalRow).toHaveAttribute('data-row-id', /ord-/);
          await expect(finalCell).toBeFocused();
        });
      });
    });

    test.describe('WHEN: arrow keys move through mounted placeholder cells after a jump', () => {
      test('THEN: navigation is not trapped and each placeholder announces its loading state', async ({ page }) => {
        const demo = page.getByTestId('virtualization-remote-demo');
        const tableHost = demo.getByTestId('virtualization-remote-table');
        const table = tableHost.getByRole('grid', { name: 'Remotely windowed orders' });
        const region = tableHost.getByTestId('nat-table-region');

        await scrollToRow(region, REMOTE_TOTAL / 2);
        await expect(demo.getByTestId('remote-fetches')).toHaveText('1');

        // Jump again and immediately drive the keyboard so mounted placeholder
        // cells (the second fetch is still in flight) take part in navigation.
        await scrollToRow(region, REMOTE_TOTAL / 4);

        const firstMountedCell = table.locator('tbody tr.data-row [data-column-id="customer"]').first();

        await firstMountedCell.focus();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowRight');

        await expect
          .poll(async () =>
            page.evaluate(() => {
              const active = document.activeElement;

              return active instanceof HTMLElement
                ? { columnId: active.dataset['columnId'], inRow: !!active.closest('tr.data-row') }
                : null;
            })
          )
          .toStrictEqual({ columnId: 'region', inRow: true });

        // After the second fill the focused slot must still be reachable and real.
        await expect(demo.getByTestId('remote-fetches')).toHaveText('2');
        await expect(tableHost.getByTestId('nat-table-row-placeholder')).toHaveCount(0);
      });
    });
  });
});
