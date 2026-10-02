import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

const listItems = '[data-testid="nat-list-item"]';

test.describe('FEATURE: Table to list', () => {
  test.describe('GIVEN: the toggle example renders one surface for both renderers', () => {
    test.describe('WHEN: the view is switched after sorting the table', () => {
      test('THEN: it carries the shared state across the renderer swap', async ({ page }) => {
        await page.goto('/examples/table-to-list');

        const table = page.locator('table');
        const list = page.getByTestId('nat-list');
        // The list has no header UI, so the table's own sort control is what
        // proves the sort survives the swap.
        const sortByCustomer = page.getByRole('button', { name: 'Sort by Customer' });

        await test.step('THEN: the table renders first', async () => {
          await expect(table).toBeVisible();
          await expect(list).toBeHidden();
        });

        const unsortedFirstCustomer = await table.locator('tbody tr').first().locator('[data-column-id="customer"]').innerText();

        await test.step('THEN: sorting by customer reorders the table', async () => {
          await sortByCustomer.click();

          await expect(table.locator('tbody tr').first().locator('[data-column-id="customer"]')).not.toHaveText(unsortedFirstCustomer);
        });

        const sortedFirstCustomer = await table.locator('tbody tr').first().locator('[data-column-id="customer"]').innerText();

        await test.step('THEN: switching to the list keeps that sort applied', async () => {
          await page.getByTestId('view-toggle-list').click();

          await expect(list).toBeVisible();
          await expect(table).toBeHidden();
          await expect(page.locator(`${listItems} [data-column-id="customer"]`).first()).toContainText(sortedFirstCustomer.trim());
        });

        await test.step('THEN: hiding a field removes it from every item', async () => {
          const itemCount = await page.locator(listItems).count();

          await page.getByRole('button', { name: 'Region', exact: true }).click();

          await expect(page.locator(`${listItems} [data-column-id="region"]`)).toHaveCount(0);
          await expect(page.locator(listItems)).toHaveCount(itemCount);
        });
      });
    });
  });

  test.describe('GIVEN: the row-selection example', () => {
    test.describe('WHEN: item checkboxes and the mode controls are used', () => {
      test('THEN: it drives the shared selection state', async ({ page }) => {
        await page.goto('/examples/table-to-list/row-selection');

        const checkboxes = page.locator(`${listItems} input[type="checkbox"]`);
        const selectedCount = page.getByTestId('selected-count');

        await test.step('THEN: nothing is selected initially', async () => {
          await expect(selectedCount).toHaveText('0 selected');
          await expect(page.locator(`${listItems}[data-selected="true"]`)).toHaveCount(0);
        });

        // Selection round-trips through the surface's two-way state, so each
        // click is awaited before the next one is sent.
        await test.step('THEN: checking two items selects both in multiple mode', async () => {
          await checkboxes.nth(0).check();
          await expect(selectedCount).toHaveText('1 selected');

          await checkboxes.nth(1).check();
          await expect(selectedCount).toHaveText('2 selected');
          await expect(page.locator(`${listItems}[data-selected="true"]`)).toHaveCount(2);
        });

        await test.step('THEN: single mode keeps at most one item selected', async () => {
          await page.getByTestId('selection-mode-single').click();
          await expect(selectedCount).toHaveText('0 selected');

          await checkboxes.nth(0).check();
          await expect(selectedCount).toHaveText('1 selected');

          await checkboxes.nth(3).check();
          await expect(selectedCount).toHaveText('1 selected');
          await expect(page.locator(`${listItems}[data-selected="true"]`)).toHaveCount(1);
        });

        await test.step('THEN: clearing resets the selection', async () => {
          await page.getByTestId('clear-selection').click();

          await expect(selectedCount).toHaveText('0 selected');
          await expect(page.locator(`${listItems}[data-selected="true"]`)).toHaveCount(0);
        });
      });
    });
  });

  test.describe('GIVEN: the data-states example', () => {
    test.describe('WHEN: each lifecycle scenario is selected', () => {
      test('THEN: it renders the matching state item', async ({ page }) => {
        await page.goto('/examples/table-to-list/data-states');

        const list = page.getByTestId('nat-list');

        await test.step('THEN: the success scenario renders items', async () => {
          await expect(page.locator(listItems).first()).toBeVisible();
        });

        await test.step('THEN: the loading scenario renders the loading item and marks the list busy', async () => {
          await page.getByRole('button', { name: 'Loading', exact: true }).click();

          await expect(page.getByTestId('nat-list-loading-state')).toBeVisible();
          await expect(list).toHaveAttribute('aria-busy', 'true');
        });

        await test.step('THEN: the empty scenario renders the empty item', async () => {
          await page.getByRole('button', { name: 'Empty', exact: true }).click();

          await expect(page.getByTestId('nat-list-empty-state')).toBeVisible();
        });

        await test.step('THEN: the error scenario renders the error item', async () => {
          await page.getByRole('button', { name: 'Error', exact: true }).click();

          await expect(page.getByTestId('nat-list-error-state')).toBeVisible();
          await expect(page.locator(listItems)).toHaveCount(0);
        });
      });
    });
  });

  test.describe('GIVEN: the paginated list example', () => {
    test.describe('WHEN: the pagination companion advances the page', () => {
      test('THEN: it pages the list through the shared engine', async ({ page }) => {
        await page.goto('/examples/table-to-list/pagination');

        const items = page.locator(listItems);
        const nextPageButton = page.getByRole('button', { name: 'Next page' });

        await test.step('THEN: the first page renders the default page size', async () => {
          await expect(items).toHaveCount(10);
        });

        const firstPageText = await items.first().innerText();

        await test.step('THEN: advancing the page renders different items', async () => {
          await nextPageButton.click();

          await expect(items).toHaveCount(10);
          await expect(items.first()).not.toHaveText(firstPageText);
        });
      });
    });
  });
  test.describe('GIVEN: the flow item layout docs example', () => {
    test.describe('WHEN: the narrow container makes one total wider than its slot', () => {
      test('THEN: only that item wraps its total while the other items stay aligned', async ({ page }) => {
        await page.goto('/docs/list-renderer');
        await loadDocsExamplePreview(page, 'list-flow-layout', 'Flow item layout');

        const panel = page.getByTestId('docs-example-list-flow-layout-preview-panel');
        const items = panel.locator(listItems);
        const fieldBox = async (
          item: ReturnType<typeof items.nth>,
          columnId: string
        ): Promise<{ x: number; y: number; width: number }> => {
          const box = await item.locator(`[data-column-id="${columnId}"]`).boundingBox();

          expect(box).not.toBeNull();

          return { x: box?.x ?? 0, y: box?.y ?? 0, width: box?.width ?? 0 };
        };

        await test.step('THEN: fitting items keep the total on the first line, at the same x in every item', async () => {
          await expect(items).toHaveCount(6);

          const first = items.nth(0);
          const second = items.nth(1);
          const firstCustomer = await fieldBox(first, 'customer');
          const firstTotal = await fieldBox(first, 'total');
          const secondTotal = await fieldBox(second, 'total');

          expect(firstTotal.y).toBeCloseTo(firstCustomer.y, 0);
          expect(firstTotal.x).toBeGreaterThan(firstCustomer.x);
          expect(secondTotal.x).toBeCloseTo(firstTotal.x, 0);
        });

        await test.step('THEN: the item with the oversized total widens that field and wraps the next one, unbroken', async () => {
          const first = items.nth(0);
          const wide = items.nth(2);
          const firstTotal = await fieldBox(first, 'total');
          const firstChange = await fieldBox(first, 'change');
          const wideCustomer = await fieldBox(wide, 'customer');
          const wideTotal = await fieldBox(wide, 'total');
          const wideChange = await fieldBox(wide, 'change');
          const totalValue = wide.locator('[data-column-id="total"] [data-testid="nat-list-field-value"]');

          // The fitting fields before it keep their slot, so the total still starts where it does in every other item.
          expect(wideTotal.x).toBeCloseTo(firstTotal.x, 0);
          expect(wideTotal.y).toBeCloseTo(wideCustomer.y, 0);
          expect(wideTotal.width).toBeGreaterThan(firstTotal.width);
          // The change field no longer fits the line and wraps in this item only.
          expect(firstChange.y).toBeCloseTo(firstTotal.y, 0);
          expect(wideChange.y).toBeGreaterThan(wideCustomer.y);
          expect(wideChange.x).toBeCloseTo(wideCustomer.x, 0);
          await expect(totalValue).toHaveText('$1,234,567,890.50');

          const valueBox = await totalValue.boundingBox();
          const customerBox = await wide.locator('[data-column-id="customer"] [data-testid="nat-list-field-value"]').boundingBox();

          // One line of text: an unbroken number is no taller than the customer value.
          expect(valueBox?.height ?? 0).toBeLessThanOrEqual((customerBox?.height ?? 0) + 1);
        });

        await test.step('THEN: a breakable value wraps inside its slot before its field moves', async () => {
          const first = items.nth(0);
          const firstTotal = await fieldBox(first, 'total');
          const firstChange = await fieldBox(first, 'change');
          const changeValue = first.locator('[data-column-id="change"] [data-testid="nat-list-field-value"]');
          const totalValue = first.locator('[data-column-id="total"] [data-testid="nat-list-field-value"]');

          // "+12.5% (vs. last month)" is wider than its slot but its longest word is not:
          // the field keeps its slot on the first line and the secondary part drops inside it.
          expect(firstChange.y).toBeCloseTo(firstTotal.y, 0);
          expect(firstChange.x).toBeGreaterThan(firstTotal.x);

          const changeBox = await changeValue.boundingBox();
          const totalBox = await totalValue.boundingBox();

          expect(changeBox?.height ?? 0).toBeGreaterThan((totalBox?.height ?? 0) * 1.5);
        });

        await test.step('THEN: the full-width note takes a line of its own in every item', async () => {
          const first = items.nth(0);
          const firstTotal = await fieldBox(first, 'total');
          const firstNote = await fieldBox(first, 'note');
          const firstCustomer = await fieldBox(first, 'customer');

          expect(firstNote.y).toBeGreaterThan(firstTotal.y);
          expect(firstNote.x).toBeCloseTo(firstCustomer.x, 0);
        });

        await test.step('THEN: switching to the grid layout keeps every field in its fixed track instead', async () => {
          const gridToggle = panel.getByTestId('list-flow-demo-layout-grid');

          await gridToggle.click();
          // Retrying assertion: on the prerendered page the click may replay after hydration.
          await expect(gridToggle).toHaveAttribute('aria-pressed', 'true');

          const first = items.nth(0);
          const wide = items.nth(2);
          const firstTotal = await fieldBox(first, 'total');
          const wideCustomer = await fieldBox(wide, 'customer');
          const wideTotal = await fieldBox(wide, 'total');
          const wideChange = await fieldBox(wide, 'change');

          expect(wideTotal.y).toBeCloseTo(wideCustomer.y, 0);
          expect(wideChange.y).toBeCloseTo(wideCustomer.y, 0);
          expect(wideTotal.width).toBeCloseTo(firstTotal.width, 0);
        });
      });
    });
  });
});
