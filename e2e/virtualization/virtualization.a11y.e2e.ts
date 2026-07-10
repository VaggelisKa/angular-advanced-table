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

const ariaRowIndexes = async (rows: Locator): Promise<number[]> =>
  rows.evaluateAll((elements) => elements.map((element) => Number(element.getAttribute('aria-rowindex'))));

const expectAbsoluteRowMetadata = async (rows: Locator): Promise<void> => {
  const metadata = await rows.evaluateAll((elements) =>
    elements.map((element) => ({
      ariaRowIndex: Number(element.getAttribute('aria-rowindex')),
      logicalIndex: Number(element.getAttribute('data-row-index'))
    }))
  );
  const indexes = metadata.map(({ ariaRowIndex }) => ariaRowIndex);

  expect(metadata.length).toBeGreaterThan(0);
  expect(metadata.every(({ ariaRowIndex, logicalIndex }) => ariaRowIndex === logicalIndex + 2)).toBe(true);
  expect(indexes.every((index, position) => position === 0 || index > indexes[position - 1])).toBe(true);
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
          await expect(table).toHaveAttribute('aria-rowcount', '10001');
          await expect(table.locator('thead tr[aria-rowindex="1"]')).toHaveCount(1);
          await expect(rows.and(table.locator('[aria-rowindex="2"]'))).toHaveCount(1);
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

        await test.step('THEN: the end window exposes row ten thousand as grid row ten thousand and one and passes axe', async () => {
          await scrollTo(region, 'end');

          await expect(rows.and(table.locator('[aria-rowindex="10001"]'))).toHaveCount(1);
          await expectAbsoluteRowMetadata(rows);
          await expectNoAxeViolations(page, PREVIEW_SELECTOR);
        });
      });
    });
  });
});
