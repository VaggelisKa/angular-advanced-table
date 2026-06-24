import { expect, test } from '@playwright/test';

test.describe('FEATURE: Sticky header', () => {
  test.describe('GIVEN: the sticky header demo page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/examples/sticky-header');
    });

    test.describe('WHEN: the sticky-header checkbox is toggled', () => {
      test('THEN: it toggles the sticky header class on the table', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Sticky header demo table' });
        const checkbox = page.getByRole('checkbox', { name: 'Enable Sticky Header' });

        await test.step('THEN: heading is visible', async () => {
          await expect(page.getByRole('heading', { name: 'Sticky Header' })).toBeVisible();
        });

        await test.step('THEN: the checkbox starts checked and the sticky class is present', async () => {
          await expect(checkbox).toBeChecked();
          await expect(table).toHaveClass(/has-sticky-header/);

          await checkbox.uncheck();
        });

        await test.step('THEN: the sticky class is removed', async () => {
          await expect(checkbox).not.toBeChecked();
          await expect(table).not.toHaveClass(/has-sticky-header/);

          await checkbox.check();
        });

        await test.step('THEN: the sticky class returns', async () => {
          await expect(checkbox).toBeChecked();
          await expect(table).toHaveClass(/has-sticky-header/);
        });
      });
    });
  });
});
