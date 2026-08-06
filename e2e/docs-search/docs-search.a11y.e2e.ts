import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { waitForHydration } from '../support/hydration';

/* Axe computes color contrast from blended colors, so scanning while the
   dialog's enter animation is still fading produces false positives. */
const waitForDialogEnterAnimations = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().map(async (animation) => animation.finished));
  });
};

test.describe('FEATURE: Docs search accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/quick-start');
    await waitForHydration(page);
  });

  test.describe('GIVEN: the docs search dialog is opened with the keyboard', () => {
    test.describe('WHEN: operating the combobox with the keyboard only', () => {
      test('THEN: it tracks the active option and restores trigger focus on Escape', async ({ page }) => {
        const trigger = page.getByTestId('docs-search-trigger');
        const input = page.getByTestId('docs-search-input');
        const options = page.getByTestId('docs-search-option');

        await test.step('THEN: it opens from the focused trigger and moves focus into the input', async () => {
          await trigger.focus();
          await page.keyboard.press('Enter');
          await expect(input).toBeFocused();
          await expect(input).toHaveAttribute('role', 'combobox');
          await expect(input).toHaveAttribute('aria-expanded', 'false');
        });

        await test.step('THEN: it expands the listbox and follows arrow keys via aria-activedescendant', async () => {
          await page.keyboard.type('pinning');
          await expect(options.first()).toBeVisible();
          await expect(input).toHaveAttribute('aria-expanded', 'true');

          await page.keyboard.press('ArrowDown');
          await expect(input).toHaveAttribute('aria-activedescendant', 'docs-search-option-0');
          await expect(options.first()).toHaveAttribute('aria-selected', 'true');

          await page.keyboard.press('ArrowDown');
          await expect(input).toHaveAttribute('aria-activedescendant', 'docs-search-option-1');
        });

        await test.step('THEN: it closes on Escape and restores focus to the trigger', async () => {
          await page.keyboard.press('Escape');
          await expect(page.getByTestId('docs-search-dialog')).toBeHidden();
          await expect(trigger).toBeFocused();
        });
      });
    });

    test.describe('WHEN: scanning the empty state with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations before typing', async ({ page }) => {
        await page.keyboard.press('ControlOrMeta+KeyK');
        await expect(page.getByTestId('docs-search-dialog')).toBeVisible();
        await waitForDialogEnterAnimations(page);

        await expectNoAxeViolations(page);
      });
    });

    test.describe('WHEN: scanning the results state with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations with results listed', async ({ page }) => {
        await page.keyboard.press('ControlOrMeta+KeyK');
        await page.getByTestId('docs-search-input').fill('pinning');
        await expect(page.getByTestId('docs-search-option').first()).toBeVisible();
        await waitForDialogEnterAnimations(page);

        await expectNoAxeViolations(page);
      });
    });

    test.describe('WHEN: scanning the no-results state with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations with no results', async ({ page }) => {
        await page.keyboard.press('ControlOrMeta+KeyK');
        await page.getByTestId('docs-search-input').fill('zzzznotarealword');
        await expect(page.getByTestId('docs-search-no-results')).toBeVisible();
        await waitForDialogEnterAnimations(page);

        await expectNoAxeViolations(page);
      });
    });
  });

  test.describe('GIVEN: the docs search dialog is fullscreen on a phone-sized touch viewport', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test.describe('WHEN: scanning the fullscreen results state with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations and exposes an accessible close control', async ({ page }) => {
        await page.getByTestId('docs-search-trigger-mobile').tap();
        await page.getByTestId('docs-search-input').fill('pinning');
        await expect(page.getByTestId('docs-search-option').first()).toBeVisible();
        await waitForDialogEnterAnimations(page);

        await expect(page.getByRole('button', { name: 'Close search' })).toBeVisible();
        await expectNoAxeViolations(page);
      });
    });
  });
});
