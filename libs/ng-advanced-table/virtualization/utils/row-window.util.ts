import { rowBlockStartSlot, rowGridSlot } from './table-virtualization.util';
import type { NatTableVirtualRange, NatTableVirtualRangeContext } from '../common/table-virtualization.type';

/**
 * Smallest data-row index whose `slotOf` value is at least `slot`. Returns
 * `rowCount` when no row reaches it, mirroring a lower-bound binary search.
 * `slotOf` must be strictly increasing, which both slot mappings are.
 */
export const lowerBoundBySlot = (rowCount: number, slot: number, slotOf: (index: number) => number): number => {
  let low = 0;
  let high = rowCount;

  while (low < high) {
    const middle = (low + high) >>> 1;

    if (slotOf(middle) < slot) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low;
};

/**
 * The library's own row-windowing algorithm, operating on body-local offsets
 * over the table's existing scroll container.
 *
 * Windowing runs on the composite fixed-height grid: data row `i` occupies
 * slot `i + subHeaderOffsets[i]`, so any sub-header row rendered before a
 * group-opening row shifts every later row down one slot. Without sub-headers
 * the slot is the index and the math collapses to plain division.
 *
 * The mounted window is the visible row span extended by `overscan` rows on
 * each side. Hysteresis: an already-mounted window is kept as long as at least
 * half the overscan (minimum one row) remains mounted beyond each visible edge (edges clamped by
 * the data count always as settled). Scrolling therefore re-renders in
 * half-overscan batches instead of on every frame.
 */
export const computeNatTableRowWindow = (context: NatTableVirtualRangeContext): NatTableVirtualRange => {
  const { scrollOffset, viewportSize, rowHeight, rowCount, currentRange, overscan, subHeaderOffsets } = context;

  if (rowCount === 0 || rowHeight <= 0) {
    return { start: 0, end: 0 };
  }

  const firstSlot = Math.max(0, Math.floor(scrollOffset / rowHeight));
  const lastSlot = Math.ceil((scrollOffset + viewportSize) / rowHeight);
  const firstVisible = Math.min(
    rowCount - 1,
    lowerBoundBySlot(rowCount, firstSlot, (index) => rowGridSlot(subHeaderOffsets, index))
  );
  // Block starts, not row slots: a group opener's sub-header sits one slot
  // above it, so measuring from the row drops that row when its sub-header is
  // the last visible slot — a blank strip when no overscan absorbs it.
  const lastVisible = Math.max(
    firstVisible + 1,
    Math.min(
      rowCount,
      lowerBoundBySlot(rowCount, lastSlot, (index) => rowBlockStartSlot(subHeaderOffsets, index))
    )
  );
  const keepRows = Math.max(1, Math.floor(overscan / 2));
  // Unsettled once an edge is too close, or once the window is far wider than
  // the viewport needs — a shrunken region would otherwise keep every mounted
  // row until the reader scrolls past an edge.
  const isSettled =
    currentRange.end <= rowCount &&
    currentRange.end - currentRange.start <= lastVisible - firstVisible + 2 * overscan + keepRows &&
    (currentRange.start === 0 || currentRange.start + keepRows <= firstVisible) &&
    (currentRange.end === rowCount || currentRange.end - keepRows >= lastVisible);

  if (isSettled) {
    return { start: currentRange.start, end: currentRange.end };
  }

  return {
    start: Math.max(0, firstVisible - overscan),
    end: Math.min(rowCount, lastVisible + overscan)
  };
};
