import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

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
      test('THEN: it mounts and focuses the first logical row instead of the first mounted row', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const target = table.locator('tbody tr[data-row-index="0"] [data-column-id="customer"]');

        await test.step('THEN: a mid-list window leaves the first logical row unmounted', async () => {
          await scrollToRow(region, 5000);

          await expect(table.locator('tbody tr.data-row').first()).toHaveAttribute('aria-rowindex', /49\d\d/);
          await expect(table.locator('tbody tr[data-row-index="0"]')).toHaveCount(0);
        });

        await test.step('THEN: grid-home focus lands on logical row one, mounted and fully visible', async () => {
          await tableHost.getByTestId('nat-table-header-customer').focus();
          await page.keyboard.press('ControlOrMeta+Home');

          await expect(target).toBeFocused();
          await expect.poll(async () => isFullyContained(region, target)).toBe(true);
        });
      });
    });
  });
});
