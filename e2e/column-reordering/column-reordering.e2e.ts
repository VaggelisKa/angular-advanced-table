import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

type HeaderFrame = { order: string; shifted: boolean; dragging: boolean };

const HEADER_FRAME_COUNT = 120;

/** Bounding box of `locator`, throwing if it is not laid out. */
const boxOf = async (locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> => {
  const box = await locator.boundingBox();

  if (!box) throw new Error('Locator has no bounding box.');

  return box;
};

/**
 * Records, once per animation frame, the leaf header order, whether any header
 * is still offset by a transform, and whether a drag preview is showing.
 */
const recordHeaderFrames = async (table: Locator): Promise<void> =>
  table.evaluate((element, frameCount) => {
    const frames: HeaderFrame[] = [];
    const record = (): void => {
      const headers = Array.from(element.querySelectorAll<HTMLElement>('thead th[data-column-id]:not(.cdk-drag-preview)'));

      frames.push({
        order: headers.map((header) => header.dataset['columnId']).join(','),
        shifted: headers.some((header) => getComputedStyle(header).transform !== 'none'),
        dragging: element.querySelector('.cdk-drag-preview') !== null
      });

      if (frames.length < frameCount) requestAnimationFrame(record);
    };

    Object.assign(window, { natHeaderFrames: frames });
    requestAnimationFrame(record);
  }, HEADER_FRAME_COUNT);

const readHeaderFrames = async (page: Page): Promise<HeaderFrame[]> =>
  page.evaluate(() => (window as unknown as { natHeaderFrames: HeaderFrame[] }).natHeaderFrames);

test.describe('FEATURE: Column reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
    await loadDocsExamplePreview(page, 'column-reordering', 'Column reordering');
  });

  const headerColumnIds = async (page: Page): Promise<string[]> =>
    page
      .getByTestId('reordering-order-item')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-column-id')).filter((id): id is string => id !== null));

  test.describe('GIVEN: the column reordering example is loaded', () => {
    test.describe('WHEN: Mod+Shift+ArrowRight is pressed on a focused column header', () => {
      test('THEN: it moves the column one position right, keeps focus, and announces the move', async ({ page }) => {
        const reorderingTable = page.getByTestId('reordering-demo-table');
        const categoryHeader = reorderingTable.getByTestId('nat-table-header-category');

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

          await categoryHeader.focus();
          await expect(categoryHeader).toBeFocused();

          await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');
        });

        await test.step('THEN: category moves one position right, keeps focus, and is announced', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect(categoryHeader).toBeFocused();
          await expect(reorderingTable.getByTestId('nat-table-live-region')).toContainText(
            'Category column moved to position 3 of 4, unpinned.'
          );
        });
      });
    });

    test.describe('WHEN: Mod+Shift+ArrowRight moves a focused header right out of view in an overflow region', () => {
      test('THEN: it scrolls the column into view, moves it right, and keeps focus', async ({ page }) => {
        await page.setViewportSize({ width: 420, height: 760 });
        await page.addStyleTag({
          content: `
        [data-testid^='nat-table-header-'],
        tbody th[data-column-id],
        tbody td[data-column-id] {
          min-width: 220px !important;
          width: 220px !important;
        }
      `
        });

        const reorderingTable = page.getByTestId('reordering-demo-table');
        const tableRegion = reorderingTable.getByTestId('nat-table-region');
        const categoryHeader = reorderingTable.getByTestId('nat-table-header-category');
        let scrollLeftBefore = 0;

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);
        });

        await test.step('THEN: the table region is horizontally scrollable', async () => {
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);

          await categoryHeader.focus();
          await expect(categoryHeader).toBeFocused();

          await tableRegion.evaluate((element) => {
            element.scrollLeft = 0;
          });
          scrollLeftBefore = await tableRegion.evaluate((element) => element.scrollLeft);

          await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');
        });

        await test.step('THEN: category moves right, the region scrolls it into view, and focus is kept', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollLeft)).toBeGreaterThan(scrollLeftBefore);
          await expect(categoryHeader).toBeFocused();
        });
      });
    });

    test.describe('WHEN: the header actions menu Move Right is clicked', () => {
      test('THEN: it moves the column one position right and announces the move', async ({ page }) => {
        await test.step('THEN: the demo renders with the default column order', async () => {
          const reorderingTable = page.getByTestId('reordering-demo-table');

          await expect(page.getByRole('heading', { name: 'Column reordering' })).toBeVisible();
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);

          await reorderingTable.getByTestId('nat-table-header-actions-menu-category').click();
          await expect(reorderingTable.getByTestId('nat-table-header-pin-left-category')).toHaveCount(0);
          await expect(reorderingTable.getByTestId('nat-table-header-pin-right-category')).toHaveCount(0);
          await reorderingTable.getByTestId('nat-table-header-move-right-category').click();
        });

        await test.step('THEN: category moves one position right and the move is announced', async () => {
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'status', 'category', 'value']);
          await expect(page.getByTestId('reordering-demo-table').getByTestId('nat-table-live-region')).toContainText(
            'Category column moved to position 3 of 4, unpinned.'
          );
        });
      });
    });

    test.describe('WHEN: a column header is dragged past its neighbor and dropped', () => {
      test('THEN: it settles the headers in their new order on the first frame after the drop', async ({ page }) => {
        const reorderingTable = page.getByTestId('reordering-demo-table');

        await test.step('THEN: the demo renders with the default column order', async () => {
          await expect(reorderingTable).toBeVisible();
          await expect.poll(async () => headerColumnIds(page)).toEqual(['name', 'category', 'status', 'value']);
        });

        await test.step('THEN: no header shows the old order or slides after the drop', async () => {
          const from = await boxOf(reorderingTable.getByTestId('nat-table-header-category'));
          const to = await boxOf(reorderingTable.getByTestId('nat-table-header-status'));
          const y = from.y + from.height / 2;

          await recordHeaderFrames(reorderingTable);
          await page.mouse.move(from.x + from.width / 2, y);
          await page.mouse.down();

          for (let step = 1; step <= 20; step += 1) {
            await page.mouse.move(from.x + from.width / 2 + (step * (to.x + to.width * 0.8 - from.x - from.width / 2)) / 20, y);
          }

          await page.mouse.up();
          await expect.poll(async () => (await readHeaderFrames(page)).length).toBe(HEADER_FRAME_COUNT);

          const frames = await readHeaderFrames(page);
          const settled = frames.slice(frames.findLastIndex((frame) => frame.dragging) + 1);

          expect(settled.length).toBeGreaterThan(0);
          expect(settled).toEqual(settled.map(() => ({ order: 'name,status,category,value', shifted: false, dragging: false })));
        });
      });
    });
  });
});
