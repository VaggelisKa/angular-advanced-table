import {   expect, test } from '@playwright/test';
import type {Locator, Page} from '@playwright/test';

test.describe('Table toolbar accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/toolbar');
  });

  const buttons = (
    page: Page,
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
    shareButton: page.getByTestId('share-button'),
  });

  test('activates items and reports the action via keyboard only', async ({ page }) => {
    const exportBtn = page.getByTestId('export-button');

    await exportBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last-action')).toHaveText('export');

    const refreshBtn = page.getByTestId('refresh-button');

    await refreshBtn.focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('last-action')).toHaveText('refresh');

    const shareBtn = page.getByTestId('share-button');

    await shareBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last-action')).toHaveText('share');

    const compactBtn = page.getByTestId('density-compact-button');

    await compactBtn.focus();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('last-action')).toHaveText('density-compact');
  });

  test('moves the roving tab stop with arrow keys across all three slots (LTR)', async ({
    page,
  }) => {
    const { exportButton, refreshButton, compactButton, comfortableButton, shareButton } =
      buttons(page);

    await exportButton.focus();
    await exportButton.press('ArrowRight');
    await expect(refreshButton).toBeFocused();

    // Left/Right traverse group members linearly, like any other item.
    await refreshButton.press('ArrowRight');
    await expect(compactButton).toBeFocused();

    await compactButton.press('ArrowRight');
    await expect(comfortableButton).toBeFocused();

    await comfortableButton.press('ArrowRight');
    await expect(shareButton).toBeFocused();

    await shareButton.press('ArrowLeft');
    await expect(comfortableButton).toBeFocused();

    await comfortableButton.press('Home');
    await expect(exportButton).toBeFocused();

    await exportButton.press('End');
    await expect(shareButton).toBeFocused();
  });

  test('Up/Down cycle inside the widget group without leaving it', async ({ page }) => {
    const { compactButton, comfortableButton } = buttons(page);

    await compactButton.focus();
    await compactButton.press('ArrowDown');
    await expect(comfortableButton).toBeFocused();

    // Next widget (Share) is outside the group — Down wraps to its first member.
    await comfortableButton.press('ArrowDown');
    await expect(compactButton).toBeFocused();

    await compactButton.press('ArrowUp');
    await expect(comfortableButton).toBeFocused();
  });

  test('reverses arrow keys in RTL', async ({ page }) => {
    await page.addInitScript(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    await page.goto('/toolbar');
    await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();

    const { exportButton, refreshButton } = buttons(page);

    await exportButton.focus();
    await exportButton.press('ArrowLeft');
    await expect(refreshButton).toBeFocused();
  });
});
