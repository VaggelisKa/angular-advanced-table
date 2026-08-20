import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { applyDocumentDirection } from '../support/document-direction';

test.describe('FEATURE: Table toolbar', () => {
  const buttons = (
    page: Page
  ): {
    readonly exportButton: Locator;
    readonly refreshButton: Locator;
    readonly compactButton: Locator;
    readonly comfortableButton: Locator;
    readonly shareButton: Locator;
  } => ({
    exportButton: page.getByTestId('export-button'),
    refreshButton: page.getByTestId('refresh-button'),
    compactButton: page.getByTestId('density-compact-button'),
    comfortableButton: page.getByTestId('density-comfortable-button'),
    shareButton: page.getByTestId('share-button')
  });

  test.describe('GIVEN: the toolbar showcase page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/toolbar-actions');
      await loadDocsExamplePreview(page, 'toolbar-actions', 'Toolbar groups and action placement');
    });

    test.describe('WHEN: keyboard activates a toolbar item', () => {
      test('THEN: it reports the activated action for each item', async ({ page }) => {
        const exportBtn = page.getByTestId('export-button');

        await exportBtn.focus();
        await page.keyboard.press('Enter');

        await test.step('THEN: the last action reports export', async () => {
          await expect(page.getByTestId('last-action')).toHaveText('export');

          const refreshBtn = page.getByTestId('refresh-button');

          await refreshBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the last action reports refresh', async () => {
          await expect(page.getByTestId('last-action')).toHaveText('refresh');

          const shareBtn = page.getByTestId('share-button');

          await shareBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the last action reports share', async () => {
          await expect(page.getByTestId('last-action')).toHaveText('share');

          const compactBtn = page.getByTestId('density-compact-button');

          await compactBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the last action reports density-compact', async () => {
          await expect(page.getByTestId('last-action')).toHaveText('density-compact');
        });
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
        await page.goto('/docs/toolbar-actions');
        await loadDocsExamplePreview(page, 'toolbar-actions', 'Toolbar groups and action placement');

        const { exportButton, refreshButton } = buttons(page);

        await test.step('THEN: ArrowLeft moves focus in the reversed direction', async () => {
          await exportButton.focus();
          await exportButton.press('ArrowLeft');
          await expect(refreshButton).toBeFocused();
        });
      });
    });

    test.describe('WHEN: focus is on a text input toolbar item', () => {
      // Boundary-aware handoff contract for #249: a text field keeps Left/Right
      // for its own caret while the caret has room to travel, then hands the
      // arrow off to roving navigation once the caret sits at the value edge in
      // the arrow's direction — so the field is not a dead-end. Tab still exits
      // the whole toolbar regardless of caret position.
      // The 'Table actions toolbar' holds two roving items: the search (first)
      // and the menu trigger (last). With wrap enabled, both the end-edge
      // ArrowRight and the start-edge ArrowLeft-wrap land on the menu trigger.
      test('THEN: arrows hand off to the sibling at the caret edge, Tab exits', async ({ page }) => {
        const searchToolbar = page.getByRole('toolbar', { name: 'Table actions toolbar' });
        const search = searchToolbar.getByRole('searchbox', { name: 'Search by name, category or status' });
        const menuTrigger = page.getByTestId('menu-trigger');

        await test.step('GIVEN: focus lands on the search input with text', async () => {
          await search.focus();
          await search.fill('Security');
          await expect(search).toBeFocused();
        });

        await test.step('THEN: with the caret mid-value, Left/Right drive the caret and focus stays', async () => {
          // caret to the middle: Home, then step right a couple of characters
          await search.press('Home');
          await search.press('ArrowRight');
          await search.press('ArrowRight');

          await search.press('ArrowLeft');
          await expect(search).toBeFocused();
          await expect(menuTrigger).not.toBeFocused();

          await search.press('ArrowRight');
          await expect(search).toBeFocused();
          await expect(menuTrigger).not.toBeFocused();
        });

        await test.step('THEN: at the END caret, ArrowRight hands off to the next item', async () => {
          await search.press('End');
          await search.press('ArrowRight');

          await expect(search).not.toBeFocused();
          await expect(menuTrigger).toBeFocused();
        });

        await test.step('THEN: at the START caret, ArrowLeft wraps to the last item', async () => {
          await search.focus();
          await search.press('Home');
          await search.press('ArrowLeft');

          // search is the first roving item; with wrap enabled ArrowLeft off the
          // start edge wraps to the last item — the menu trigger
          await expect(search).not.toBeFocused();
          await expect(menuTrigger).toBeFocused();
        });

        await test.step('THEN: Tab still exits the whole toolbar regardless of caret', async () => {
          await search.focus();
          await search.press('Tab');

          await expect(search).not.toBeFocused();
          // roving tabindex keeps sibling items at tabindex -1, so Tab exits the
          // toolbar rather than advancing to the next item
          await expect(menuTrigger).not.toBeFocused();

          const focusInsideToolbar = await searchToolbar.evaluate((toolbar) => toolbar.contains(document.activeElement));

          expect(focusInsideToolbar).toBe(false);
        });
      });
    });

    test.describe('WHEN: a toolbar item wraps its real control', () => {
      // natToolbarItemFocusTarget contract: the roving tabindex stays on the
      // wrapper (Aria registers and hit-tests by host element), but focus is
      // forwarded to the nominated descendant, and that descendant is pulled
      // out of the tab order so the toolbar keeps exactly one Tab stop.
      test('THEN: focus lands on the inner control for both light-DOM and shadow-DOM wrappers', async ({ page }) => {
        const toolbar = page.getByRole('toolbar', { name: 'Wrapped controls toolbar' });
        const lightButton = page.getByTestId('wrapped-light-button');
        const shadowButton = page.getByTestId('wrapped-shadow-button');
        const plainButton = page.getByTestId('wrapped-plain-button');
        const lastAction = page.getByTestId('wrapped-last-action');

        await test.step('GIVEN: neither inner control is an independent tab stop', async () => {
          await expect(lightButton).toHaveAttribute('tabindex', '-1');
          await expect(shadowButton).toHaveAttribute('tabindex', '-1');
        });

        await test.step('THEN: arrowing onto a wrapper focuses its inner button, not the shell', async () => {
          await lightButton.focus();
          await expect(lightButton).toBeFocused();

          await page.keyboard.press('ArrowRight');
          await expect(shadowButton).toBeFocused();

          await page.keyboard.press('ArrowRight');
          await expect(plainButton).toBeFocused();

          await page.keyboard.press('ArrowLeft');
          await expect(shadowButton).toBeFocused();
        });

        await test.step('THEN: Enter activates the inner control', async () => {
          await page.keyboard.press('Enter');
          await expect(lastAction).toHaveText('wrapped-shadow');

          await lightButton.focus();
          await page.keyboard.press('Enter');
          await expect(lastAction).toHaveText('wrapped-light');
        });

        await test.step('THEN: Tab from a wrapper exits the toolbar instead of entering its shell', async () => {
          await shadowButton.focus();
          await page.keyboard.press('Tab');

          await expect(shadowButton).not.toBeFocused();
          await expect(lightButton).not.toBeFocused();
          await expect(plainButton).not.toBeFocused();

          const focusInsideToolbar = await toolbar.evaluate((element) => {
            // activeElement retargets to the shadow host, so walk into any open root
            let active: Element | null = document.activeElement;

            while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;

            return element.contains(active);
          });

          expect(focusInsideToolbar).toBe(false);
        });

        await test.step('THEN: Shift+Tab leaves the control instead of being thrown back into it', async () => {
          // Regression guard: the host carries the roving tabindex and precedes
          // its control, so a naive focus redirect bounces Shift+Tab straight
          // back in and traps the user inside the wrapper.
          await lightButton.focus();
          await expect(lightButton).toBeFocused();

          await page.keyboard.press('Shift+Tab');
          await expect(lightButton).not.toBeFocused();

          await page.keyboard.press('Shift+Tab');
          await expect(lightButton).not.toBeFocused();
          await expect(shadowButton).not.toBeFocused();
        });
      });
    });

    test.describe('WHEN: the table toolbar example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-toolbar-actions-preview-panel"]');
      });
    });
  });
});
