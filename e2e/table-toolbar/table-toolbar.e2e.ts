import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { applyDocumentDirection } from '../support/document-direction';

test.describe('FEATURE: Table toolbar', () => {
  /**
   * Asserts `first` precedes `second` in REAL DOM order (what screen readers
   * read). The toolbar places items with static ng-content slots, so DOM order
   * is fixed at render time.
   */
  const expectPrecedes = async (first: Locator, second: Locator): Promise<void> =>
    expect
      .poll(async () =>
        first.evaluate(
          (element, other) => other !== null && Boolean(element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING),
          await second.elementHandle()
        )
      )
      .toBe(true);

  const buttons = (
    page: Page
  ): {
    exportButton: Locator;
    refreshButton: Locator;
    compactButton: Locator;
    comfortableButton: Locator;
    shareButton: Locator;
  } => ({
    exportButton: page.getByTestId('export-button'),
    refreshButton: page.getByTestId('refresh-button'),
    compactButton: page.getByTestId('density-compact-button'),
    comfortableButton: page.getByTestId('density-comfortable-button'),
    shareButton: page.getByTestId('share-button')
  });

  type BoundingBox = { x: number; y: number; width: number; height: number };

  /** Reads a locator's bounding box, failing loudly if the element has none. */
  const requireBox = async (locator: Locator): Promise<BoundingBox> => {
    const box = await locator.boundingBox();

    if (box === null) {
      throw new Error('Expected element to have a bounding box');
    }

    return box;
  };

  test.describe('GIVEN: the toolbar showcase page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/toolbar');
    });

    test.describe('WHEN: the page is rendered', () => {
      test('THEN: it shows the heading, Products toolbar, and toolbar-button styling', async ({ page }) => {
        await test.step('THEN: it shows the heading and the Products toolbar', async () => {
          await expect(page.getByRole('heading', { name: 'Table Toolbar' })).toBeVisible();
          await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();
        });

        await test.step('THEN: it applies the toolbar-button styling to projected buttons', async () => {
          const exportButton = page.getByTestId('export-button');

          await expect(exportButton).toHaveClass(/toolbar-button/);
          const radius = await exportButton.evaluate((el) => getComputedStyle(el).borderRadius);

          expect(radius).not.toBe('0px');
        });
      });

      test('THEN: it lays items out as start | center | end in the DOM and on screen', async ({ page }) => {
        const { exportButton, refreshButton, compactButton, shareButton } = buttons(page);

        // Export (start) < Refresh (center) < density group < Share (end) —
        // visually AND in the DOM.
        await expectPrecedes(exportButton, refreshButton);
        await expectPrecedes(refreshButton, compactButton);
        await expectPrecedes(compactButton, shareButton);

        // The flex spacers sit between the slots: start | spacer | center | spacer | end.
        // Scope to the Products toolbar — the page now has several toolbars.
        // Each spacer carries a positional test id, so locate them semantically.
        const firstSpacer = page.getByRole('toolbar', { name: 'Products toolbar' }).getByTestId('toolbar-spacer-start');
        const secondSpacer = page.getByRole('toolbar', { name: 'Products toolbar' }).getByTestId('toolbar-spacer-end');

        await expectPrecedes(exportButton, firstSpacer);
        await expectPrecedes(firstSpacer, refreshButton);
        await expectPrecedes(refreshButton, secondSpacer);
        await expectPrecedes(secondSpacer, compactButton);

        const exportBox = await requireBox(exportButton);
        const refreshBox = await requireBox(refreshButton);
        const shareBox = await requireBox(shareButton);

        // the on-screen x positions follow the same order
        expect(exportBox.x).toBeLessThan(refreshBox.x);
        expect(refreshBox.x).toBeLessThan(shareBox.x);
      });

      test('THEN: it exposes the labelled widget group in slot order in the accessibility tree', async ({ page }) => {
        const toolbar = page.getByRole('toolbar', { name: 'Products toolbar' });

        await expect(toolbar).toMatchAriaSnapshot(`
      - button "Export"
      - button "Refresh"
      - group "View density":
        - button "Compact"
        - button "Comfortable"
      - button "Share"
    `);
      });
    });

    test.describe('WHEN: a toolbar item is clicked', () => {
      test('THEN: it reports the activated action for each item', async ({ page }) => {
        await page.getByTestId('export-button').click();
        await expect(page.getByTestId('last-action')).toHaveText('export');

        await page.getByTestId('refresh-button').click();
        await expect(page.getByTestId('last-action')).toHaveText('refresh');

        await page.getByTestId('share-button').click();
        await expect(page.getByTestId('last-action')).toHaveText('share');

        await page.getByTestId('density-compact-button').click();
        await expect(page.getByTestId('last-action')).toHaveText('density-compact');
      });
    });

    test.describe('WHEN: arrow keys traverse the toolbar in LTR', () => {
      test('THEN: it moves the roving tab stop across all three slots', async ({ page }) => {
        const { exportButton, refreshButton, compactButton, comfortableButton, shareButton } = buttons(page);

        await test.step('THEN: ArrowRight moves focus rightward from Export', async () => {
          await exportButton.focus();
          await exportButton.press('ArrowRight');
          await expect(refreshButton).toBeFocused();
        });

        await test.step('THEN: Left/Right traverse group members linearly, like any other item', async () => {
          await refreshButton.press('ArrowRight');
          await expect(compactButton).toBeFocused();

          await compactButton.press('ArrowRight');
          await expect(comfortableButton).toBeFocused();

          await comfortableButton.press('ArrowRight');
          await expect(shareButton).toBeFocused();
        });

        await test.step('THEN: ArrowLeft / Home / End move focus', async () => {
          await shareButton.press('ArrowLeft');
          await expect(comfortableButton).toBeFocused();

          await comfortableButton.press('Home');
          await expect(exportButton).toBeFocused();

          await exportButton.press('End');
          await expect(shareButton).toBeFocused();
        });
      });
    });

    test.describe('WHEN: Up/Down arrow keys cycle the widget group', () => {
      test('THEN: it cycles inside the widget group without leaving it', async ({ page }) => {
        const { compactButton, comfortableButton } = buttons(page);

        await test.step('THEN: ArrowDown moves within the group', async () => {
          await compactButton.focus();
          await compactButton.press('ArrowDown');
          await expect(comfortableButton).toBeFocused();
        });

        await test.step('THEN: Next widget (Share) is outside the group — Down wraps to its first member', async () => {
          await comfortableButton.press('ArrowDown');
          await expect(compactButton).toBeFocused();
        });

        await test.step('THEN: ArrowUp moves back up within the group', async () => {
          await compactButton.press('ArrowUp');
          await expect(comfortableButton).toBeFocused();
        });
      });
    });

    test.describe('WHEN: arrow keys traverse the toolbar in RTL', () => {
      test('THEN: it reverses the arrow-key direction', async ({ page }) => {
        // re-navigates with RTL direction inside this body (rule 5) — not hoisted to the shared GIVEN
        await applyDocumentDirection(page, 'rtl');
        await page.goto('/examples/toolbar');
        await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();

        const { exportButton, refreshButton } = buttons(page);

        await test.step('THEN: ArrowLeft moves focus in the reversed direction', async () => {
          await exportButton.focus();
          await exportButton.press('ArrowLeft');
          await expect(refreshButton).toBeFocused();
        });
      });
    });
  });
});
