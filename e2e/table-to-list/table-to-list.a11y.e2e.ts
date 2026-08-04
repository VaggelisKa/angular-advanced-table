import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { waitForHydration } from '../support/hydration';

const listItems = '[data-testid="nat-list-item"]';
const listRegion = '[data-testid="nat-list-region"]';

test.describe('FEATURE: Table to list accessibility', () => {
  test.describe('GIVEN: the list examples are loaded', () => {
    test.describe('WHEN: each list page is scanned', () => {
      for (const [name, path] of [
        ['basic', '/examples/table-to-list/basic'],
        ['list controls', '/examples/table-to-list/list-controls'],
        ['custom cells', '/examples/table-to-list/custom-cells'],
        ['row selection', '/examples/table-to-list/row-selection'],
        ['paginated', '/examples/table-to-list/pagination']
      ] as const) {
        test(`THEN: it has no WCAG A/AA violations on the ${name} example`, async ({ page }) => {
          await page.goto(path);
          await expect(page.locator(listItems).first()).toBeVisible();

          await expectNoAxeViolations(page, listRegion);
        });
      }
    });

    test.describe('WHEN: the list renders its screen-reader summary', () => {
      test('THEN: it describes items and fields rather than rows and columns', async ({ page }) => {
        await page.goto('/examples/table-to-list/basic');
        // The summary id regenerates when hydration claims the prerendered DOM,
        // so resolve aria-describedby only against the settled client DOM.
        await waitForHydration(page);

        const list = page.getByTestId('nat-list');
        const summaryId = await list.getAttribute('aria-describedby');

        expect(summaryId).toBeTruthy();

        const summary = page.locator(`#${(summaryId ?? '').split(' ')[0]}`);

        await expect(summary).toContainText('item');
        await expect(summary).toContainText('field');
        await expect(summary).not.toContainText('column');
      });
    });
  });

  test.describe('GIVEN: a list with row selection', () => {
    test.describe('WHEN: selection is driven by keyboard only', () => {
      test('THEN: it selects an item with the keyboard and announces the change', async ({ page }) => {
        await page.goto('/examples/table-to-list/row-selection');
        // Space pressed while the prerendered DOM is still being claimed can be
        // swallowed by the hydration/event-replay window; settle first.
        await waitForHydration(page);

        const firstCheckbox = page.locator(`${listItems} input[type="checkbox"]`).first();
        const selectedCount = page.getByTestId('selected-count');

        await test.step('THEN: the row checkbox exposes an accessible name', async () => {
          await expect(firstCheckbox).toHaveAttribute('aria-label', /select/i);
        });

        await test.step('THEN: focusing and pressing Space selects the item', async () => {
          await firstCheckbox.focus();
          await expect(firstCheckbox).toBeFocused();

          await firstCheckbox.press('Space');

          // Assert the shared state first: it settles after the surface's
          // two-way round-trip, which also re-renders the checkbox.
          await expect(selectedCount).toHaveText('1 selected');
          await expect(firstCheckbox).toBeChecked();
        });

        await test.step('THEN: pressing Space again deselects it', async () => {
          await firstCheckbox.press('Space');

          await expect(selectedCount).toHaveText('0 selected');
          await expect(firstCheckbox).not.toBeChecked();
        });

        await test.step('THEN: the selected state stays free of aria-selected on list items', async () => {
          await expect(page.locator(`${listItems}[aria-selected]`)).toHaveCount(0);
        });
      });
    });
  });

  test.describe('GIVEN: the data-states example', () => {
    test.describe('WHEN: the error state is shown', () => {
      test('THEN: the state item stays accessible', async ({ page }) => {
        await page.goto('/examples/table-to-list/data-states');

        await page.getByRole('button', { name: 'Error', exact: true }).click();
        await expect(page.getByTestId('nat-list-error-state')).toBeVisible();

        await expectNoAxeViolations(page, listRegion);
      });
    });
  });
});
