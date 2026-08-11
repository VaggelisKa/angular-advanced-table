import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { applyDocumentDirection } from '../support/document-direction';
import { emulateForcedColors } from '../support/media';
import { waitForTransitions } from '../support/transitions';

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
const configureFixedBuilder = async (page: Page): Promise<Locator> => {
  await page.goto('/examples/builder');

  const grid = page.getByRole('grid', { name: 'Custom configured table preview' });

  await expect(grid).toBeVisible();
  await page.getByTestId('table-builder-feature-withColumnResizing').click();

  const sizingMode = page.getByRole('group', { name: 'Column sizing mode' });
  const fixedSizing = sizingMode.getByRole('button', { name: 'Fixed' });

  await fixedSizing.click();
  await expect(fixedSizing).toHaveAttribute('aria-pressed', 'true');

  return grid;
};

const configureBuilder = async (page: Page): Promise<Locator> => {
  const grid = await configureFixedBuilder(page);

  await grid.getByTestId('nat-table-header-actions-menu-category').click();
  await page.getByTestId('nat-table-header-pin-left-category').click();
  await expect.poll(async () => documentColumnOrder(grid)).toStrictEqual([...DEFAULT_BUILDER_COLUMN_ORDER]);

  return grid;
};

const configureTwoSidedBuilder = async (page: Page): Promise<Locator> => {
  const grid = await configureFixedBuilder(page);

  await grid.getByTestId('nat-table-header-actions-menu-value').click();
  await page.getByTestId('nat-table-header-pin-right-value').click();
  await expect(grid.locator('thead [data-column-id="name"]')).toHaveClass(/is-pinned-left/);
  await expect(grid.locator('thead [data-column-id="value"]')).toHaveClass(/is-pinned-right/);

  return grid;
};

test.describe('FEATURE: Pinned column reorder then resize accessibility', () => {
  test.describe('GIVEN: a non-sticky full-row table with left and right pins in RTL', () => {
    test.use({ colorScheme: 'dark' });

    test.describe('WHEN: a focused pinned header and a hovered body row render with narrow horizontal overflow', () => {
      test('THEN: both pinned zones keep their paint order, opaque surface, and focus indication', async ({ page }) => {
        await applyDocumentDirection(page, 'rtl');
        const grid = await configureTwoSidedBuilder(page);
        const region = grid.locator('xpath=..');
        const headerRow = grid.locator('thead tr').last();
        const bodyRow = grid.locator('tbody tr.data-row').first();
        const nameHeader = headerRow.locator('[data-column-id="name"]');

        await test.step('GIVEN: dark mode, RTL, translucent hover color, and narrow horizontal overflow', async () => {
          await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
          await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
          await grid.evaluate((table) => {
            const host = table.closest('nat-table') as HTMLElement;

            host.style.setProperty('--nat-table-pinned-background', 'rgb(17 34 51)');
            host.style.setProperty('--nat-table-row-background-hover-pinned', 'rgb(0 255 0 / 12%)');
            host.querySelector<HTMLElement>('[data-testid="nat-table-region"]')?.style.setProperty('inline-size', '410px');
            host.querySelector<HTMLElement>('[data-testid="nat-table-region"]')?.style.setProperty('max-inline-size', '410px');
          });

          await expect(grid).not.toHaveClass(/has-sticky-header/);
          await expect(region).toHaveJSProperty('clientWidth', 410);
        });

        await test.step('WHEN: keyboard focus lands on the logical left pinned header', async () => {
          await page.keyboard.press('Tab');
          await nameHeader.focus();
          await expect(nameHeader).toBeFocused();
        });

        await test.step('THEN: a focused pinned header retains its top focus layer and visible inset ring', async () => {
          const pinnedFocus = await nameHeader.evaluate((cell) => {
            const style = getComputedStyle(cell);

            return {
              boxShadow: style.boxShadow,
              focusVisible: cell.matches(':focus-visible'),
              position: style.position,
              zIndex: style.zIndex
            };
          });

          expect(pinnedFocus.focusVisible).toBe(true);
          expect(pinnedFocus.boxShadow).toContain('inset');
          expect(pinnedFocus.position).toBe('sticky');
          expect(pinnedFocus.zIndex).toBe('7');
        });

        await test.step('THEN: a hovered body row composites over the consumer-provided opaque pin base', async () => {
          await bodyRow.locator('[data-column-id="owner"]').hover({ position: { x: 75, y: 20 } });
          await waitForTransitions(bodyRow);

          const pinnedSurfaces = await bodyRow.locator('.is-pinned-left, .is-pinned-right').evaluateAll((cells) =>
            cells.map((cell) => {
              const style = getComputedStyle(cell);

              return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
            })
          );

          expect(pinnedSurfaces).toStrictEqual([
            { backgroundColor: 'rgb(17, 34, 51)', backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.12), rgba(0, 255, 0, 0.12))' },
            { backgroundColor: 'rgb(17, 34, 51)', backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.12), rgba(0, 255, 0, 0.12))' }
          ]);
          await expectNoAxeViolations(page, '[data-testid="nat-table-region"]');
        });
      });
    });
  });

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
    test.beforeEach(async ({ page }) => {
      await emulateForcedColors(page);
    });

    test.describe('WHEN: the pinned grid is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations under forced colors', async ({ page }) => {
        await configureBuilder(page);

        await expectNoAxeViolations(page, '[data-testid="nat-table-region"]');
      });
    });

    test.describe('WHEN: a keyboard user focuses a pinned header', () => {
      test('THEN: it retains a system-color outline when box shadows are suppressed', async ({ page }) => {
        const grid = await configureBuilder(page);
        const pinnedHeader = grid.locator('thead th[data-column-id="name"]');

        await page.keyboard.press('Tab');
        await pinnedHeader.focus();

        const focusIndicator = await pinnedHeader.evaluate((cell) => {
          const style = getComputedStyle(cell);

          return {
            focusVisible: cell.matches(':focus-visible'),
            outlineOffset: style.outlineOffset,
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth
          };
        });

        expect(focusIndicator.focusVisible).toBe(true);
        expect(focusIndicator.outlineStyle).toBe('solid');
        expect(focusIndicator.outlineWidth).toBe('2px');
        expect(focusIndicator.outlineOffset).toBe('-2px');
      });
    });
  });
});
