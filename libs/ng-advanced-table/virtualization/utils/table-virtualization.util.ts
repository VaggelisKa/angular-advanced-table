import type { NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualRange, NatTableVirtualizationOptions } from '../common/table-virtualization.type';

/** Default `overscan`: rows mounted beyond each visible edge of the viewport. */
export const NAT_TABLE_DEFAULT_OVERSCAN = 5;

export const NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT = 10;

/**
 * Clamps the consumer options to usable values: a non-positive row height
 * falls back to `1`, a negative or non-finite overscan falls back to the
 * default, and a fractional overscan is floored (the directive warns for the
 * invalid shapes in development builds).
 */
export const normalizeNatTableVirtualizationOptions = (
  options: NatTableVirtualizationOptions
): Required<NatTableVirtualizationOptions> => ({
  rowHeight: Number.isFinite(options.rowHeight) && options.rowHeight > 0 ? options.rowHeight : 1,
  overscan:
    Number.isFinite(options.overscan) && (options.overscan ?? -1) >= 0
      ? Math.floor(options.overscan as number)
      : NAT_TABLE_DEFAULT_OVERSCAN
});

export const includeVirtualIndex = (indexes: readonly number[], index: number | null, count: number): number[] => {
  if (index === null || index < 0 || index >= count || indexes.includes(index)) {
    return [...indexes];
  }

  return [...indexes, index].sort((left, right) => left - right);
};

/** The mounted row indexes of a range, clamped to the logical row count. */
export const rangeToRowIndexes = (range: NatTableVirtualRange, rowCount: number): number[] => {
  const start = Math.max(0, Math.min(range.start, rowCount));
  const end = Math.max(start, Math.min(range.end, rowCount));

  return Array.from({ length: end - start }, (_, offset) => start + offset);
};

/** Materializes mounted row indexes as body-local items on the fixed row grid. */
export const createVirtualItems = (indexes: readonly number[], rowHeight: number): NatTableVirtualItem[] =>
  indexes.map((index) => ({
    index,
    start: index * rowHeight,
    end: (index + 1) * rowHeight
  }));

/** The window mounted before any layout measurement exists (first paint, SSR). */
export const createInitialVirtualRange = (rowCount: number): NatTableVirtualRange => ({
  start: 0,
  end: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT)
});
