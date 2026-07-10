import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

test.use({ viewport: { width: 640, height: 900 } });
/** Yields one animation frame, pacing synthetic input to the render loop. */
const nextFrame = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
};

/** Bounding box of `locator`, throwing if it is not laid out. */
const boxOf = async (locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> => {
  const box = await locator.boundingBox();

  if (!box) throw new Error('Locator has no bounding box.');

  return box;
};

/** Left-to-right visible order of the leaf header cells, by column id (single DOM pass). */
const geometricColumnOrder = async (grid: Locator): Promise<string[]> =>
  grid.locator('thead th[data-column-id]').evaluateAll((cells) =>
    cells
      .map((cell) => ({ id: cell.getAttribute('data-column-id') ?? '', x: cell.getBoundingClientRect().x }))
      .sort((left, right) => left.x - right.x)
      .map((entry) => entry.id)
  );

/** Document (source) order of the leaf header cells, by column id. */
const documentColumnOrder = async (grid: Locator): Promise<string[]> =>
  grid.locator('thead th[data-column-id]').evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-column-id') ?? ''));

/** Drags the header cell for `columnId` horizontally to `targetClientX` via a real pointer sequence. */
const pointerReorder = async (page: Page, grid: Locator, columnId: string, targetClientX: number): Promise<void> => {
  const source = grid.locator(`thead th[data-column-id="${columnId}"]`);
  const box = await boxOf(source);
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // A first small move triggers CDK's drag start; then interpolate to the target in
  // several frame-paced steps so CDK's sort predicate re-evaluates on each.
  await page.mouse.move(startX - 8, startY);
  await nextFrame(page);

  const steps = 8;

  for (let step = 1; step <= steps; step += 1) {
    await page.mouse.move(startX + ((targetClientX - startX) * step) / steps, startY, { steps: 3 });
    await nextFrame(page);
  }

  // Settle at the target before releasing so CDK commits the final slot.
  await page.mouse.move(targetClientX, startY, { steps: 3 });
  await nextFrame(page);
  await nextFrame(page);
  await page.mouse.up();
  await nextFrame(page);
};

/** Drags the resize edge that sits under the right border of `cell` by `deltaX` px, targeting whatever header owns that pixel. */
const dragResizeEdge = async (page: Page, cell: Locator, deltaX: number): Promise<void> => {
  const box = await boxOf(cell);
  const startX = box.x + box.width - 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Seed-then-drag pacing: the resize handler seeds column sizing on mousedown
  // and needs a frame for that reactive update to settle before it accumulates
  // a delta (mirrors the resizing spec's helper).
  await nextFrame(page);
  await nextFrame(page);
  await page.mouse.move(startX + deltaX / 2, startY);
  await nextFrame(page);
  await page.mouse.move(startX + deltaX, startY);
  await nextFrame(page);
  await page.mouse.up();
  await nextFrame(page);
};

/** Configures the live Table Builder preview through its public controls. */
const configureBuilder = async (page: Page): Promise<Locator> => {
  await page.goto('/examples/builder');

  const grid = page.getByRole('grid', { name: 'Custom configured table preview' });

  await expect(grid).toBeVisible();
  await page.getByTestId('table-builder-feature-withColumnResizing').click();

  const sizingMode = page.getByRole('group', { name: 'Column sizing mode' });
  const fixedSizing = sizingMode.getByRole('button', { name: 'Fixed' });

  await fixedSizing.click();
  await expect(fixedSizing).toHaveAttribute('aria-pressed', 'true');

  await grid.getByTestId('nat-table-header-actions-menu-category').click();
  await page.getByTestId('nat-table-header-pin-left-category').click();
  await expect.poll(async () => documentColumnOrder(grid)).toEqual(['name', 'category', 'status', 'value']);

  return grid;
};

test.describe('FEATURE: Pinned column reorder then resize (issue #273)', () => {
  test.describe('GIVEN: two adjacent builder columns are pinned left', () => {
    test.describe('WHEN: they are reordered by pointer drag and the new leftmost column is resized', () => {
      test('THEN: it keeps DOM order and resize targeting aligned after swapping the pinned columns', async ({ page }) => {
        const grid = await configureBuilder(page);
        const categoryCell = grid.locator('thead th[data-column-id="category"]');
        const nameCell = grid.locator('thead th[data-column-id="name"]');

        await test.step('THEN: the pinned columns render in their default left order', async () => {
          await expect.poll(async () => geometricColumnOrder(grid)).toEqual(['name', 'category', 'status', 'value']);
        });

        await test.step('THEN: dragging category left of name swaps both DOM and visual order', async () => {
          const nameBoxBefore = await boxOf(nameCell);

          await pointerReorder(page, grid, 'category', nameBoxBefore.x + 4);

          await expect.poll(async () => geometricColumnOrder(grid)).toEqual(['category', 'name', 'status', 'value']);
          await expect.poll(async () => documentColumnOrder(grid)).toEqual(['category', 'name', 'status', 'value']);
        });

        await test.step('THEN: resizing category grows it without resizing name', async () => {
          const categoryWidthBefore = (await boxOf(categoryCell)).width;
          const nameWidthBefore = (await boxOf(nameCell)).width;

          await dragResizeEdge(page, categoryCell, 80);

          await expect.poll(async () => (await boxOf(categoryCell)).width).toBeGreaterThan(categoryWidthBefore + 40);
          expect((await boxOf(nameCell)).width).toBeLessThanOrEqual(nameWidthBefore + 2);
        });
      });
    });

    test.describe('WHEN: they are swapped with the keyboard and the new leftmost column is resized', () => {
      test('THEN: it resizes the reordered leftmost column instead of its neighbor', async ({ page }) => {
        const grid = await configureBuilder(page);
        const categoryCell = grid.locator('thead th[data-column-id="category"]');
        const nameCell = grid.locator('thead th[data-column-id="name"]');

        await test.step('THEN: the keyboard swap moves category ahead of name', async () => {
          await nameCell.focus();
          await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');

          await expect.poll(async () => documentColumnOrder(grid)).toEqual(['category', 'name', 'status', 'value']);
        });

        await test.step('THEN: resizing category grows it without resizing name', async () => {
          const categoryWidthBefore = (await boxOf(categoryCell)).width;
          const nameWidthBefore = (await boxOf(nameCell)).width;

          await dragResizeEdge(page, categoryCell, 80);

          await expect.poll(async () => (await boxOf(categoryCell)).width).toBeGreaterThan(categoryWidthBefore + 40);
          expect((await boxOf(nameCell)).width).toBeLessThanOrEqual(nameWidthBefore + 2);
        });
      });
    });

    test.describe('WHEN: the leftmost pinned column is resized and the region is scrolled horizontally', () => {
      test('THEN: it shifts the following pinned column and keeps both stuck on horizontal scroll', async ({ page }) => {
        const grid = await configureBuilder(page);
        const region = page.getByTestId('nat-table-region');
        const nameCell = grid.locator('thead th[data-column-id="name"]');
        const categoryCell = grid.locator('thead th[data-column-id="category"]');

        await test.step('THEN: resizing name shifts category right and makes the region scrollable', async () => {
          const categoryXBefore = (await boxOf(categoryCell)).x;

          await dragResizeEdge(page, nameCell, 80);

          await expect.poll(async () => (await boxOf(categoryCell)).x).toBeGreaterThan(categoryXBefore + 60);
          await expect.poll(async () => region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeGreaterThan(0);
        });

        await test.step('THEN: both pinned columns stay stuck after horizontal scroll', async () => {
          await region.evaluate((element) => {
            element.scrollLeft = Math.min(200, element.scrollWidth - element.clientWidth);
          });
          await nextFrame(page);
          const regionBox = await boxOf(region);
          const nameBox = await boxOf(nameCell);
          const categoryBox = await boxOf(categoryCell);

          expect(Math.abs(nameBox.x - regionBox.x)).toBeLessThanOrEqual(2);
          expect(Math.abs(categoryBox.x - (regionBox.x + nameBox.width))).toBeLessThanOrEqual(2);
        });
      });
    });

    test.describe('WHEN: the pinned group is reordered while the region is scrolled horizontally (issue #288)', () => {
      test('THEN: it swaps the pinned columns despite sticky rects overlapping the scrolled center columns', async ({ page }) => {
        const grid = await configureBuilder(page);
        const region = page.getByTestId('nat-table-region');
        const nameCell = grid.locator('thead th[data-column-id="name"]');

        // A narrow viewport overflows the four columns so the center pair can be
        // scrolled deep under the sticky pinned pair — the layout that skews
        // CDK's clientRect-derived drop index (issue #288).
        await page.setViewportSize({ width: 360, height: 900 });
        await nextFrame(page);

        await test.step('THEN: scrolling slides the center columns under the pinned pair', async () => {
          await expect.poll(async () => region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeGreaterThan(150);
          await region.evaluate((element) => {
            element.scrollLeft = 200;
          });
          await nextFrame(page);
          await expect.poll(async () => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(150);
        });

        await test.step('THEN: dragging category left of name swaps the pinned order', async () => {
          const nameBoxBefore = await boxOf(nameCell);

          await pointerReorder(page, grid, 'category', nameBoxBefore.x + 4);

          // Document order is the reorder invariant here; geometric (visual-x)
          // order is not asserted because while scrolled the sticky pinned pair
          // visually overlaps the scrolled-under center columns.
          await expect.poll(async () => documentColumnOrder(grid)).toEqual(['category', 'name', 'status', 'value']);
        });
      });
    });
  });
});
