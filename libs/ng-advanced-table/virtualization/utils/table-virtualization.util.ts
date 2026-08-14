import type { NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualRange, NatTableVirtualizationOptions } from '../common/table-virtualization.type';

/** Default `overscan`: rows mounted beyond each visible edge of the viewport. */
export const NAT_TABLE_DEFAULT_OVERSCAN = 5;

/**
 * Whether `current` is `previous` with rows appended — the only row-model
 * change that leaves every already-visible row exactly where it was, so the
 * mounted window and scroll position survive it.
 *
 * Row IDs are compared structurally so arbitrary consumer IDs cannot erase
 * sequence boundaries. Sorting, filtering, paging, and replaced data rewrite
 * some earlier position and therefore fail the prefix comparison.
 */
export const isAppendedRowSequence = (previous: readonly string[], current: readonly string[]): boolean =>
  current.length >= previous.length &&
  (previous.length > 0 || current.length === 0) &&
  previous.every((rowId, index) => current[index] === rowId);

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

/** Whether the data row at `index` opens a sub-header group (its sub-header renders just above it). */
export const opensSubHeaderGroup = (subHeaderOffsets: readonly number[], index: number): boolean =>
  (subHeaderOffsets[index] ?? 0) > (index > 0 ? (subHeaderOffsets[index - 1] ?? 0) : 0);

/** Composite fixed-grid slot occupied by data row `index`. Strictly increasing. */
export const rowGridSlot = (subHeaderOffsets: readonly number[], index: number): number => index + (subHeaderOffsets[index] ?? 0);

/**
 * Slot where the row's mounted block begins. A group-opening row travels with
 * the sub-header rendered above it, so its block starts one slot higher than
 * the row itself — which is why the window's end bound is measured from here
 * and not from `rowGridSlot`. Also strictly increasing.
 */
export const rowBlockStartSlot = (subHeaderOffsets: readonly number[], index: number): number =>
  rowGridSlot(subHeaderOffsets, index) - (opensSubHeaderGroup(subHeaderOffsets, index) ? 1 : 0);

/**
 * Materializes mounted row indexes as body-local items on the composite fixed
 * row grid. Data row `index` occupies slot `index + subHeaderOffsets[index]`;
 * when it opens a sub-header group, the item's extent grows one slot upward so
 * the mounted block (sub-header + data row) starts at the sub-header's top and
 * the spacer math stays a plain `start`/`end` walk.
 */
export const createVirtualItems = (
  indexes: readonly number[],
  rowHeight: number,
  subHeaderOffsets: readonly number[]
): NatTableVirtualItem[] =>
  indexes.map((index) => ({
    index,
    start: rowBlockStartSlot(subHeaderOffsets, index) * rowHeight,
    end: (rowGridSlot(subHeaderOffsets, index) + 1) * rowHeight
  }));

/** The window mounted before any layout measurement exists (first paint, SSR). */
export const createInitialVirtualRange = (rowCount: number): NatTableVirtualRange => ({
  start: 0,
  end: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT)
});
