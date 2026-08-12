import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { constrainPinnedTable, expectPinnedCellAbove, expectPinnedSurfaceComposited } from '../support/pinned-cell-layering';
import { waitForTransitions } from '../support/transitions';

test.describe('FEATURE: Column pinning accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/column-layout');
    await loadDocsExamplePreview(page, 'column-pinning', 'Column pinning');
  });

  test.describe('GIVEN: the column pinning example is loaded', () => {
    test.describe('WHEN: keyboard activates pinning controls', () => {
      test('THEN: it renders pinning controls and applies column pinning styles via keyboard only', async ({ page }) => {
        const nameControl = page.getByTestId('pinning-column-name');
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

    test.describe('WHEN: the column pinning example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-column-pinning-preview-panel"]');
      });
    });

    test.describe('WHEN: keyboard focus remains on a center cell during horizontal scrolling', () => {
      test('THEN: both pinned zones stay opaque and paint above the focused full-row cell', async ({ page }) => {
        const preview = page.getByTestId('docs-example-column-pinning-preview-panel');
        const surface = preview.locator('nat-table-surface');
        const region = preview.getByTestId('nat-table-region');
        const table = preview.getByRole('grid', { name: 'Pinning demo table' });
        const firstRow = table.locator('tbody tr[data-row-index="0"]');
        const centerCell = firstRow.locator('[data-column-id="category"]');
        const centerHeader = table.locator('thead [data-column-id="category"]');
        const leftPinnedCell = firstRow.locator('[data-column-id="name"]');
        const rightPinnedCell = firstRow.locator('[data-column-id="value"]');

        await constrainPinnedTable(surface);
        await centerCell.focus();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowLeft');

        await test.step('THEN: the left pin zone covers the focused center cell at the far scroll edge', async () => {
          await region.evaluate((element) => {
            element.scrollLeft = 80;
            element.dispatchEvent(new Event('scroll'));
          });

          await expect(centerCell).toBeFocused();
          await expectPinnedCellAbove(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]'
          );
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '31, 111, 235'
          );
        });

        await test.step('THEN: the right pin zone covers the focused center cell at the opposite scroll edge', async () => {
          await region.evaluate((element) => {
            element.scrollLeft = 0;
            element.dispatchEvent(new Event('scroll'));
          });

          await expect(centerCell).toBeFocused();
          await expectPinnedCellAbove(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="value"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]'
          );
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="value"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '31, 111, 235'
          );
        });

        await test.step('THEN: pinned headers cover the focused center header in non-sticky mode', async () => {
          await centerHeader.focus();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowLeft');
          await region.evaluate((element) => {
            element.scrollLeft = 80;
            element.dispatchEvent(new Event('scroll'));
          });

          await expect(centerHeader).toBeFocused();
          await expectPinnedCellAbove(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] thead [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] thead [data-column-id="category"]'
          );

          await region.evaluate((element) => {
            element.scrollLeft = 0;
            element.dispatchEvent(new Event('scroll'));
          });
          await expectPinnedCellAbove(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] thead [data-column-id="value"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] thead [data-column-id="category"]'
          );
        });

        await test.step('THEN: hover remains an overlay over the opaque pinned base', async () => {
          await region.evaluate((element) => {
            element.scrollLeft = 80;
            element.dispatchEvent(new Event('scroll'));
          });
          await leftPinnedCell.hover();
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '199, 32, 64'
          );
        });

        await test.step('THEN: dark stock and theme-less neutral pinned bases remain opaque', async () => {
          await page.getByRole('heading', { name: 'Column pinning' }).hover();
          await centerCell.focus();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowLeft');
          await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '31, 111, 235'
          );

          await surface.evaluate((element) => {
            const host = element as HTMLElement;

            host.style.setProperty('--nat-table-pinned-background', 'initial');
            host.style.setProperty('--nat-table-header-background', 'initial');
            host.style.setProperty('--nat-table-color-surface-sticky', 'initial');
          });
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '31, 111, 235'
          );
        });

        await test.step('THEN: both pin zones remain above focused center content in RTL', async () => {
          await page.getByTestId('pinning-direction').getByRole('button', { name: 'RTL' }).click();
          await expect(table).toHaveAttribute('dir', 'rtl');
          await centerCell.focus();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowLeft');

          await expect(centerCell).toBeFocused();
          await expect.poll(async () => centerCell.evaluate((element) => getComputedStyle(element).zIndex)).toBe('auto');
          await expect.poll(async () => leftPinnedCell.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
          await expect.poll(async () => rightPinnedCell.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');
          await expect
            .poll(async () => leftPinnedCell.evaluate((element) => Number(getComputedStyle(element).zIndex)))
            .toBeGreaterThan(0);
          await expect
            .poll(async () => rightPinnedCell.evaluate((element) => Number(getComputedStyle(element).zIndex)))
            .toBeGreaterThan(0);
          await expect.poll(async () => centerCell.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="name"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '31, 111, 235'
          );
          await expectPinnedSurfaceComposited(
            page,
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="value"]',
            '[data-testid="docs-example-column-pinning-preview-panel"] tbody tr:first-child [data-column-id="category"]',
            '31, 111, 235'
          );
        });

        await test.step('THEN: a focused pinned cell keeps its inset visible focus indicator', async () => {
          await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
          await surface.evaluate((element) => {
            const host = element as HTMLElement;

            host.style.removeProperty('--nat-table-pinned-background');
            host.style.removeProperty('--nat-table-header-background');
            host.style.removeProperty('--nat-table-color-surface-sticky');
          });
          await leftPinnedCell.focus();
          await page.keyboard.press('ArrowRight');
          await page.keyboard.press('ArrowLeft');

          await expect(leftPinnedCell).toBeFocused();
          await expect.poll(async () => leftPinnedCell.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
          await expect(rightPinnedCell).toBeVisible();
          await waitForTransitions(preview);
          await expectNoAxeViolations(page, '[data-testid="docs-example-column-pinning-preview-panel"]');
        });
      });
    });
  });
});
