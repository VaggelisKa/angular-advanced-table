import { expect, test } from '@playwright/test';

test.describe('FEATURE: Column pinning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
  });

  test.describe('GIVEN: the column pinning example is loaded', () => {
    test.describe('WHEN: pinning controls are clicked', () => {
      test('THEN: it renders pinning controls and applies column pinning styles', async ({ page }) => {
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

        await test.step('THEN: None is active and Left is no longer active after clicking None', async () => {
          await nameNoneBtn.click();

          await expect(nameNoneBtn).toHaveClass(/active/);
          await expect(nameLeftBtn).not.toHaveClass(/active/);
        });

        await test.step('THEN: Right is active and the other options are not after clicking Right', async () => {
          await nameRightBtn.click();

          await expect(nameRightBtn).toHaveClass(/active/);
          await expect(nameLeftBtn).not.toHaveClass(/active/);
          await expect(nameNoneBtn).not.toHaveClass(/active/);
        });
      });
    });
  });
});
