import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { emulateForcedColors, paintedColorsOf } from '../support/media';
import { waitForTransitions } from '../support/transitions';

const PREVIEW_PANEL = '[data-testid="docs-example-theme-example-preview-panel"]';

const loadThemingExample = async (page: Page): Promise<void> => {
  await page.goto('/docs/theming');
  await loadDocsExamplePreview(page, 'theme-example', 'Theme example');
};

test.describe('FEATURE: Theming accessibility', () => {
  test.describe('GIVEN: the theming example is loaded in the light theme', () => {
    test.use({ colorScheme: 'light' });

    test.beforeEach(async ({ page }) => {
      await loadThemingExample(page);
    });

    test.describe('WHEN: the themed example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations, including colour contrast', async ({ page }) => {
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });
  });

  // The showcase resolves its initial theme from `prefers-color-scheme` when no
  // theme has been persisted, so emulating the dark scheme is enough to put the
  // themed table into its dark palette. Contrast is the reason this pairing
  // exists: `theming.e2e.ts` asserts token inheritance but never checks that the
  // resulting colours clear the WCAG AA contrast floor in the dark palette.
  test.describe('GIVEN: the theming example is loaded in the dark theme', () => {
    test.use({ colorScheme: 'dark' });

    test.beforeEach(async ({ page }) => {
      await loadThemingExample(page);
    });

    test.describe('WHEN: the themed example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations, including colour contrast', async ({ page }) => {
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });

    test.describe('WHEN: the theme is switched back to light from the keyboard', () => {
      test('THEN: it applies the light theme and stays free of WCAG A/AA violations', async ({ page }) => {
        const lightThemeButton = page.getByRole('button', { name: 'Use light theme' });

        await lightThemeButton.focus();
        await page.keyboard.press('Enter');

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        await expect(lightThemeButton).toHaveAttribute('aria-pressed', 'true');

        // Theme swaps transition `background-color` over 120ms. Scanning mid-transition
        // reads a blended background against the already-swapped foreground and reports
        // a contrast violation that does not survive the transition settling.
        await waitForTransitions(page.locator(PREVIEW_PANEL));

        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });
  });

  test.describe('GIVEN: a viewer using a forced-colors (high contrast) mode', () => {
    test.beforeEach(async ({ page }) => {
      await emulateForcedColors(page);
      await loadThemingExample(page);
    });

    test.describe('WHEN: the themed example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations under forced colors', async ({ page }) => {
        await expectNoAxeViolations(page, PREVIEW_PANEL);
      });
    });

    test.describe('WHEN: the themed table is displayed', () => {
      // The consumer theme's custom properties are NOT force-adjusted, so a themed
      // colour can survive into forced-colors mode and land on top of the forced
      // background. Assert the painted pair differs rather than mere visibility.
      test('THEN: header and body cell text stays legible against the forced background', async ({ page }) => {
        const table = page.getByRole('grid', { name: 'Themed orders table' });

        const header = await paintedColorsOf(table.getByTestId('nat-table-header-id'));
        const cell = await paintedColorsOf(table.getByRole('rowheader', { name: 'ORD-10000' }));

        expect(header.color).not.toBe(header.background);
        expect(cell.color).not.toBe(cell.background);
      });
    });
  });
});
