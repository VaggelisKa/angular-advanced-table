import { expect, test } from '@playwright/test';

test.describe('Table builder accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/builder');
  });

  test('configures table builder using keyboard only', async ({ page }) => {
    const globalSearchToggle = page.locator('.toggle-control', { hasText: 'Global Search' }).locator('input');
    const codeContent = page.locator('.code-content');

    // Verify search is initially active
    await expect(globalSearchToggle).toBeChecked();
    await expect(codeContent).toContainText('app-table-search');

    // Focus and press Space to toggle (uncheck)
    await globalSearchToggle.focus();
    await page.keyboard.press('Space');
    await expect(globalSearchToggle).not.toBeChecked();
    await expect(codeContent).not.toContainText('app-table-search');

    // Focus custom-table.ts tab button and press Enter to switch tabs
    const tsTabBtn = page.getByRole('button', { name: 'custom-table.ts' });

    await tsTabBtn.focus();
    await page.keyboard.press('Enter');
    await expect(tsTabBtn).toHaveClass(/is-active/);
    await expect(codeContent).toContainText('export class CustomTableComponent');

    // Focus Copy button and press Space to click
    const copyBtn = page.locator('.btn-copy');

    await copyBtn.focus();
    await page.keyboard.press('Space');
    await expect(copyBtn).toHaveText('Copied');
  });
});
