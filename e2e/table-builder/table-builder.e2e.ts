import { expect, test } from '@playwright/test';

test.describe('FEATURE: Table builder', () => {
  test.describe('GIVEN: the table builder page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/builder');
    });

    test.describe('WHEN: the page is rendered', () => {
      test('THEN: it shows the heading, config card, workspace and table surface', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Table Builder' })).toBeVisible();
        await expect(page.locator('.config-card')).toBeVisible();
        await expect(page.locator('.workspace-area')).toBeVisible();
        await expect(page.locator('nat-table-surface')).toBeVisible();
      });
    });

    test.describe('WHEN: a config feature toggle is clicked', () => {
      test('THEN: it updates the code preview to reflect the new config state', async ({ page }) => {
        const globalSearchControl = page.locator('.toggle-control', { hasText: 'Global Search' });
        const globalSearchToggle = globalSearchControl.locator('input');
        const codeContent = page.locator('.code-content');

        await test.step('THEN: search is active and present in the preview', async () => {
          await expect(globalSearchToggle).toBeChecked();
          await expect(codeContent).toContainText('app-table-search');
        });

        await test.step('THEN: search disappears from the preview after toggling it off', async () => {
          // The input sits under the slider overlay, so click the label.
          await globalSearchControl.click();

          await expect(globalSearchToggle).not.toBeChecked();
          await expect(codeContent).not.toContainText('app-table-search');
        });

        await test.step('THEN: search returns to the preview after toggling it on again', async () => {
          await globalSearchControl.click();

          await expect(globalSearchToggle).toBeChecked();
          await expect(codeContent).toContainText('app-table-search');
        });
      });
    });

    test.describe('WHEN: a code viewer tab is selected', () => {
      test('THEN: it switches the code viewer content and updates the active tab state', async ({ page }) => {
        const tsTabBtn = page.getByRole('button', { name: 'custom-table.ts' });
        const htmlTabBtn = page.getByRole('button', { name: 'custom-table.html' });
        const codeContent = page.locator('.code-content');

        await test.step('THEN: the HTML tab is active by default', async () => {
          await expect(htmlTabBtn).toHaveClass(/is-active/);
          await expect(tsTabBtn).not.toHaveClass(/is-active/);
          await expect(codeContent).toContainText('nat-table-surface');
        });

        await test.step('THEN: the TS tab becomes active and its content is shown after selecting it', async () => {
          await tsTabBtn.click();

          await expect(tsTabBtn).toHaveClass(/is-active/);
          await expect(htmlTabBtn).not.toHaveClass(/is-active/);
          await expect(codeContent).toContainText('export class CustomTableComponent');
        });
      });
    });

    test.describe('WHEN: the copy button is clicked', () => {
      test('THEN: it changes the button label to confirm the copy', async ({ page }) => {
        const copyBtn = page.locator('.btn-copy');

        await expect(copyBtn).toHaveText('Copy code');

        await copyBtn.click();

        await expect(copyBtn).toHaveText('Copied');
      });
    });
  });
});
