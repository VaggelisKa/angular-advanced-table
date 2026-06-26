import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { applyDocumentDirection } from '../support/document-direction';

test.describe('FEATURE: Table toolbar', () => {
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

  test.describe('GIVEN: the toolbar showcase page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/toolbar');
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
