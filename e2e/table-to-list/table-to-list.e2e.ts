import { expect, test } from '@playwright/test';

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
});
