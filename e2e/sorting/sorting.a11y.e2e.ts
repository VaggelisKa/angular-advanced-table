import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Sorting accessibility', () => {
  test.describe('GIVEN: the sorting example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/sorting');
      await loadDocsExamplePreview(page, 'sorting', 'Single and multi-column sorting');
    });

    test.describe('WHEN: programmatic sort buttons are activated via keyboard', () => {
      test('THEN: it applies and clears single-column sort', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Single and multi-column sorting' })).toBeVisible();

        const stateTag = page.getByTestId('sorting-current-state');

        await test.step('THEN: initial state is name (asc)', async () => {
          await expect(stateTag).toContainText('name (asc)');

          const sortValueAscBtn = page.getByRole('button', { name: 'Sort by Value (Asc)' });

          await sortValueAscBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the state reflects value (asc)', async () => {
          await expect(stateTag).toContainText('value (asc)');

          const sortNameDescBtn = page.getByRole('button', { name: 'Sort by Name (Desc)' });

          await sortNameDescBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the state reflects name (desc)', async () => {
          await expect(stateTag).toContainText('name (desc)');

          const clearBtn = page.getByTestId('sorting-single-panel').getByRole('button', { name: 'Clear Sorting' });

          await clearBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the state is cleared', async () => {
          await expect(stateTag).toContainText('None');
        });
      });
    });

    test.describe('WHEN: the Category column header is toggled via keyboard', () => {
      test('THEN: it cycles from ascending to descending sort', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Sorting demo table', exact: true });
        const categoryHeaderBtn = table.locator('th[data-column-id="category"] button.sort-button');
        const stateTag = page.getByTestId('sorting-current-state');

        await test.step('THEN: initial state is name (asc)', async () => {
          await expect(stateTag).toContainText('name (asc)');

          await categoryHeaderBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: it sorts ascending', async () => {
          await expect(stateTag).toContainText('category (asc)');

          await page.keyboard.press('Enter');
        });

        await test.step('THEN: it sorts descending', async () => {
          await expect(stateTag).toContainText('category (desc)');
        });
      });
    });

    test.describe('WHEN: the multi-column sort preset and clear are activated via keyboard', () => {
      test('THEN: it applies and clears multi-column sort', async ({ page }) => {
        const multiStateTag = page.getByTestId('sorting-priority-order');

        await test.step('THEN: initial state is None', async () => {
          await expect(multiStateTag).toContainText('None');

          const multiBtn = page.getByRole('button', { name: 'Sort by Category, then Value' });

          await multiBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: both sort levels are reflected', async () => {
          await expect(multiStateTag).toContainText('1. category (asc), 2. value (desc)');

          const clearBtn = page.getByTestId('sorting-multi-panel').getByRole('button', { name: 'Clear Sorting' });

          await clearBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the state is cleared', async () => {
          await expect(multiStateTag).toContainText('None');
        });
      });
    });

    // Regression for #311: a header cell whose only control is the sort button
    // delegates focus from the cell onto that control. Delegating on *every*
    // focusin made Shift+Tab ping-pong between the cell and the button forever,
    // so the header could not be left backwards. Delegation must fire on
    // arrival only, never on a backward exit passing through the cell.
    test.describe('WHEN: Shift+Tab leaves a header whose only control is the sort button', () => {
      test('THEN: it walks back out of the grid instead of bouncing on the sort button', async ({ page }) => {
        // The pinned-columns example enables sorting without pinning or reorder
        // actions, so its header cells render a sort button and no column menu.
        await loadDocsExamplePreview(page, 'sorting-pinned-columns', 'Sorting with pinned columns');

        const scope = page.getByTestId('docs-example-sorting-pinned-columns-preview-panel');
        const sortButtons = scope.locator('thead .sort-button');
        const secondSort = sortButtons.nth(1);

        await test.step('GIVEN: the header cells carry a single control', async () => {
          await expect(scope.locator('thead .menu-button')).toHaveCount(0);
          await expect(secondSort).toBeVisible();
        });

        await test.step('THEN: repeated Shift+Tab never returns to the sort button it started on', async () => {
          await secondSort.focus();
          await expect(secondSort).toBeFocused();

          const visited: string[] = [];

          for (let step = 0; step < 4; step++) {
            await page.keyboard.press('Shift+Tab');
            visited.push(
              await page.evaluate(() => {
                const active = document.activeElement as HTMLElement | null;
                const column = active?.closest('th')?.getAttribute('data-column-id') ?? '-';

                return `${active?.tagName.toLowerCase() ?? 'none'}|${active?.className ?? ''}|${column}`;
              })
            );
          }

          // The loop re-focused the same column's sort button on every other step.
          const bounced = visited.filter((entry) => entry.includes('sort-button') && entry.endsWith('|id'));

          expect(bounced).toHaveLength(0);
          await expect(secondSort).not.toBeFocused();
        });

        await test.step('THEN: focus arriving on the header cell still delegates onto its sort button', async () => {
          await secondSort.evaluate((button) => button.closest<HTMLElement>('th')?.focus());

          await expect(secondSort).toBeFocused();
        });
      });
    });

    test.describe('WHEN: the sorting example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-sorting-preview-panel"]');
      });
    });
  });
});
