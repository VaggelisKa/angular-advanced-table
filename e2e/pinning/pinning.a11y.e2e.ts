import { expect, test } from '@playwright/test';

test.describe('FEATURE: Column pinning accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
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
  });
});
