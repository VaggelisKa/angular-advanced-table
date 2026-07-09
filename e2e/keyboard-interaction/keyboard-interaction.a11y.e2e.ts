import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Keyboard interaction accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/keyboard-interaction');
    await loadDocsExamplePreview(page, 'keyboard-interaction', 'Keyboard cell interaction');
  });

  test.describe('GIVEN: the keyboard interaction example is loaded', () => {
    test.describe('WHEN: interactive cell controls are operated via keyboard', () => {
      test('THEN: it operates controls and reports actions via keyboard only', async ({ page }) => {
        const lastAction = page.locator('.info-tag');
        const ackBtn = page.getByRole('button', { name: 'Acknowledge Alpha Searcher' });
        const checkbox = page.getByRole('checkbox', { name: 'Active Alpha Searcher' });

        await test.step('THEN: the page renders with no action reported yet', async () => {
          await expect(page.getByRole('heading', { name: 'Keyboard cell interaction' })).toBeVisible();
          await expect(lastAction).toContainText('Last action: None yet');
          await expect(ackBtn).toBeVisible();
          await ackBtn.focus();
          await page.keyboard.press('Enter');
        });

        await test.step('THEN: the acknowledge action is reported', async () => {
          await expect(lastAction).toContainText('Last action: Acknowledged Alpha Searcher');
          await expect(checkbox).toBeChecked();
          await checkbox.focus();
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the row is unchecked and the pause action is reported', async () => {
          await expect(checkbox).not.toBeChecked();
          await expect(lastAction).toContainText('Last action: Paused Alpha Searcher');
          await page.keyboard.press('Space');
        });

        await test.step('THEN: the row is checked and the resume action is reported', async () => {
          await expect(checkbox).toBeChecked();
          await expect(lastAction).toContainText('Last action: Resumed Alpha Searcher');
        });
      });
    });

    test.describe('WHEN: the keyboard interaction example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-keyboard-interaction-preview-panel"]');
      });
    });
  });
});
