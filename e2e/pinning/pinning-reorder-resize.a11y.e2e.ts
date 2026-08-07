import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';

test.use({ viewport: { width: 640, height: 900 } });

const DEFAULT_BUILDER_COLUMN_ORDER = ['name', 'category', 'status', 'owner', 'value'] as const;
const SWAPPED_PINNED_BUILDER_COLUMN_ORDER = ['category', 'name', 'status', 'owner', 'value'] as const;

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

const headerWidth = async (grid: Locator, columnId: string): Promise<number> =>
  grid.locator(`thead th[data-column-id="${columnId}"]`).evaluate((cell) => cell.getBoundingClientRect().width);

/**
 * Configures the live Table Builder preview through its public controls, pinning
 * `category` left so the pinned zone holds two adjacent columns.
 *
 * Mirrors the pointer spec's setup so the keyboard path is exercised against the
 * same configuration, not an easier one.
 */
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
  await expect.poll(async () => documentColumnOrder(grid)).toStrictEqual([...DEFAULT_BUILDER_COLUMN_ORDER]);

  return grid;
};

test.describe('FEATURE: Pinned column reorder then resize accessibility', () => {
  test.describe('GIVEN: two adjacent builder columns are pinned left', () => {
    test.describe('WHEN: they are reordered from the keyboard and the grid is scanned', () => {
      test('THEN: it swaps the pinned columns by keyboard and stays free of WCAG A/AA violations', async ({ page }) => {
        const grid = await configureBuilder(page);
        const categoryHeader = grid.locator('thead th[data-column-id="category"]');

        await test.step('THEN: the pinned columns render in their default left order', async () => {
          await expect.poll(async () => geometricColumnOrder(grid)).toStrictEqual([...DEFAULT_BUILDER_COLUMN_ORDER]);
        });

        await test.step('THEN: Mod+Shift+ArrowLeft moves category ahead of name within the pinned zone', async () => {
          await categoryHeader.focus();
          await page.keyboard.press('ControlOrMeta+Shift+ArrowLeft');

          await expect.poll(async () => documentColumnOrder(grid)).toStrictEqual([...SWAPPED_PINNED_BUILDER_COLUMN_ORDER]);
        });

        await test.step('THEN: DOM order and visual order stay aligned after the keyboard swap', async () => {
          await expect.poll(async () => geometricColumnOrder(grid)).toStrictEqual([...SWAPPED_PINNED_BUILDER_COLUMN_ORDER]);
        });

        await test.step('THEN: the reordered pinned grid has no WCAG A/AA violations', async () => {
          await expectNoAxeViolations(page, '[data-testid="nat-table-region"]');
        });
      });
    });

    test.describe('WHEN: a pinned column is resized from the keyboard after a keyboard reorder', () => {
      test('THEN: it resizes the column the keyboard reorder moved, not the one that used to sit there', async ({ page }) => {
        const grid = await configureBuilder(page);
        const categoryHeader = grid.locator('thead th[data-column-id="category"]');
        let widthBeforeResize = 0;

        await test.step('THEN: category moves ahead of name within the pinned zone', async () => {
          await categoryHeader.focus();
          await page.keyboard.press('ControlOrMeta+Shift+ArrowLeft');

          await expect.poll(async () => documentColumnOrder(grid)).toStrictEqual([...SWAPPED_PINNED_BUILDER_COLUMN_ORDER]);

          widthBeforeResize = await headerWidth(grid, 'category');
        });

        await test.step('THEN: keyboard resize grows the column the reorder moved', async () => {
          await grid.locator('thead th[data-column-id="category"]').focus();
          await page.keyboard.press('Alt+ArrowRight');
          await page.keyboard.press('Alt+ArrowRight');

          await expect.poll(async () => headerWidth(grid, 'category')).toBeGreaterThan(widthBeforeResize);
        });

        await test.step('THEN: the resized pinned grid has no WCAG A/AA violations', async () => {
          await expectNoAxeViolations(page, '[data-testid="nat-table-region"]');
        });
      });
    });
  });

  test.describe('GIVEN: a viewer using a forced-colors (high contrast) mode', () => {
    test.use({ forcedColors: 'active' });

    test.describe('WHEN: the pinned grid is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations under forced colors', async ({ page }) => {
        await configureBuilder(page);

        await expectNoAxeViolations(page, '[data-testid="nat-table-region"]');
      });
    });
  });
});
