import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/builder');
});

test('renders the table builder page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Table Builder' })).toBeVisible();
  await expect(page.locator('.config-card')).toBeVisible();
  await expect(page.locator('.workspace-area')).toBeVisible();
  await expect(page.locator('nat-table-surface')).toBeVisible();
});

test('can toggle config features and update the code preview', async ({ page }) => {
  const globalSearchToggle = page
    .locator('.toggle-control', { hasText: 'Global Search' })
    .locator('input');
  const codeContent = page.locator('.code-content');

  // Verify search is initially active
  await expect(globalSearchToggle).toBeChecked();
  await expect(codeContent).toContainText('app-table-search');

  // Uncheck search (force because of slider overlay)
  await globalSearchToggle.uncheck({ force: true });
  await expect(globalSearchToggle).not.toBeChecked();
  await expect(codeContent).not.toContainText('app-table-search');

  // Check search again
  await globalSearchToggle.check({ force: true });
  await expect(globalSearchToggle).toBeChecked();
  await expect(codeContent).toContainText('app-table-search');
});

test('can switch code viewer tabs', async ({ page }) => {
  const tsTabBtn = page.getByRole('button', { name: 'custom-table.ts' });
  const htmlTabBtn = page.getByRole('button', { name: 'custom-table.html' });
  const codeContent = page.locator('.code-content');

  await expect(htmlTabBtn).toHaveClass(/is-active/);
  await expect(tsTabBtn).not.toHaveClass(/is-active/);
  await expect(codeContent).toContainText('nat-table-surface');

  // Switch to TS
  await tsTabBtn.click();
  await expect(tsTabBtn).toHaveClass(/is-active/);
  await expect(htmlTabBtn).not.toHaveClass(/is-active/);
  await expect(codeContent).toContainText('export class CustomTableComponent');
});

test('can copy code', async ({ page }) => {
  const copyBtn = page.locator('.btn-copy');
  await expect(copyBtn).toHaveText('Copy code');

  await copyBtn.click();
  // Button should temporarily change label to "Copied"
  await expect(copyBtn).toHaveText('Copied');
});
