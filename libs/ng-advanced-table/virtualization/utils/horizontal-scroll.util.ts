/*
 * Pin-aware horizontal reveal, deliberately local rather than a generalization
 * of core's reorder-only `scrollElementHorizontallyIntoView`: how much this
 * feature adds to core is its weakest axis, and cross-window focus recovery is
 * the only caller needing pin-zone geometry today. Accepted gap: non-virtualized
 * tables keep the original, pin-unaware reveal. Promote when a second caller
 * earns it.
 */

import { queryOwnedNatTableElements } from './table-ownership.util';

type HorizontalBounds = { readonly left: number; readonly right: number };

const resolveUnpinnedBounds = (host: HTMLElement, regionRect: DOMRect): HorizontalBounds | null => {
  // Ownership-scoped: a bare descendant query finds a nested table's pinned
  // header whenever this table has no pinned columns of its own, and the
  // reveal would then be computed against the wrong pin zone.
  const pinnedLeft = queryOwnedNatTableElements<HTMLElement>(host, 'thead .has-pinned-edge-left').at(0)?.getBoundingClientRect();
  const pinnedRight = queryOwnedNatTableElements<HTMLElement>(host, 'thead .has-pinned-edge-right').at(0)?.getBoundingClientRect();
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
  const host = cell.closest<HTMLElement>('nat-table');

  if (!table || !host || cell.matches('.is-pinned-left, .is-pinned-right')) {
    return;
  }

  const bounds = resolveUnpinnedBounds(host, region.getBoundingClientRect());

  if (!bounds) {
    return;
  }

  const delta = resolveHorizontalDelta(table, cell.getBoundingClientRect(), bounds);

  if (delta !== 0) {
    region.scrollLeft += delta;
  }
};
