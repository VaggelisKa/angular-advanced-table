import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

const scrollTo = async (region: Locator, position: 'middle' | 'end'): Promise<void> => {
  await region.evaluate((element, target) => {
    const maximumScrollTop = element.scrollHeight - element.clientHeight;

    element.scrollTop = target === 'middle' ? maximumScrollTop / 2 : maximumScrollTop;
    element.dispatchEvent(new Event('scroll'));
  }, position);
};

const ariaRowIndexes = async (rows: Locator): Promise<number[]> =>
  rows.evaluateAll((elements) => elements.map((element) => Number(element.getAttribute('aria-rowindex'))));

const renderedWidth = async (locator: Locator): Promise<number> =>
  locator.evaluate((element) => element.getBoundingClientRect().width);

test.describe('FEATURE: Row virtualization', () => {
  test.describe('GIVEN: the ten-thousand-row virtualization example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtualization');
      await loadDocsExamplePreview(page, 'virtualization', 'Ten thousand composable rows');
    });

    test.describe('WHEN: the table region scrolls from the first row through the middle to the final row', () => {
      test('THEN: it keeps a bounded DOM window aligned with the logical scroll position', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const rows = table.getByTestId('nat-table-row');
        const spacers = table.getByTestId('nat-table-virtual-spacer');
        const customerHeader = tableHost.getByTestId('nat-table-header-customer');
        const ownerHeader = tableHost.getByTestId('nat-table-header-owner');
        let retainedRowIndex = 0;

        await test.step('THEN: the initial window mounts only the rows near the start', async () => {
          await expect(table).toHaveAttribute('aria-rowcount', '10001');
          await expect(rows.and(table.locator('[aria-rowindex="2"]'))).toHaveCount(1);
          await expect.poll(async () => rows.count()).toBeGreaterThan(0);
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(1);
          await expect(table).toHaveClass(/has-sticky-header/);
          await expect(table).toHaveClass(/is-fixed-layout/);
          await expect(table).toHaveClass(/is-virtualized/);
          await expect.poll(async () => customerHeader.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
          await expect
            .poll(async () =>
              table
                .locator('tbody tr[data-row-index="0"]')
                .locator('[data-column-id="total"]')
                .evaluate((element) => getComputedStyle(element).position)
            )
            .toBe('sticky');
        });

        await test.step('THEN: resizing and reordering remain composable with the mounted row window', async () => {
          const widthBeforeResize = await renderedWidth(ownerHeader);

          await ownerHeader.focus();
          await page.keyboard.press('Alt+ArrowRight');
          await expect.poll(async () => renderedWidth(ownerHeader)).toBeGreaterThan(widthBeforeResize);

          await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');
          await expect
            .poll(async () =>
              table
                .locator('thead [data-column-id]')
                .evaluateAll((headers) => headers.map((header) => header.getAttribute('data-column-id')))
            )
            .toEqual(['customer', 'channel', 'owner', 'region', 'status', 'items', 'updatedAt', 'total']);
          await expect(ownerHeader).toBeFocused();
        });

        await test.step('THEN: the middle scroll position replaces the mounted rows while preserving the DOM bound', async () => {
          await scrollTo(region, 'middle');

          await expect.poll(async () => Math.min(...(await ariaRowIndexes(rows)))).toBeGreaterThan(4000);
          await expect.poll(async () => Math.max(...(await ariaRowIndexes(rows)))).toBeLessThan(6000);
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(2);

          retainedRowIndex = Math.min(...(await ariaRowIndexes(rows))) - 2;
          const retainedCell = table.locator(`tbody tr[data-row-index="${retainedRowIndex}"] [data-column-id="region"]`);

          await retainedCell.focus();
          await expect(retainedCell).toBeFocused();
        });

        await test.step('THEN: the end position mounts the final row while retaining the focused middle row', async () => {
          await scrollTo(region, 'end');

          await expect(rows.and(table.locator('[aria-rowindex="10001"]'))).toHaveCount(1);
          await expect(table.locator(`tbody tr[data-row-index="${retainedRowIndex}"] [data-column-id="region"]`)).toBeFocused();
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(2);
        });

        await test.step('THEN: sorting resets to the first logical window without changing the renderer', async () => {
          await table.getByRole('button', { name: 'Sort by Customer' }).click();

          await expect(customerHeader).toHaveAttribute('aria-sort', 'ascending');
          await expect.poll(async () => region.evaluate((element) => element.scrollTop)).toBe(0);
          await expect(rows.and(table.locator('[aria-rowindex="2"]'))).toHaveCount(1);
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(1);
        });
      });
    });
  });
});
