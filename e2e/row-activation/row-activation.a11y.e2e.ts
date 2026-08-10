import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { emulateForcedColors, paintedColorsOf } from '../support/media';

const PREVIEW_PANEL = '[data-testid="docs-example-row-selection-preview-panel"]';

const table = (page: Page): Locator => page.getByRole('grid', { name: 'Row selection demo table' });

const rowNamed = (page: Page, name: string): Locator => table(page).locator('tbody tr', { hasText: name });

/** A non-interactive body cell — focusable as a grid cell without hitting the row's checkbox. */
const categoryCell = (page: Page, rowName: string): Locator => rowNamed(page, rowName).locator('[data-column-id="category"]');

const lastActivated = (page: Page): Locator => page.getByTestId('last-activated');

test.describe('FEATURE: Row activation accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/row-selection');
    await loadDocsExamplePreview(page, 'row-selection', 'Row selection and bulk actions');
  });

  test.describe('GIVEN: the row activation example is loaded', () => {
    test.describe('WHEN: the example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });

    test.describe('WHEN: a row is activated from the keyboard', () => {
      test('THEN: it activates the focused row without requiring a pointer', async ({ page }) => {
        const cell = categoryCell(page, 'Epsilon Shield');

        await cell.focus();
        await expect(cell).toBeFocused();

        await page.keyboard.press('Enter');

        await expect(lastActivated(page)).toContainText('Epsilon Shield');
      });
    });

    test.describe('WHEN: focus rests on a row-selection checkbox inside a row', () => {
      test('THEN: activating the control selects the row instead of firing row activation', async ({ page }) => {
        const checkbox = rowNamed(page, 'Epsilon Shield').getByRole('checkbox');

        await checkbox.focus();
        await expect(checkbox).toBeFocused();

        await page.keyboard.press('Space');

        await expect(checkbox).toBeChecked();
        await expect(lastActivated(page)).not.toContainText('Epsilon Shield');
      });
    });

    test.describe('WHEN: a row has been activated and the grid is scanned again', () => {
      test('THEN: it keeps the activated grid free of WCAG A/AA violations', async ({ page }) => {
        const cell = categoryCell(page, 'Epsilon Shield');

        await cell.focus();
        await page.keyboard.press('Enter');
        await expect(lastActivated(page)).toContainText('Epsilon Shield');

        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });
  });

  test.describe('GIVEN: a viewer using a forced-colors (high contrast) mode', () => {
    test.beforeEach(async ({ page }) => {
      await emulateForcedColors(page);
    });

    test.describe('WHEN: the example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations under forced colors', async ({ page }) => {
        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });

    test.describe('WHEN: a row is activated from the keyboard', () => {
      // Visibility alone would pass even if the forced palette painted the row's text
      // and background the same colour, so assert the painted pair is distinguishable.
      test('THEN: activation still fires and the row text stays legible against its background', async ({ page }) => {
        const cell = categoryCell(page, 'Epsilon Shield');

        await cell.focus();
        await page.keyboard.press('Enter');

        await expect(lastActivated(page)).toContainText('Epsilon Shield');

        const painted = await paintedColorsOf(cell);

        expect(painted.color).not.toBe(painted.background);
      });
    });
  });
});
