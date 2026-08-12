import type { NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualRange, NatTableVirtualizationOptions } from '../common/table-virtualization.type';

/** Default `overscan`: rows mounted beyond each visible edge of the viewport. */
export const NAT_TABLE_DEFAULT_OVERSCAN = 5;

/**
 * Delimiter joining row ids into one comparable sequence. U+001F (unit
 * separator) is a control character, so no practical row id contains one.
 */
export const NAT_TABLE_ROW_ID_SEPARATOR = '\u001F';

/**
 * Whether `current` is `previous` with rows appended — the only row-model
 * change that leaves every already-visible row exactly where it was, so the
 * mounted window and scroll position survive it.
 *
 * A true append can only extend the joined sequence; sorting, filtering,
 * paging, and replaced data all rewrite some earlier part of it.
 */
export const isAppendedRowSequence = (previous: string, current: string): boolean =>
  current === previous || (previous !== '' && current.startsWith(previous + NAT_TABLE_ROW_ID_SEPARATOR));

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
  indexes.map((index) => {
    const slot = index + (subHeaderOffsets[index] ?? 0);

    return {
      index,
      start: (slot - (opensSubHeaderGroup(subHeaderOffsets, index) ? 1 : 0)) * rowHeight,
      end: (slot + 1) * rowHeight
    };
  });

/** The window mounted before any layout measurement exists (first paint, SSR). */
export const createInitialVirtualRange = (rowCount: number): NatTableVirtualRange => ({
  start: 0,
  end: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT)
});
