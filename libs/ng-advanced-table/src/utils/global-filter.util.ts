import type { FilterFn, RowData } from '@tanstack/angular-table';

import { matchesFilterQuery } from './row-state.util';

// TanStack calls the global filter once per column of every row with the same
// filter value, and walks one row's columns consecutively. These one-entry
// memos keep that hot loop from re-normalizing the query on every call and
// from re-matching the row id once per column. Both memos are keyed on plain
// values only, so they never change what the filter returns or retain rows;
// an object filter value is normalized on every call, because the same
// reference can stringify differently after the consumer mutates it.
let lastFilterValue: unknown = undefined;
let lastQuery = '';
let lastRowId: string | null = null;
let lastIdQuery = '';
let lastIdMatch = false;

const toQuery = (filterValue: unknown): string =>
  String(filterValue ?? '')
    .trim()
    .toLowerCase();

const normalizeQuery = (filterValue: unknown): string => {
  if ((typeof filterValue === 'object' && filterValue !== null) || typeof filterValue === 'function') {
    return toQuery(filterValue);
  }

  if (filterValue !== lastFilterValue) {
    lastFilterValue = filterValue;
    lastQuery = toQuery(filterValue);
  }

  return lastQuery;
};

const rowIdMatches = (rowId: string, query: string): boolean => {
  if (rowId !== lastRowId || query !== lastIdQuery) {
    lastRowId = rowId;
    lastIdQuery = query;
    lastIdMatch = matchesFilterQuery(rowId, query);
  }

  return lastIdMatch;
};

export const genericGlobalFilter: FilterFn<RowData> = (row, columnId, filterValue) => {
  const query = normalizeQuery(filterValue);

  if (!query) {
    return true;
  }

  return matchesFilterQuery(row.getValue(columnId), query) || rowIdMatches(row.id, query);
};
