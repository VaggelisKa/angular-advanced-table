import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';
import { applyDocumentDirection } from '../support/document-direction';
import { waitForTransitions } from '../support/transitions';

type TableVariant = {
  readonly description: string;
  readonly exampleHeading: string;
  readonly exampleId: string;
  readonly gridName: string;
  readonly path: string;
  readonly testId: string;
  readonly virtualized: boolean;
};

type Overlap = {
  readonly centerColumnId: string;
  readonly pinnedColumnId: string;
  readonly x: number;
  readonly y: number;
};

const TABLE_VARIANTS: readonly TableVariant[] = [
  {
    description: 'the full-row baseline',
    exampleHeading: 'Sorting with pinned columns',
    exampleId: 'sorting-pinned-columns',
    gridName: 'Sortable order table with pinned company and row action columns',
    path: '/docs/sorting',
    stickyHeader: false,
    testId: 'full-row-pinned-table',
    virtualized: false
  },
  {
    description: 'the TanStack virtualized adapter',
    exampleHeading: 'Ten thousand composable rows',
    exampleId: 'virtualization',
    gridName: 'Ten thousand virtualized orders',
    path: '/docs/virtualization',
    stickyHeader: true,
    testId: 'virtualization-table',
    virtualized: true
  }
];

const setHorizontalScroll = async (region: Locator, fraction: number): Promise<void> => {
  await region.evaluate((element, amount) => {
    const maximum = element.scrollWidth - element.clientWidth;

    element.scrollLeft = maximum * amount;
    element.dispatchEvent(new Event('scroll'));
  }, fraction);
};

const findOverlap = async (row: Locator, zone: 'left' | 'right'): Promise<Overlap | null> =>
  row.evaluate((element, pinnedZone) => {
    const pinned = element.querySelector<HTMLElement>(`.is-pinned-${pinnedZone}`);
    const centers = [...element.querySelectorAll<HTMLElement>('[ngGridCell]:not(.is-pinned-left, .is-pinned-right)')];

    if (!pinned) return null;

    const pinnedRect = pinned.getBoundingClientRect();

    for (const center of centers) {
      const centerRect = center.getBoundingClientRect();
      const overlapLeft = Math.max(pinnedRect.left, centerRect.left);
      const overlapRight = Math.min(pinnedRect.right, centerRect.right);
      const overlapTop = Math.max(pinnedRect.top, centerRect.top);
      const overlapBottom = Math.min(pinnedRect.bottom, centerRect.bottom);

      if (overlapRight - overlapLeft > 4 && overlapBottom - overlapTop > 4) {
        return {
          centerColumnId: center.dataset['columnId'] ?? '',
          pinnedColumnId: pinned.dataset['columnId'] ?? '',
          x: overlapLeft + (overlapRight - overlapLeft) / 2,
          y: overlapTop + (overlapBottom - overlapTop) / 2
        };
      }
    }

    return null;
  }, zone);

const resolveOverlap = async (region: Locator, row: Locator, zone: 'left' | 'right'): Promise<Overlap> => {
  // Chromium uses positive offsets for LTR and negative offsets for RTL. Trying
  // both signs keeps this geometry assertion independent of the browser's RTL
  // scroll model while a clamped sign simply leaves the region at its edge.
  for (const fraction of [0, 0.25, -0.25, 0.5, -0.5, 0.75, -0.75, 1, -1]) {
    await setHorizontalScroll(region, fraction);
    const overlap = await findOverlap(row, zone);

    if (overlap) return overlap;
  }

  throw new Error(`Expected a center cell to overlap the ${zone}-pinned zone.`);
};

const expectPinnedAboveCenter = async (page: Page, overlap: Overlap): Promise<void> => {
  const cells = await page.evaluate(({ x, y }) => {
    const seen = new Set<Element>();

    return document
      .elementsFromPoint(x, y)
      .map((element) => element.closest('[ngGridCell]'))
      .filter((element): element is HTMLElement => element instanceof HTMLElement && !seen.has(element) && Boolean(seen.add(element)))
      .map((element) => element.dataset['columnId'] ?? '');
  }, overlap);

  // The geometry helper already proved both cells occupy this point. Chromium
  // may omit a fully covered table cell from the remaining hit-test stack, so
  // the observable paint invariant is that the first grid cell is the pinned one.
  expect(cells.at(0)).toBe(overlap.pinnedColumnId);
};

const focusWithoutScroll = async (cell: Locator): Promise<void> => {
  await cell.evaluate((element) => (element as HTMLElement).focus({ preventScroll: true }));
  await expect.poll(async () => cell.evaluate((element) => element.contains(element.ownerDocument.activeElement))).toBe(true);
  await expect
    .poll(async () => cell.evaluate((element) => element.ownerDocument.activeElement?.matches(':focus-visible') ?? false))
    .toBe(true);
};

const expectVisibleFocusIndicator = async (cell: Locator): Promise<void> => {
  const indicator = await cell.evaluate((element) => {
    const focused = element.ownerDocument.activeElement;
    const style = focused instanceof Element ? getComputedStyle(focused) : null;

    return { boxShadow: style?.boxShadow ?? 'none', outlineStyle: style?.outlineStyle ?? 'none' };
  });

  expect(indicator.boxShadow !== 'none' || indicator.outlineStyle !== 'none').toBe(true);
};

const stackLevel = async (cell: Locator): Promise<number> =>
  cell.evaluate((element) => {
    const value = getComputedStyle(element).zIndex;

    return value === 'auto' ? 0 : Number.parseInt(value, 10);
  });

