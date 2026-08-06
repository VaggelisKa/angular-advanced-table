import type { Row, RowData, SortingFn, SortingState } from '@tanstack/angular-table';

import type { NatTableSubHeaderGroup } from '../common/sub-header.type';

/**
 * Prepends the forced ascending sub-header entry to the user sorting. Returns
 * the input unchanged (same reference) when no sub-header column is active.
 * A user entry for the same column is dropped so the forced entry stays primary.
 */
export const prependForcedSortingEntry = (userSorting: SortingState, columnId: string | null): SortingState => {
  if (columnId === null) {
    return userSorting;
  }

  return [{ id: columnId, desc: false }, ...userSorting.filter((entry) => entry.id !== columnId)];
};

/**
 * Removes the forced sub-header entry from a TanStack-facing sorting state,
 * yielding the user-visible sorting. Preserves the input reference when the
 * forced entry is absent.
 */
export const stripNatTableSubHeaderSorting = (sorting: SortingState, columnId: string | null): SortingState => {
  if (columnId === null) {
    return sorting;
  }

  const stripped = sorting.filter((entry) => entry.id !== columnId);

  return stripped.length === sorting.length ? sorting : stripped;
};

/** Numeric ascending compare with NaN sorted last. */
const compareNumbersAscending = (a: number, b: number): number => {
  if (Number.isNaN(a)) {
    return Number.isNaN(b) ? 0 : 1;
  }

  if (Number.isNaN(b)) {
    return -1;
  }

  if (a === b) {
    return 0;
  }

  return a > b ? 1 : -1;
};

/**
 * Natural ascending compare used for values outside the configured order:
 * numbers compare numerically, everything else by case-insensitive string.
 */
const compareNaturalAscending = (a: unknown, b: unknown): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return compareNumbersAscending(a, b);
  }

  const aText = String(a ?? '').toLowerCase();
  const bText = String(b ?? '').toLowerCase();

  if (aText === bText) {
    return 0;
  }

  return aText > bText ? 1 : -1;
};

/** Rank of a value in the configured order; unlisted values rank after every listed one. */
const resolveOrderRank = (order: readonly unknown[], value: unknown): number => {
  // findIndex + Object.is instead of indexOf, so a listed NaN still matches.
  const rank = order.findIndex((candidate) => Object.is(candidate, value));

  return rank === -1 ? order.length : rank;
};

/**
 * Builds the TanStack sorting function for a consumer-supplied sub-header
 * value order. Listed values sort in array order; unlisted values sort after
 * all listed ones in natural ascending order. Equal listed ranks compare as
 * equal so secondary user sort entries decide the order within a group.
 */
export const createSubHeaderOrderSortingFn = <TData extends RowData>(order: readonly unknown[]): SortingFn<TData> => {
  return (rowA, rowB, columnId) => {
    const valueA = rowA.getValue(columnId);
    const valueB = rowB.getValue(columnId);
    const rankA = resolveOrderRank(order, valueA);
    const rankB = resolveOrderRank(order, valueB);

    if (rankA !== rankB) {
      return rankA < rankB ? -1 : 1;
    }

    return rankA === order.length ? compareNaturalAscending(valueA, valueB) : 0;
  };
};

/**
 * Maps each page row that starts a sub-header group segment (the first page
 * row, or any row whose sub-header value differs from the previous row) to its
 * group. Keyed by the starting row's id so the template can look segments up
 * during row iteration. Group row counts come from the pre-pagination rows so
 * a group spanning pages reports its full size.
 */
export const buildSubHeaderRowGroups = <TData extends RowData>(
  pageRows: readonly Row<TData>[],
  prePaginationRows: readonly Row<TData>[],
  columnId: string
): ReadonlyMap<string, NatTableSubHeaderGroup<TData>> => {
  const groups = new Map<string, NatTableSubHeaderGroup<TData>>();

  if (!pageRows.length) {
    return groups;
  }

  // Map keys use SameValueZero, so a NaN group still counts correctly.
  const groupRowCounts = new Map<unknown, number>();

  for (const row of prePaginationRows) {
    const value = row.getValue(columnId);

    groupRowCounts.set(value, (groupRowCounts.get(value) ?? 0) + 1);
  }

  let previousValue: unknown;
  let hasPreviousValue = false;

  for (const row of pageRows) {
    const value = row.getValue(columnId);

    if (!hasPreviousValue || !Object.is(value, previousValue)) {
      groups.set(row.id, { value, rowCountValue: groupRowCounts.get(value) ?? 0, row });
    }

    previousValue = value;
    hasPreviousValue = true;
  }

  return groups;
};

/** Human-readable text for a sub-header group value used in generated announcement copy. */
export const resolveSubHeaderValueText = (value: unknown): string => (value == null ? '' : String(value));
