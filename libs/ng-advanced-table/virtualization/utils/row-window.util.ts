import type { NatTableVirtualRange, NatTableVirtualRangeContext } from '../common/table-virtualization.type';

/**
 * The library's own row-windowing algorithm, operating on body-local offsets
 * over the table's existing scroll container.
 *
 * The mounted window is the visible row span extended by `overscan` rows on
 * each side. Hysteresis: an already-mounted window is kept as long as at least
 * half the overscan remains mounted beyond each visible edge (edges clamped by
 * the data count always as settled). Scrolling therefore re-renders in
 * half-overscan batches instead of on every frame.
 */
export const computeNatTableRowWindow = (context: NatTableVirtualRangeContext): NatTableVirtualRange => {
  const { scrollOffset, viewportSize, rowHeight, rowCount, currentRange, overscan } = context;

  if (rowCount === 0 || rowHeight <= 0) {
    return { start: 0, end: 0 };
  }

  const firstVisible = Math.min(rowCount - 1, Math.max(0, Math.floor(scrollOffset / rowHeight)));
  const lastVisible = Math.max(firstVisible + 1, Math.min(rowCount, Math.ceil((scrollOffset + viewportSize) / rowHeight)));
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
