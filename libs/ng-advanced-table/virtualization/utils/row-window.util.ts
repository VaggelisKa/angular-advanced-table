import type { NatTableVirtualRange, NatTableVirtualRangeContext } from '../common/table-virtualization.type';

/**
 * Smallest data-row index whose composite slot (`index + subHeaderOffsets[index]`,
 * strictly increasing) is at least `slot`. Returns `rowCount` when no row
 * reaches the slot, mirroring a lower-bound binary search.
 */
const lowerBoundBySlot = (subHeaderOffsets: readonly number[], rowCount: number, slot: number): number => {
  let low = 0;
  let high = rowCount;

  while (low < high) {
    const middle = (low + high) >>> 1;

    if (middle + (subHeaderOffsets[middle] ?? 0) < slot) {
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
 * half the overscan remains mounted beyond each visible edge (edges clamped by
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
  const firstVisible = Math.min(rowCount - 1, lowerBoundBySlot(subHeaderOffsets, rowCount, firstSlot));
  const lastVisible = Math.max(firstVisible + 1, Math.min(rowCount, lowerBoundBySlot(subHeaderOffsets, rowCount, lastSlot)));
  const keepRows = Math.max(1, Math.floor(overscan / 2));
  const startSettled = currentRange.start === 0 ? firstVisible >= 0 : currentRange.start + keepRows <= firstVisible;
  const endSettled = currentRange.end === rowCount ? lastVisible <= rowCount : currentRange.end - keepRows >= lastVisible;

  if (currentRange.start >= 0 && currentRange.end <= rowCount && startSettled && endSettled) {
    return { start: currentRange.start, end: currentRange.end };
  }

  return {
    start: Math.max(0, firstVisible - overscan),
    end: Math.min(rowCount, lastVisible + overscan)
  };
};