const expectCompositedPinnedSurface = async (cell: Locator): Promise<void> => {
  const surface = await cell.evaluate((element) => {
    const style = getComputedStyle(element);

    return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
  });

  expect(surface.backgroundColor).toBe('rgb(241, 242, 243)');
  expect(surface.backgroundImage).toContain('linear-gradient');
};

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

  await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
  await expect(grid).toHaveClass(variant.virtualized ? /is-virtualized/ : /data-table/);
  await expect(grid).toHaveClass(variant.stickyHeader ? /has-sticky-header/ : /data-table/);

  if (!variant.virtualized) await expect(grid).not.toHaveClass(/is-virtualized/);

  if (!variant.stickyHeader) await expect(grid).not.toHaveClass(/has-sticky-header/);

  await host.evaluate((element) => {
    const table = element as HTMLElement;

    table.style.inlineSize = '410px';
    table.style.setProperty('--nat-table-pinned-background', 'rgb(241 242 243)');
    table.style.setProperty('--nat-table-pinned-header-background', 'rgb(231 232 233)');
    table.style.setProperty('--nat-table-row-background-focus-pinned', 'rgb(20 40 60 / 20%)');
    table.style.setProperty('--nat-table-row-background-hover-pinned', 'rgb(80 60 40 / 25%)');
  });
  await host.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' }));

  await expect.poll(async () => region.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeGreaterThan(300);

  return { grid, host, region };
};

const verifyPinnedFocusLayers = async (
  page: Page,
  variant: TableVariant,
  direction: 'ltr' | 'rtl',
  colorScheme: 'light' | 'dark'
): Promise<void> => {
  const { grid, host, region } = await loadVariant(page, variant, direction, colorScheme);
  const row = grid.locator('tbody tr.data-row').first();
  const headerRow = grid.locator('thead tr').last();

  if (direction === 'rtl') {
    for (const zone of ['left', 'right'] as const) {
      await test.step(`THEN: the mirrored ${zone}-pinned cells keep their elevated opaque surface and focus indicator`, async () => {
        const center = row.locator('[ngGridCell]:not(.is-pinned-left, .is-pinned-right)').first();
        const pinned = row.locator(`.is-pinned-${zone}`);
        const centerHeader = headerRow.locator('[ngGridCell]:not(.is-pinned-left, .is-pinned-right)').first();
        const pinnedHeader = headerRow.locator(`.is-pinned-${zone}`);

        await focusWithoutScroll(center);
        await waitForTransitions(host);
        await expectCompositedPinnedSurface(pinned);
        await expect.poll(async () => stackLevel(pinned)).toBeGreaterThan(await stackLevel(center));

        await pinned.hover();
        await waitForTransitions(host);
        await expectCompositedPinnedSurface(pinned);
        await focusWithoutScroll(pinned);
        await expectVisibleFocusIndicator(pinned);

        await focusWithoutScroll(centerHeader);
        await expect.poll(async () => stackLevel(pinnedHeader)).toBeGreaterThan(await stackLevel(centerHeader));
        await focusWithoutScroll(pinnedHeader);
        await expectVisibleFocusIndicator(pinnedHeader);
      });
    }

    return;
  }

  for (const zone of ['left', 'right'] as const) {
    await test.step(`THEN: the ${zone}-pinned body cell stays above a focused center cell with an opaque focus and hover surface`, async () => {
      let overlap = await resolveOverlap(region, row, zone);
      const center = row.locator(`[data-column-id="${overlap.centerColumnId}"]`);
      const pinned = row.locator(`[data-column-id="${overlap.pinnedColumnId}"]`);

      await focusWithoutScroll(center);
      await waitForTransitions(host);
      overlap = (await findOverlap(row, zone)) ?? overlap;

      await expectPinnedAboveCenter(page, overlap);
      await expectCompositedPinnedSurface(pinned);

      await pinned.hover();
      await waitForTransitions(host);
      await expectCompositedPinnedSurface(pinned);

      await focusWithoutScroll(pinned);
      await expectVisibleFocusIndicator(pinned);
    });

    await test.step(`THEN: the ${zone}-pinned header stays above a focused center header`, async () => {
      let overlap = await resolveOverlap(region, headerRow, zone);
      const center = headerRow.locator(`[data-column-id="${overlap.centerColumnId}"]`);
      const pinned = headerRow.locator(`[data-column-id="${overlap.pinnedColumnId}"]`);

      await focusWithoutScroll(center);
      overlap = (await findOverlap(headerRow, zone)) ?? overlap;
      await expectPinnedAboveCenter(page, overlap);

      await focusWithoutScroll(pinned);
      await expectVisibleFocusIndicator(pinned);
    });
  }
};

test.describe('FEATURE: Pinned column focus layers', () => {
  for (const variant of TABLE_VARIANTS) {
    test.describe(`GIVEN: ${variant.description} in a narrow horizontally scrolled region`, () => {
      test.describe('WHEN: center cells receive keyboard focus in LTR light mode', () => {
        test('THEN: pinned body and header cells remain the opaque top paint layer', async ({ page }) => {
          await verifyPinnedFocusLayers(page, variant, 'ltr', 'light');
        });
      });

      test.describe('WHEN: center cells receive keyboard focus in RTL dark mode', () => {
        test('THEN: pinned body and header cells remain the opaque top paint layer', async ({ page }) => {
          await verifyPinnedFocusLayers(page, variant, 'rtl', 'dark');
        });
      });
    });
  }
});
