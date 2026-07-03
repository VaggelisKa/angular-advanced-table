import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

/** Rendered width of `locator`'s bounding box, in CSS pixels. */
const boundingWidth = async (locator: Locator): Promise<number> => {
  const box = await locator.boundingBox();

  if (!box) throw new Error('Locator has no bounding box.');

  return box.width;
};

/** Drags a resize handle horizontally by `deltaX` pixels via a real pointer sequence. */
const dragResizeHandle = async (page: Page, handle: Locator, deltaX: number): Promise<void> => {
  const box = await handle.boundingBox();

  if (!box) throw new Error('Resize handle has no bounding box.');

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY, { steps: 8 });
  await page.mouse.up();
};

test.describe('FEATURE: Column resizing', () => {
  test.describe('GIVEN: the column resizing example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/column-layout');
      await loadDocsExamplePreview(page, 'column-resizing', 'Column resizing');
    });

    test.describe('WHEN: the Name column resize handle is dragged with the pointer', () => {
      test('THEN: dragging right grows the header and dragging left shrinks it', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Column resizing' })).toBeVisible();

        const table = page.getByRole('grid', { name: 'Column resizing demo table' });
        const nameHeader = table.getByTestId('nat-table-header-name');
        const nameHandle = table.getByTestId('nat-table-resize-handle-name');

        let widthAfterGrow: number;

        await test.step('THEN: dragging the handle right grows the Name column', async () => {
          const widthBeforeGrow = await boundingWidth(nameHeader);

          await dragResizeHandle(page, nameHandle, 80);

          widthAfterGrow = await boundingWidth(nameHeader);
          expect(widthAfterGrow).toBeGreaterThan(widthBeforeGrow);
        });

        await test.step('THEN: dragging the handle left shrinks the Name column back down', async () => {
          await dragResizeHandle(page, nameHandle, -80);

          const widthAfterShrink = await boundingWidth(nameHeader);

          expect(widthAfterShrink).toBeLessThan(widthAfterGrow);
        });
      });
    });

    test.describe('WHEN: the Name column header is focused and resized with the keyboard', () => {
      test('THEN: Alt+Arrow steps the width and Alt+Home/End jump to the min/max bounds', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Column resizing demo table' });
        const nameHeader = table.getByTestId('nat-table-header-name');

        await nameHeader.focus();

        let widthAfterGrow: number;

        await test.step('THEN: Alt+ArrowRight grows the column by one step', async () => {
          const widthBefore = await boundingWidth(nameHeader);

          await page.keyboard.press('Alt+ArrowRight');

          // Keyboard resize applies via async change detection + layout, so poll the
          // rendered width rather than reading it once immediately after the press.
          await expect.poll(async () => boundingWidth(nameHeader)).toBeGreaterThan(widthBefore);
          widthAfterGrow = await boundingWidth(nameHeader);
        });

        await test.step('THEN: Alt+ArrowLeft shrinks the column back by one step', async () => {
          await page.keyboard.press('Alt+ArrowLeft');

          await expect.poll(async () => boundingWidth(nameHeader)).toBeLessThan(widthAfterGrow);
        });

        await test.step('THEN: Alt+End jumps to the maximum width', async () => {
          const widthBefore = await boundingWidth(nameHeader);

          await page.keyboard.press('Alt+End');

          await expect.poll(async () => boundingWidth(nameHeader)).toBeGreaterThan(widthBefore);
        });

        await test.step('THEN: Alt+Home jumps to the minimum width', async () => {
          const widthBeforeMin = await boundingWidth(nameHeader);

          await page.keyboard.press('Alt+Home');

          await expect.poll(async () => boundingWidth(nameHeader)).toBeLessThan(widthBeforeMin);
        });
      });
    });

    test.describe('WHEN: the column width mode is switched between Fill and Fixed', () => {
      test('THEN: Fill reflows other columns while Fixed keeps their widths authoritative', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Column resizing demo table' });
        const categoryHeader = table.getByTestId('nat-table-header-category');
        const nameHandle = table.getByTestId('nat-table-resize-handle-name');
        const fixedModeBtn = page.getByRole('button', { name: 'Fixed' });

        await test.step('THEN: in Fill mode, widening Name reflows Category narrower', async () => {
          const categoryWidthBefore = await boundingWidth(categoryHeader);

          await dragResizeHandle(page, nameHandle, 100);

          const categoryWidthAfter = await boundingWidth(categoryHeader);

          expect(categoryWidthAfter).toBeLessThan(categoryWidthBefore);
        });

        await test.step('THEN: after switching to Fixed mode, widening Name again leaves Category unchanged', async () => {
          await fixedModeBtn.click();
          await expect(fixedModeBtn).toHaveAttribute('aria-pressed', 'true');

          const categoryWidthBefore = await boundingWidth(categoryHeader);

          await dragResizeHandle(page, nameHandle, 100);

          const categoryWidthAfter = await boundingWidth(categoryHeader);

          expect(Math.round(categoryWidthAfter)).toBe(Math.round(categoryWidthBefore));
        });
      });
    });

    test.describe('WHEN: Reset Widths is clicked after a column has been resized', () => {
      test('THEN: it restores the column to its initial width', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Column resizing demo table' });
        const nameHeader = table.getByTestId('nat-table-header-name');
        const nameHandle = table.getByTestId('nat-table-resize-handle-name');
        const resetBtn = page.getByRole('button', { name: 'Reset Widths' });

        let initialWidth: number;

        await test.step('THEN: dragging the handle grows the Name column', async () => {
          initialWidth = await boundingWidth(nameHeader);

          await dragResizeHandle(page, nameHandle, 100);

          const widthAfterDrag = await boundingWidth(nameHeader);

          expect(widthAfterDrag).toBeGreaterThan(initialWidth);
        });

        await test.step('THEN: clicking Reset Widths restores the initial width', async () => {
          await resetBtn.click();

          const widthAfterReset = await boundingWidth(nameHeader);

          expect(Math.round(widthAfterReset)).toBe(Math.round(initialWidth));
        });
      });
    });

    test.describe('WHEN: a column does not opt into resizing', () => {
      test('THEN: it exposes no resize handle', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Column resizing demo table' });
        const valueHeader = table.getByTestId('nat-table-header-value');

        await test.step('THEN: the Value column header renders without a resize handle', async () => {
          await expect(valueHeader.locator('.column-resize-handle')).toHaveCount(0);
        });
      });
    });
  });
});
