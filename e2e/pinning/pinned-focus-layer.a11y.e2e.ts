import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { applyDocumentDirection } from '../support/document-direction';
import { emulateForcedColors, focusIndicatorOf } from '../support/media';

type TableVariant = {
  readonly description: string;
  readonly exampleHeading: string;
  readonly exampleId: string;
  readonly gridName: string;
  readonly path: string;
  readonly testId: string;
};

const TABLE_VARIANTS: readonly TableVariant[] = [
  {
    description: 'the full-row baseline',
    exampleHeading: 'Sorting with pinned columns',
    exampleId: 'sorting-pinned-columns',
    gridName: 'Sortable order table with pinned company and row action columns',
    path: '/docs/sorting',
    testId: 'full-row-pinned-table'
  },
  {
    description: 'the TanStack virtualized adapter',
    exampleHeading: 'Ten thousand composable rows',
    exampleId: 'virtualization',
    gridName: 'Ten thousand virtualized orders',
    path: '/docs/virtualization',
    testId: 'virtualization-table'
  }
];

const loadVariant = async (
  page: Page,
  variant: TableVariant,
  direction: 'ltr' | 'rtl',
  colorScheme: 'light' | 'dark'
): Promise<{ grid: Locator; host: Locator; region: Locator }> => {
  await page.setViewportSize({ width: 474, height: 900 });
  await page.emulateMedia({ colorScheme });
  await applyDocumentDirection(page, direction);
  await page.goto(variant.path);
  await loadDocsExamplePreview(page, variant.exampleId, variant.exampleHeading);

  const host = page.getByTestId(variant.testId);
  const grid = host.getByRole('grid', { name: variant.gridName });
  const region = host.getByTestId('nat-table-region');

  await host.evaluate((element) => {
    const table = element as HTMLElement;

    table.style.inlineSize = '410px';
  });
  await host.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' }));
  await region.evaluate((element, rtl) => {
    const maximum = element.scrollWidth - element.clientWidth;

    element.scrollLeft = (rtl ? -1 : 1) * maximum * 0.5;
    element.dispatchEvent(new Event('scroll'));
  }, direction === 'rtl');

  return { grid, host, region };
};

const focusBodyCell = async (cell: Locator): Promise<void> => {
  await cell.evaluate((element) => (element as HTMLElement).focus({ preventScroll: true }));
  await expect.poll(async () => cell.evaluate((element) => element.contains(element.ownerDocument.activeElement))).toBe(true);
  await expect
    .poll(async () => cell.evaluate((element) => element.ownerDocument.activeElement?.matches(':focus-visible') ?? false))
    .toBe(true);
};

test.describe('FEATURE: Pinned focus-layer accessibility', () => {
  for (const variant of TABLE_VARIANTS) {
    test.describe(`GIVEN: ${variant.description} is narrow and horizontally scrolled`, () => {
      test.describe('WHEN: a center cell receives keyboard focus in LTR light mode', () => {
        test('THEN: the rendered variant has no WCAG A/AA violations', async ({ page }) => {
          const { grid, host } = await loadVariant(page, variant, 'ltr', 'light');
          const center = grid
            .locator('tbody tr.data-row')
            .first()
            .locator('[ngGridCell]:not(.is-pinned-left, .is-pinned-right)')
            .first();

          await expectNoAxeViolations(page, `[data-testid="${variant.testId}"]`);
          await expect(host).toBeVisible();
          await focusBodyCell(center);
        });
      });

      test.describe('WHEN: a center cell receives keyboard focus in RTL dark mode', () => {
        test('THEN: the mirrored rendered variant has no WCAG A/AA violations', async ({ page }) => {
          const { grid } = await loadVariant(page, variant, 'rtl', 'dark');
          const center = grid
            .locator('tbody tr.data-row')
            .first()
            .locator('[ngGridCell]:not(.is-pinned-left, .is-pinned-right)')
            .first();

          await expectNoAxeViolations(page, `[data-testid="${variant.testId}"]`);
          await focusBodyCell(center);
        });
      });

      test.describe('WHEN: a pinned cell receives focus in forced-colors mode', () => {
        test('THEN: its inset focus indicator remains visible', async ({ page }) => {
          const { grid } = await loadVariant(page, variant, 'ltr', 'light');

          await emulateForcedColors(page);
          const pinned = grid.locator('tbody tr.data-row').first().locator('.is-pinned-left');

          await focusBodyCell(pinned);
          const indicator = await focusIndicatorOf(pinned);

          expect(indicator.outlineStyle).toBe('solid');
          expect(indicator.outlineWidthPx).toBeGreaterThanOrEqual(2);
          await expectNoAxeViolations(page, `[data-testid="${variant.testId}"]`);
        });
      });
    });
  }
});
