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

const scrollToOffset = async (region: Locator, offset: number): Promise<void> => {
  await region.evaluate((element, target) => {
    element.scrollTop = target;
    element.dispatchEvent(new Event('scroll'));
  }, offset);
};

const scrollByOffset = async (region: Locator, delta: number): Promise<void> => {
  await region.evaluate((element, target) => {
    element.scrollTop += target;
    element.dispatchEvent(new Event('scroll'));
  }, delta);
};

const settleAnimationFrames = async (region: Locator): Promise<void> => {
  await region.evaluate(
    async () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
};

const ariaRowIndexes = async (rows: Locator): Promise<number[]> =>
  rows.evaluateAll((elements) => elements.map((element) => Number(element.getAttribute('aria-rowindex'))));

const dataRowIndexes = async (rows: Locator): Promise<number[]> =>
  rows.evaluateAll((elements) => elements.map((element) => Number(element.getAttribute('data-row-index'))));

const renderedWidth = async (locator: Locator): Promise<number> =>
  locator.evaluate((element) => element.getBoundingClientRect().width);

test.describe('FEATURE: Row virtualization', () => {
  test.describe('GIVEN: the fetch-on-approach virtualization example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtualization');
      await loadDocsExamplePreview(page, 'virtualization-incremental-fetch', 'Fetch on approach');
    });

    test('THEN: it appends each fetched page without disturbing the reader', async ({ page }) => {
      const demo = page.getByTestId('virtualization-fetch-demo');
      const region = demo.getByTestId('virtualization-fetch-table').getByTestId('nat-table-region');
      const loaded = demo.getByTestId('fetch-loaded');
      const pages = demo.getByTestId('fetch-pages');
      let scrollTopAtFetch = 0;
      let mountedAtFetch: number[] = [];

      await test.step('THEN: it starts with one page and fetches nothing while the window is far from the end', async () => {
        await expect(loaded).toHaveText('100');
        await expect(pages).toHaveText('1');

        await scrollToOffset(region, 400);
        await settleAnimationFrames(region);

        await expect(pages).toHaveText('1');
      });

      await test.step('WHEN: the window reaches the lookahead THEN: it fetches exactly one more page', async () => {
        await scrollTo(region, 'end');
        await settleAnimationFrames(region);

        await expect(loaded).toHaveText('200');
        await expect(pages).toHaveText('2');

        scrollTopAtFetch = await region.evaluate((element) => element.scrollTop);
        mountedAtFetch = await dataRowIndexes(demo.getByTestId('nat-table-row'));
      });

      await test.step('THEN: the append leaves the scroll position and the mounted window in place', async () => {
        await settleAnimationFrames(region);

        expect(await region.evaluate((element) => element.scrollTop)).toBe(scrollTopAtFetch);
        expect(await dataRowIndexes(demo.getByTestId('nat-table-row'))).toStrictEqual(mountedAtFetch);
        // The unmoved window emitted nothing, so the handler did not re-enter.
        await expect(pages).toHaveText('2');
      });

      await test.step('WHEN: the reader keeps scrolling THEN: it fetches the following page and moves forward', async () => {
        await scrollTo(region, 'end');
        await settleAnimationFrames(region);

        await expect(loaded).toHaveText('300');
        await expect(pages).toHaveText('3');
        expect(await region.evaluate((element) => element.scrollTop)).toBeGreaterThan(scrollTopAtFetch);
      });
    });
  });

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
          // Header row + four region sub-header rows + ten thousand data rows.
          await expect(table).toHaveAttribute('aria-rowcount', '10005');
          await expect(table.getByTestId('nat-table-sub-header-row')).toHaveCount(1);
          await expect(rows.and(table.locator('[aria-rowindex="3"]'))).toHaveCount(1);
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

          await expect
            .poll(async () => {
              const indexes = await ariaRowIndexes(rows);

              return indexes.length > 0 && Math.min(...indexes) > 4000 && Math.max(...indexes) < 6000;
            })
            .toBe(true);
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(2);

          retainedRowIndex = Math.min(...(await dataRowIndexes(rows)));
          const retainedCell = table.locator(`tbody tr[data-row-index="${retainedRowIndex}"] [data-column-id="region"]`);

          await retainedCell.focus();
          await expect(retainedCell).toBeFocused();
        });

        await test.step('THEN: the end position mounts the final row while retaining the focused middle row', async () => {
          await scrollTo(region, 'end');

          await expect(rows.and(table.locator('[aria-rowindex="10005"]'))).toHaveCount(1);
          await expect(table.locator(`tbody tr[data-row-index="${retainedRowIndex}"] [data-column-id="region"]`)).toBeFocused();
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(2);
        });

        await test.step('THEN: sorting resets to the first logical window without changing the renderer', async () => {
          // Release the roving-tabstop retention first: while focus stays
          // inside the table, the engine deliberately keeps that row mounted.
          await page.getByRole('link').first().focus();
          await expect(table.locator(`tbody tr[data-row-index="${retainedRowIndex}"]`)).toHaveCount(0);

          await table.getByRole('button', { name: 'Sort by Customer' }).click();

          await expect(customerHeader).toHaveAttribute('aria-sort', 'ascending');
          await expect.poll(async () => region.evaluate((element) => element.scrollTop)).toBe(0);
          await expect(rows.and(table.locator('[aria-rowindex="3"]'))).toHaveCount(1);
          await expect.poll(async () => rows.count()).toBeLessThan(40);
          await expect(spacers).toHaveCount(1);
        });
      });
    });

    test.describe('WHEN: the region scrolls horizontally', () => {
      test('THEN: it keeps the sub-header label pinned to the visible left edge', async ({ page }) => {
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const region = tableHost.getByTestId('nat-table-region');
        const label = tableHost.getByTestId('nat-table-sub-header-row').locator('.sub-header-content').first();

        await expect(label).toBeVisible();

        const initialLeft = (await label.boundingBox())?.x ?? Number.NaN;

        await region.evaluate((element) => {
          element.scrollLeft = element.scrollWidth - element.clientWidth;
          element.dispatchEvent(new Event('scroll'));
        });

        await expect.poll(async () => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(200);
        // The sticky state-row pattern clamps the label to the region's left
        // edge, and the label carries its own padding, so it must not move.
        await expect.poll(async () => Math.abs(((await label.boundingBox())?.x ?? Number.NaN) - initialLeft)).toBeLessThanOrEqual(2);
      });
    });

    test.describe('WHEN: the region scrolls in sub-overscan and multi-row steps', () => {
      test('THEN: it keeps the mounted window through small scrolls and remounts in overscan batches', async ({ page }) => {
        // The demo mounts rowHeight 44 with the default overscan of 5, so the
        // engine keeps the window while at least floor(5 / 2) = 2 overscan rows
        // remain beyond the scrolled-toward edge and remounts in batches.
        const rowHeight = 44;
        const demo = page.getByTestId('virtualization-demo');
        const tableHost = demo.getByTestId('virtualization-table');
        const table = tableHost.getByRole('grid', { name: 'Ten thousand virtualized orders' });
        const region = tableHost.getByTestId('nat-table-region');
        const rows = table.getByTestId('nat-table-row');
        let settledIndexes: number[] = [];

        await test.step('THEN: a mid-list offset mounts the visible rows plus overscan on both sides', async () => {
          await scrollToOffset(region, 5000 * rowHeight);

          await expect
            .poll(async () => {
              const indexes = await ariaRowIndexes(rows);

              return indexes.length > 0 && Math.min(...indexes) > 4900 && Math.max(...indexes) < 5100;
            })
            .toBe(true);

          settledIndexes = await ariaRowIndexes(rows);

          const viewportHeight = await region.evaluate((element) => element.clientHeight);
          const upperBound = Math.ceil(viewportHeight / rowHeight) + 2 * 5 + 2;

          expect(settledIndexes.length).toBeLessThanOrEqual(upperBound);
        });

        await test.step('THEN: a one-row scroll keeps the mounted window unchanged', async () => {
          await scrollByOffset(region, rowHeight);
          await settleAnimationFrames(region);

          expect(await ariaRowIndexes(rows)).toEqual(settledIndexes);
        });

        await test.step('THEN: crossing the retained overscan remounts the window in one batch', async () => {
          await scrollByOffset(region, 4 * rowHeight);

          await expect
            .poll(async () => {
              const indexes = await ariaRowIndexes(rows);

              return indexes.length > 0 ? Math.min(...indexes) : 0;
            })
            .toBeGreaterThan(Math.min(...settledIndexes));
        });
      });
    });
  });
});
