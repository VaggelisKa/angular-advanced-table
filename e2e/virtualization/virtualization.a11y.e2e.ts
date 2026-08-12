import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { constrainPinnedTable, expectPinnedCellAbove, expectPinnedSurfaceComposited } from '../support/pinned-cell-layering';

const PREVIEW_SELECTOR = '[data-testid="docs-example-virtualization-preview-panel"]';

const scrollTo = async (region: Locator, position: 'middle' | 'end'): Promise<void> => {
  await region.evaluate((element, target) => {
    const maximumScrollTop = element.scrollHeight - element.clientHeight;

    element.scrollTop = target === 'middle' ? maximumScrollTop / 2 : maximumScrollTop;
    element.dispatchEvent(new Event('scroll'));
  }, position);
};

const scrollToRow = async (region: Locator, rowIndex: number): Promise<void> => {
  await region.evaluate((element, target) => {
    element.scrollTop = target * 44;
    element.dispatchEvent(new Event('scroll'));
  }, rowIndex);
};

const ariaRowIndexes = async (rows: Locator): Promise<number[]> =>
  rows.evaluateAll((elements) => elements.map((element) => Number(element.getAttribute('aria-rowindex'))));

// The demo groups its ten thousand rows by region: four alphabetical groups of
// exactly 2,500 rows, so the sub-header rows above logical row `i` number
// `floor(i / 2500) + 1` and shift the absolute ARIA position accordingly.
const REGION_GROUP_SIZE = 2500;

const expectAbsoluteRowMetadata = async (rows: Locator): Promise<void> => {
  const metadata = await rows.evaluateAll((elements) =>
    elements.map((element) => ({
      ariaRowIndex: Number(element.getAttribute('aria-rowindex')),
      logicalIndex: Number(element.getAttribute('data-row-index'))
    }))
  );
  const indexes = metadata.map(({ ariaRowIndex }) => ariaRowIndex);

  expect(metadata.length).toBeGreaterThan(0);
  expect(
    metadata.every(
      ({ ariaRowIndex, logicalIndex }) => ariaRowIndex === logicalIndex + 2 + Math.floor(logicalIndex / REGION_GROUP_SIZE) + 1
    )
  ).toBe(true);
  expect(indexes.every((index, position) => position === 0 || index > indexes[position - 1])).toBe(true);
};

const isFullyContained = async (container: Locator, target: Locator): Promise<boolean> => {
  const containerBox = await container.boundingBox();
  const targetBox = await target.boundingBox();

  if (!containerBox || !targetBox) {
    return false;
  }

  return [targetBox.x >= containerBox.x, targetBox.x + targetBox.width <= containerBox.x + containerBox.width].every(Boolean);
};

