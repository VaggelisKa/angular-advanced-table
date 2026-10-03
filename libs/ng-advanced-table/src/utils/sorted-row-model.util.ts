import type { ColumnDefBase, Row, RowData, RowModel, SortingFn, SortingState, Table } from '@tanstack/angular-table';
import { getMemoOptions, getSortedRowModel, memo } from '@tanstack/angular-table';

import { resolveKeyedSortingFn } from './sort-key.util';

/**
 * A resolved sort entry for one column. Values and keys are read lazily per
 * row index, so a row's accessor only runs when a comparison needs it (as in
 * TanStack): never for consumer sorting functions without `sortUndefined`,
 * and never for secondary columns when earlier columns break every tie.
 */
type ResolvedSortEntry<TData extends RowData> = {
  readonly id: string;
  readonly desc: boolean;
  readonly invertSorting: boolean;
  readonly sortUndefined: ColumnDefBase<TData>['sortUndefined'];
  readonly value: (index: number) => unknown;
  readonly key: ((index: number) => unknown) | null;
  readonly compareKeys: ((a: unknown, b: unknown) => number) | null;
  readonly sortingFn: SortingFn<TData>;
};

const NOT_READ: unique symbol = Symbol('notRead');

/** Memoizes `read(index)` per row index, calling it at most once per index. */
const lazyByIndex = (length: number, read: (index: number) => unknown): ((index: number) => unknown) => {
  const cache: unknown[] = new Array<unknown>(length).fill(NOT_READ);

  return (index) => {
    let value = cache[index];

    if (value === NOT_READ) {
      value = read(index);
      cache[index] = value;
    }

    return value;
  };
};

const resolveSortEntries = <TData extends RowData>(
  table: Table<TData>,
  sorting: SortingState,
  rows: readonly Row<TData>[]
): ResolvedSortEntry<TData>[] => {
  const entries: ResolvedSortEntry<TData>[] = [];

  for (const sort of sorting) {
    const column = table.getColumn(sort.id);

    if (!column?.getCanSort()) {
      continue;
    }

    const sortingFn = column.getSortingFn();
    const keyed = resolveKeyedSortingFn(sortingFn);
    const value = lazyByIndex(rows.length, (index) => rows[index].getValue(sort.id));

    entries.push({
      id: sort.id,
      desc: sort.desc,
      invertSorting: column.columnDef.invertSorting ?? false,
      sortUndefined: column.columnDef.sortUndefined,
      value,
      key: keyed ? lazyByIndex(rows.length, (index) => keyed.toKey(value(index))) : null,
      compareKeys: keyed?.compare ?? null,
      sortingFn
    });
  }

  return entries;
};

/**
 * TanStack's `sortUndefined` handling when either value is undefined: a
 * placement that bypasses direction (`'first'`/`'last'`), a directional order
 * (`1`/`-1`), or `null` to compare the values normally.
 */
const compareUndefined = (
  sortUndefined: ColumnDefBase<RowData>['sortUndefined'],
  aUndefined: boolean,
  bUndefined: boolean
): { readonly order: number; readonly placement: boolean } | null => {
  if (!sortUndefined || (!aUndefined && !bUndefined)) {
    return null;
  }

  if (sortUndefined === 'first' || sortUndefined === 'last') {
    return { order: aUndefined === (sortUndefined === 'first') ? -1 : 1, placement: true };
  }

  if (aUndefined && bUndefined) {
    return null;
  }

  return { order: aUndefined ? sortUndefined : -sortUndefined, placement: false };
};

const compareValues = <TData extends RowData>(
  entry: ResolvedSortEntry<TData>,
  rows: readonly Row<TData>[],
  a: number,
  b: number
): number =>
  entry.key && entry.compareKeys ? entry.compareKeys(entry.key(a), entry.key(b)) : entry.sortingFn(rows[a], rows[b], entry.id);

const compareEntry = <TData extends RowData>(
  entry: ResolvedSortEntry<TData>,
  rows: readonly Row<TData>[],
  a: number,
  b: number
): number => {
  const undefinedOrder = entry.sortUndefined
    ? compareUndefined(entry.sortUndefined, entry.value(a) === undefined, entry.value(b) === undefined)
    : null;

  if (undefinedOrder?.placement) {
    return undefinedOrder.order;
  }

  const result = undefinedOrder?.order ?? compareValues(entry, rows, a, b);
  const direction = (entry.desc ? -1 : 1) * (entry.invertSorting ? -1 : 1);

  return result === 0 ? 0 : result * direction;
};

const sortFlatRows = <TData extends RowData>(
  table: Table<TData>,
  sorting: SortingState,
  rowModel: RowModel<TData>
): RowModel<TData> => {
  const rows = rowModel.rows;
  const entries = resolveSortEntries(table, sorting, rows);
  const order = rows.map((_, index) => index);

  order.sort((a, b) => {
    for (const entry of entries) {
      const result = compareEntry(entry, rows, a, b);

      if (result !== 0) {
        return result;
      }
    }

    return rows[a].index - rows[b].index;
  });

  const sortedRows = order.map((index) => rows[index]);

  return { rows: sortedRows, flatRows: sortedRows, rowsById: rowModel.rowsById };
};

/**
 * Drop-in replacement for TanStack's `getSortedRowModel()` for flat row
 * models. Same order, same `sortUndefined`/`invertSorting`/multi-sort and
 * stable-index semantics, but:
 *
 * - rows are not cloned (TanStack spreads every row object on each sort,
 *   doubling row memory and dominating sort time on large datasets);
 * - built-in sorting functions compare keys derived once per row instead of
 *   re-reading values (and re-splitting alphanumeric strings) per comparison.
 *
 * Consumer sorting functions run unchanged against the row objects. Row
 * models with sub-rows fall back to TanStack's implementation.
 */
export const natGetSortedRowModel =
  <TData extends RowData>(): ((table: Table<TData>) => () => RowModel<TData>) =>
  (table) => {
    const fallback = getSortedRowModel<TData>()(table);

    return memo(
      () => [table.getState().sorting, table.getPreSortedRowModel()],
      (sorting: SortingState, rowModel: RowModel<TData>) => {
        if (!rowModel.rows.length || !sorting.length) {
          return rowModel;
        }

        if (rowModel.rows.some((row) => row.subRows.length > 0)) {
          return fallback();
        }

        return sortFlatRows(table, sorting, rowModel);
      },
      // eslint-disable-next-line no-underscore-dangle -- TanStack's own page-index reset hook, called exactly as its sorted row model does.
      getMemoOptions(table.options, 'debugTable', 'getSortedRowModel', () => table._autoResetPageIndex())
    );
  };
