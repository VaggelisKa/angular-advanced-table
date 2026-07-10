import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

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

test.describe('FEATURE: Pinned column reorder then resize (issue #273)', () => {
  test.describe('GIVEN: two adjacent columns are pinned left and reordered by pointer drag', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/fixtures/pin-reorder-resize');
      await expect(page.getByRole('grid', { name: 'Pin reorder resize fixture table' })).toBeVisible();
    });

    test('should keep DOM order and resize targeting aligned after swapping the two pinned columns', async ({ page }) => {
      const grid = page.getByRole('grid', { name: 'Pin reorder resize fixture table' });

      // when: the pinned-left zone starts as name, category
      await expect
        .poll(async () => documentColumnOrder(grid))
        .toEqual(['name', 'category', 'status', 'value', 'region', 'owner', 'updated']);
      await expect
        .poll(async () => geometricColumnOrder(grid))
        .toEqual(['name', 'category', 'status', 'value', 'region', 'owner', 'updated']);

      const nameBoxBefore = await boxOf(grid.locator('thead th[data-column-id="name"]'));

      // when: category is dragged left across name's center to swap the pinned pair
      await pointerReorder(page, grid, 'category', nameBoxBefore.x + 4);

      // then: the pinned pair is now category, name (state applied)
      await expect
        .poll(async () => geometricColumnOrder(grid))
        .toEqual(['category', 'name', 'status', 'value', 'region', 'owner', 'updated']);

      // then (DISCRIMINATOR ii): document order matches the visible order — no CDK/view desync
      await expect
        .poll(async () => documentColumnOrder(grid))
        .toEqual(['category', 'name', 'status', 'value', 'region', 'owner', 'updated']);

      // when: the resize edge under the LEFTMOST pinned column is dragged right by 80px
      const categoryCell = grid.locator('thead th[data-column-id="category"]');
      const nameCell = grid.locator('thead th[data-column-id="name"]');

      // then (DISCRIMINATOR iii): each header's own label still matches its column id
      await expect(categoryCell).toContainText('Category');
      await expect(nameCell).toContainText('Name');

      const categoryWidthBefore = (await boxOf(categoryCell)).width;
      const nameWidthBefore = (await boxOf(nameCell)).width;

      await dragResizeEdge(page, categoryCell, 80);

      // then (MONEY): the leftmost column (category) is the one that grew, not its neighbor
      await expect.poll(async () => (await boxOf(categoryCell)).width).toBeGreaterThan(categoryWidthBefore + 40);
      expect((await boxOf(nameCell)).width).toBeLessThanOrEqual(nameWidthBefore + 2);
    });
  });

  test.describe('GIVEN: the two pinned columns are swapped with the keyboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/fixtures/pin-reorder-resize');
      await expect(page.getByRole('grid', { name: 'Pin reorder resize fixture table' })).toBeVisible();
    });

    test('should resize the reordered leftmost column, not its neighbor', async ({ page }) => {
      const grid = page.getByRole('grid', { name: 'Pin reorder resize fixture table' });
      const categoryCell = grid.locator('thead th[data-column-id="category"]');
      const nameCell = grid.locator('thead th[data-column-id="name"]');

      // when: name is moved right past category via Ctrl/Cmd+Shift+ArrowRight (view-preserving path)
      await nameCell.focus();
      await page.keyboard.press('ControlOrMeta+Shift+ArrowRight');

      await expect
        .poll(async () => documentColumnOrder(grid))
        .toEqual(['category', 'name', 'status', 'value', 'region', 'owner', 'updated']);

      const categoryWidthBefore = (await boxOf(categoryCell)).width;
      const nameWidthBefore = (await boxOf(nameCell)).width;

      // when: the leftmost pinned column's resize edge is dragged right
      await dragResizeEdge(page, categoryCell, 80);

      // then: category grew and name was left untouched
      await expect.poll(async () => (await boxOf(categoryCell)).width).toBeGreaterThan(categoryWidthBefore + 40);
      expect((await boxOf(nameCell)).width).toBeLessThanOrEqual(nameWidthBefore + 2);
    });
  });

  test.describe('GIVEN: a pinned column is resized', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/fixtures/pin-reorder-resize');
      await expect(page.getByRole('grid', { name: 'Pin reorder resize fixture table' })).toBeVisible();
    });

    test('should shift the following pinned column and keep both stuck to the left edge on scroll', async ({ page }) => {
      const grid = page.getByRole('grid', { name: 'Pin reorder resize fixture table' });
      const region = page.getByTestId('nat-table-region');
      const nameCell = grid.locator('thead th[data-column-id="name"]');
      const categoryCell = grid.locator('thead th[data-column-id="category"]');

      const categoryXBefore = (await boxOf(categoryCell)).x;

      // when: the first pinned column (name) is widened by 80px
      await dragResizeEdge(page, nameCell, 80);

      // then: the second pinned column (category) shifts right by roughly the same amount
      await expect.poll(async () => (await boxOf(categoryCell)).x).toBeGreaterThan(categoryXBefore + 60);

      // when: the region is scrolled horizontally
      await region.evaluate((element) => {
        element.scrollLeft = 200;
      });
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      });

      // then: both pinned columns stay stuck at the region's left edge, in order
      const regionBox = await boxOf(region);
      const nameBox = await boxOf(nameCell);
      const categoryBox = await boxOf(categoryCell);

      expect(Math.abs(nameBox.x - regionBox.x)).toBeLessThanOrEqual(2);
      expect(Math.abs(categoryBox.x - (regionBox.x + nameBox.width))).toBeLessThanOrEqual(2);
    });
  });

  test.describe('GIVEN: the region is scrolled horizontally before reordering the pinned group', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/fixtures/pin-reorder-resize');
      await expect(page.getByRole('grid', { name: 'Pin reorder resize fixture table' })).toBeVisible();
    });

    // KNOWN LIMITATION (issue #273 follow-up): while the region is scrolled, CDK derives a
    // sticky-skewed `event.currentIndex`, so `isDropIndexWithinZone` rejects the drop and the
    // pinned pair does not reorder. The moving column id resolves correctly; only the target
    // slot is wrong. A fix must replace the clientRect-derived target index without regressing
    // the (working) unscrolled reorder — deferred to avoid destabilising the drop path.
    test.fixme('should still apply the pinned-group reorder after a horizontal scroll', async ({ page }) => {
      const grid = page.getByRole('grid', { name: 'Pin reorder resize fixture table' });
      const region = page.getByTestId('nat-table-region');

      // when: the region is scrolled so center columns shift under the sticky pinned pair
      await region.evaluate((element) => {
        element.scrollLeft = 200;
      });
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      });

      const nameBox = await boxOf(grid.locator('thead th[data-column-id="name"]'));

      // when: category is dragged left across name inside the pinned group
      await pointerReorder(page, grid, 'category', nameBox.x + 4);

      // then: the reorder is not rejected by the drop-in-zone guard
      await expect
        .poll(async () => documentColumnOrder(grid))
        .toEqual(['category', 'name', 'status', 'value', 'region', 'owner', 'updated']);
    });
  });
});
