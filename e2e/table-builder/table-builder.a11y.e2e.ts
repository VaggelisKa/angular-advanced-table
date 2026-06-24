import { expect, test } from '@playwright/test';

test.describe('FEATURE: Table builder', () => {
  test.describe('GIVEN: the table builder page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/builder');
    });

    test.describe('WHEN: the user configures the table builder using keyboard only', () => {
      test('THEN: it applies each interaction and reflects the result in the preview', async ({ page }) => {
        const globalSearchToggle = page.locator('.toggle-control', { hasText: 'Global Search' }).locator('input');
        const codeContent = page.locator('.code-content');
        const tsTabBtn = page.getByRole('button', { name: 'custom-table.ts' });
        const copyBtn = page.locator('.btn-copy');

        await test.step('THEN: search is active and present in the preview', async () => {
          await expect(globalSearchToggle).toBeChecked();
          await expect(codeContent).toContainText('app-table-search');
        });

        await test.step('THEN: the search toggle is switched off via the keyboard', async () => {
          await globalSearchToggle.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: search disappears from the preview', async () => {
          await expect(globalSearchToggle).not.toBeChecked();
          await expect(codeContent).not.toContainText('app-table-search');
        });

        await test.step('THEN: the TS tab is activated via the keyboard', async () => {
          await tsTabBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the TS tab becomes active and its content is shown', async () => {
          await expect(tsTabBtn).toHaveClass(/is-active/);
          await expect(codeContent).toContainText('export class CustomTableComponent');
        });

        await test.step('THEN: the copy button is activated via the keyboard', async () => {
          await copyBtn.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the label confirms the copy', async () => {
          await expect(copyBtn).toHaveText('Copied');
        });
      });
    });
  });
});
