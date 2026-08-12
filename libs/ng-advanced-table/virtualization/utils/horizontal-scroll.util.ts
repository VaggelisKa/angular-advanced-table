/*
 * Pin-aware horizontal reveal, deliberately local rather than a generalization
 * of core's reorder-only `scrollElementHorizontallyIntoView`: how much this
 * feature adds to core is its weakest axis, and cross-window focus recovery is
 * the only caller needing pin-zone geometry today. Accepted gap: non-virtualized
 * tables keep the original, pin-unaware reveal. Promote when a second caller
 * earns it.
 */

type HorizontalBounds = { readonly left: number; readonly right: number };

const resolveUnpinnedBounds = (table: HTMLTableElement, regionRect: DOMRect): HorizontalBounds | null => {
  const pinnedLeft = table.querySelector<HTMLElement>('thead .has-pinned-edge-left')?.getBoundingClientRect();
  const pinnedRight = table.querySelector<HTMLElement>('thead .has-pinned-edge-right')?.getBoundingClientRect();
  let visibleLeft = regionRect.left;
  let visibleRight = regionRect.right;

  if (pinnedLeft && pinnedLeft.left <= regionRect.left + 1) {
    visibleLeft = Math.min(pinnedLeft.right, regionRect.right);
  }

  if (pinnedRight && pinnedRight.right >= regionRect.right - 1) {
    visibleRight = Math.max(pinnedRight.left, regionRect.left);
  }

  return visibleLeft < visibleRight ? { left: visibleLeft, right: visibleRight } : null;
};

const resolveHorizontalDelta = (table: HTMLTableElement, cellRect: DOMRect, bounds: HorizontalBounds): number => {
  const visibleWidth = bounds.right - bounds.left;

  if (cellRect.width > visibleWidth) {
    return table.dir === 'rtl' ? cellRect.right - bounds.right : cellRect.left - bounds.left;
  }

  if (cellRect.left < bounds.left) {
    return cellRect.left - bounds.left;
  }

  if (cellRect.right > bounds.right) {
    return cellRect.right - bounds.right;
  }

  return 0;
};

export const scrollNatTableCellHorizontallyIntoView = (region: HTMLElement, cell: HTMLElement): void => {
  const table = cell.closest<HTMLTableElement>('table');

  if (!table || cell.matches('.is-pinned-left, .is-pinned-right')) {
    return;
  }

  const bounds = resolveUnpinnedBounds(table, region.getBoundingClientRect());

  if (!bounds) {
    return;
  }

  const delta = resolveHorizontalDelta(table, cell.getBoundingClientRect(), bounds);

  if (delta !== 0) {
    region.scrollLeft += delta;
  }
};
