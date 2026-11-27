import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Column pinning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
    await loadDocsExamplePreview(page, 'column-pinning', 'Column pinning');
  });

  test.describe('GIVEN: the column pinning example is loaded', () => {
    test.describe('WHEN: pinning controls are clicked', () => {
      test('THEN: it renders pinning controls and applies column pinning styles', async ({ page }) => {
        const nameControl = page.getByTestId('pinning-column-name');
        const nameStartBtn = nameControl.getByRole('button', { name: 'Start' });
        const nameNoneBtn = nameControl.getByRole('button', { name: 'None' });
        const nameEndBtn = nameControl.getByRole('button', { name: 'End' });

        await test.step('THEN: the page renders', async () => {
          await expect(page.getByRole('heading', { name: 'Column pinning' })).toBeVisible();
        });

        await test.step('THEN: the Name column starts pinned to the start', async () => {
          // "Name" starts pinned to the start
          await expect(nameStartBtn).toHaveClass(/active/);
          await expect(nameNoneBtn).not.toHaveClass(/active/);
        });

        await test.step('THEN: None is active and Start is no longer active after clicking None', async () => {
          await nameNoneBtn.click();

          await expect(nameNoneBtn).toHaveClass(/active/);
          await expect(nameStartBtn).not.toHaveClass(/active/);
        });

        await test.step('THEN: End is active and the other options are not after clicking End', async () => {
          await nameEndBtn.click();

          await expect(nameEndBtn).toHaveClass(/active/);
          await expect(nameStartBtn).not.toHaveClass(/active/);
          await expect(nameNoneBtn).not.toHaveClass(/active/);
        });
      });
    });
  });
});
