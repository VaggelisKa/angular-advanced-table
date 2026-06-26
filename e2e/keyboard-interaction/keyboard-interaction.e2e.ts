import { expect, test } from '@playwright/test';

test.describe('FEATURE: Keyboard interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/keyboard-interaction');
  });

  test.describe('GIVEN: the keyboard interaction example is loaded', () => {
    test.describe('WHEN: interactive cell controls are operated via pointer', () => {
      test('THEN: it operates controls and reports actions via pointer', async ({ page }) => {
        const lastAction = page.locator('.info-tag');
        const ackBtn = page.getByRole('button', { name: 'Acknowledge Alpha Searcher' });
        const checkbox = page.getByRole('checkbox', { name: 'Active Alpha Searcher' });

        await test.step('THEN: the page renders with no action reported yet', async () => {
          await expect(page.getByRole('heading', { name: 'Keyboard Interaction' })).toBeVisible();
          await expect(lastAction).toContainText('Last action: None yet');
          await expect(ackBtn).toBeVisible();
          await ackBtn.click();
        });

        await test.step('THEN: the acknowledge action is reported', async () => {
          await expect(lastAction).toContainText('Last action: Acknowledged Alpha Searcher');
          await expect(checkbox).toBeChecked();
          await checkbox.click();
        });

        await test.step('THEN: the row is unchecked and the pause action is reported', async () => {
          await expect(checkbox).not.toBeChecked();
          await expect(lastAction).toContainText('Last action: Paused Alpha Searcher');
          await checkbox.click();
        });

        await test.step('THEN: the row is checked and the resume action is reported', async () => {
          await expect(checkbox).toBeChecked();
          await expect(lastAction).toContainText('Last action: Resumed Alpha Searcher');
        });
      });
    });
  });
});
