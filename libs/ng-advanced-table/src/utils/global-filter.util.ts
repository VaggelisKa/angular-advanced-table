import type { FilterFn, RowData } from '@tanstack/angular-table';

import { matchesFilterQuery } from './row-state.util';

// One-entry memos for TanStack's per-column calls: the query and the row-id
// match. Object filter values are not memoized since they can be mutated.
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