test.describe('FEATURE: Row virtualization accessibility', () => {
  test.describe('GIVEN: the ten-thousand-row virtualization example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtualization');
      await loadDocsExamplePreview(page, 'virtualization', 'Ten thousand composable rows');
    });

    test.describe('WHEN: accessibility metadata and rules are checked at the top, middle, and end', () => {
      test('THEN: it exposes the complete logical grid without WCAG A/AA violations', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const rows = table.getByTestId('nat-table-row');
        const spacers = table.getByTestId('nat-table-virtual-spacer');

        await test.step('THEN: the top window exposes total and absolute row metadata and passes axe', async () => {
          // Header row + four region sub-header rows + ten thousand data rows.
          await expect(table).toHaveAttribute('aria-rowcount', '10005');
          await expect(table.locator('thead tr[aria-rowindex="1"]')).toHaveCount(1);
          await expect(table.getByTestId('nat-table-sub-header-row').and(table.locator('[aria-rowindex="2"]'))).toHaveCount(1);
          await expect(rows.and(table.locator('[aria-rowindex="3"]'))).toHaveCount(1);
          await expect(spacers).toHaveAttribute('aria-hidden', 'true');
          await expectAbsoluteRowMetadata(rows);
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });

        await test.step('THEN: the middle window keeps absolute monotonic indices and passes axe', async () => {
          await scrollTo(region, 'middle');

          await expect.poll(async () => (await ariaRowIndexes(rows))[0]).toBeGreaterThan(4000);
          await expectAbsoluteRowMetadata(rows);
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });

        await test.step('THEN: the end window exposes row ten thousand as the final grid row and passes axe', async () => {
          await scrollTo(region, 'end');

          await expect(rows.and(table.locator('[aria-rowindex="10005"]'))).toHaveCount(1);
          await expectAbsoluteRowMetadata(rows);
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });
      });
    });

    test.describe('WHEN: Control or Command End targets an unpinned column outside the horizontal viewport', () => {
      test('THEN: it mounts and reveals the bottom-right grid cell with visible focus', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const target = table.locator('tbody tr[data-row-index="9999"] [data-column-id="total"]');

        await test.step('THEN: the final column is unpinned outside the initial horizontal viewport', async () => {
          await tableHost.getByTestId('nat-table-header-actions-menu-total').click();
          await page.getByTestId('nat-table-header-pin-right-total').click();
          await expect(table.locator('thead [data-column-id="total"]')).not.toHaveClass(/is-pinned-right/);
        });

        await test.step('THEN: grid-end focus is mounted and fully visible inside the unpinned viewport', async () => {
          await tableHost.getByTestId('nat-table-header-customer').focus();
          await page.keyboard.press('ControlOrMeta+End');

          await expect(target).toBeFocused();
          await expect.poll(async () => isFullyContained(region, target)).toBe(true);
        });
      });
    });

    test.describe('WHEN: Control or Command Home is pressed from a mid-list body cell', () => {
      test('THEN: it focuses the first grid cell in the always-mounted header row', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const target = tableHost.getByTestId('nat-table-header-customer');
        const source = table.locator('tbody tr[data-row-index="5000"] [data-column-id="region"]');

        await test.step('THEN: a mid-list window leaves the first logical row unmounted', async () => {
          await scrollToRow(region, 5000);

          await expect
            .poll(async () => table.locator('tbody tr.data-row').evaluateAll((rows) => rows.at(0)?.getAttribute('aria-rowindex')))
            .toMatch(/49\d\d/);
          await expect(source).toHaveCount(1);
          await expect(table.locator('tbody tr[data-row-index="0"]')).toHaveCount(0);
        });

        await test.step('THEN: grid-home focus lands on the first header cell', async () => {
          await source.focus();
          await page.keyboard.press('ControlOrMeta+Home');

          await expect(target).toBeFocused();
          await expect.poll(async () => region.evaluate((element) => element.scrollTop)).toBe(0);
        });
      });
    });

    test.describe('WHEN: the pointer moves between custom-virtualized rows', () => {
      test('THEN: center and pinned hover surfaces update in the same rendered frame', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const surface = demo.locator('nat-table-surface');
        const table = demo.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const firstRow = table.locator('tbody tr[data-row-index="0"]');
        const secondRow = table.locator('tbody tr[data-row-index="1"]');
        const hoverColor = 'rgb(199, 32, 64)';

        await surface.evaluate((element) => {
          const host = element as HTMLElement;

          host.style.setProperty('--nat-table-row-background-hover', 'rgb(199 32 64)');
          host.style.setProperty('--nat-table-row-background-hover-pinned', 'rgb(199 32 64)');
        });
        await firstRow.hover();
        await expect.poll(async () => firstRow.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(hoverColor);

        const firstFrameSnapshot = page.evaluate(
          async ({ currentRowSelector, previousRowSelector }) => {
            await new Promise<void>((resolve) => {
              document.addEventListener('pointermove', () => requestAnimationFrame(() => resolve()), { once: true });
            });

            const currentRow = document.querySelector<HTMLElement>(currentRowSelector);
            const previousRow = document.querySelector<HTMLElement>(previousRowSelector);

            if (!currentRow || !previousRow) {
              throw new Error('Both virtualized hover rows must remain mounted.');
            }

            const currentPinnedStyles = Array.from(currentRow.querySelectorAll<HTMLElement>('.is-pinned-left, .is-pinned-right')).map(
              (cell) => getComputedStyle(cell).backgroundImage
            );
            const previousPinnedStyles = Array.from(
              previousRow.querySelectorAll<HTMLElement>('.is-pinned-left, .is-pinned-right')
            ).map((cell) => getComputedStyle(cell).backgroundImage);

            return {
              currentCenter: getComputedStyle(currentRow).backgroundColor,
              currentPinnedStyles,
              previousCenter: getComputedStyle(previousRow).backgroundColor,
              previousPinnedStyles
            };
          },
          {
            currentRowSelector: '[data-testid="virtualization-table"] tbody tr[data-row-index="1"]',
            previousRowSelector: '[data-testid="virtualization-table"] tbody tr[data-row-index="0"]'
          }
        );

        await secondRow.hover();

        const snapshot = await firstFrameSnapshot;

        expect(snapshot.currentCenter).toBe(hoverColor);
        expect(snapshot.currentPinnedStyles).toHaveLength(2);
        expect(snapshot.currentPinnedStyles.every((backgroundImage) => backgroundImage.includes(hoverColor))).toBe(true);
        expect(snapshot.previousCenter).toBe('rgba(0, 0, 0, 0)');
        expect(snapshot.previousPinnedStyles.every((backgroundImage) => backgroundImage === 'none')).toBe(true);
      });
    });

    test.describe('WHEN: a focused custom-virtualized center cell scrolls beneath both pin zones', () => {
      test('THEN: the mounted pinned cells stay opaque and above the focused cell', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const surface = demo.locator('nat-table-surface');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const centerCell = table.locator('tbody tr[data-row-index="0"] [data-column-id="owner"]');
        const centerHeader = table.locator('thead [data-column-id="owner"]');

        await constrainPinnedTable(surface);
        await centerCell.focus();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowLeft');

        await test.step('THEN: the mounted left-pinned cell covers the focused center cell', async () => {
          await region.evaluate((element) => {
            element.scrollLeft = 80;
            element.dispatchEvent(new Event('scroll'));
          });

          await expect(centerCell).toBeFocused();
          await expectPinnedCellAbove(
            page,
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="customer"]',
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="owner"]'
          );
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="customer"]',
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="owner"]',
            '31, 111, 235'
          );
        });

        await test.step('THEN: the mounted right-pinned cell covers the focused center cell', async () => {
          await region.evaluate((element) => {
            element.scrollLeft = 0;
            element.dispatchEvent(new Event('scroll'));
          });

          await expect(centerCell).toBeFocused();
          await expectPinnedCellAbove(
            page,
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="total"]',
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="owner"]'
          );
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="total"]',
            '[data-testid="virtualization-table"] tbody tr[data-row-index="0"] [data-column-id="owner"]',
            '31, 111, 235'
          );
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });

        await test.step('THEN: sticky pinned headers cover the focused custom-virtualized center header', async () => {
          await centerHeader.focus();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowLeft');
          await region.evaluate((element) => {
            element.scrollLeft = 80;
            element.dispatchEvent(new Event('scroll'));
          });

          await expect(centerHeader).toBeFocused();
          await expectPinnedCellAbove(
            page,
            '[data-testid="virtualization-table"] thead [data-column-id="customer"]',
            '[data-testid="virtualization-table"] thead [data-column-id="owner"]'
          );

          await region.evaluate((element) => {
            element.scrollLeft = 0;
            element.dispatchEvent(new Event('scroll'));
          });
          await expectPinnedCellAbove(
            page,
            '[data-testid="virtualization-table"] thead [data-column-id="total"]',
            '[data-testid="virtualization-table"] thead [data-column-id="owner"]'
          );
        });
      });
    });
  });
});
