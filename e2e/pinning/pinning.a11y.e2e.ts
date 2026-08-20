import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Column pinning accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
    await loadDocsExamplePreview(page, 'column-pinning', 'Column pinning');
  });

  test.describe('GIVEN: the column pinning example is loaded', () => {
    test.describe('WHEN: keyboard activates pinning controls', () => {
      test('THEN: it renders pinning controls and applies column pinning styles via keyboard only', async ({ page }) => {
        const nameControl = page.locator('.column-control', { hasText: 'Name' });
        const nameLeftBtn = nameControl.getByRole('button', { name: 'Left' });
        const nameNoneBtn = nameControl.getByRole('button', { name: 'None' });
        const nameRightBtn = nameControl.getByRole('button', { name: 'Right' });

        await test.step('THEN: the page renders', async () => {
          await expect(page.getByRole('heading', { name: 'Column pinning' })).toBeVisible();
        });

        await test.step('THEN: the Name column starts pinned left', async () => {
          // "Name" starts pinned left
          await expect(nameLeftBtn).toHaveClass(/active/);
          await expect(nameNoneBtn).not.toHaveClass(/active/);
        });

        await test.step('THEN: the None control is focused and activated with Enter to unpin Name', async () => {
          await nameNoneBtn.focus();
          await expect(nameNoneBtn).toBeFocused();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: None is active and Left is no longer active', async () => {
          await expect(nameNoneBtn).toHaveClass(/active/);
          await expect(nameLeftBtn).not.toHaveClass(/active/);
        });

        await test.step('THEN: the Right control is focused and activated with Space to pin Name right', async () => {
          await nameRightBtn.focus();
          await expect(nameRightBtn).toBeFocused();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: Right is active', async () => {
          await expect(nameRightBtn).toHaveClass(/active/);
        });
      });
    });

    // Regression: header column menus activate through @angular/aria's
    // itemSelected model (Enter/Space emit the item value), not per-item DOM
    // clicks, and a keyboard open must land focus on the first menu item even
    // though the menu's items render deferred after the overlay attaches.
    test.describe('WHEN: the header column menu is driven by keyboard only', () => {
      test('THEN: it opens on the first item, pins the column, and returns focus to the trigger', async ({ page }) => {
        const scope = page.getByTestId('docs-example-column-pinning-preview-panel');
        const sortButton = scope.locator('thead th[data-column-id="category"] .sort-button');
        const menuButton = scope.getByTestId('nat-table-header-actions-menu-category');
        const pinLeftItem = page.getByTestId('nat-table-header-pin-left-category');
        const pinnedHeader = scope.locator('thead th[data-column-id="category"].is-pinned-left');

        await test.step('GIVEN: focus is on the sort button and Tab reaches the menu trigger', async () => {
          await sortButton.click();
          await page.keyboard.press('Tab');
          await expect(menuButton).toBeFocused();
        });

        await test.step('THEN: Enter opens the menu with the first item focused', async () => {
          await page.keyboard.press('Enter');
          await expect(pinLeftItem).toBeFocused();
        });

        await test.step('THEN: Enter pins the column and focus returns to the menu trigger', async () => {
          await page.keyboard.press('Enter');
          await expect(pinnedHeader).toHaveCount(1);
          await expect(menuButton).toBeFocused();
        });

        await test.step('THEN: the same path unpins the column again', async () => {
          await page.keyboard.press('Enter');
          await expect(pinLeftItem).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(pinnedHeader).toHaveCount(0);
        });
      });
    });

    test.describe('WHEN: the column pinning example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-column-pinning-preview-panel"]');
      });
    });
  });
});
