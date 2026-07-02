import type { FilterFn, RowData } from '@tanstack/angular-table';

import { matchesFilterQuery } from './row-state.util';

export const genericGlobalFilter: FilterFn<RowData> = (row, columnId, filterValue) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase();

  if (!query) {
    return true;
  }

  return matchesFilterQuery(row.getValue(columnId), query) || matchesFilterQuery(row.id, query);
};
