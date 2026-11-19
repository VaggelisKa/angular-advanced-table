import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures
} from '@tanstack/angular-table';

import type { NatTableFeatures } from '../common/table-features.type';
import { natGetSortedRowModel } from '../utils/sorted-row-model.util';

/**
 * The one TanStack v9 feature set shared by every table instance. Defined once
 * at module scope: v9 expects a stable `features` object, and its keys decide
 * which row, column, and table APIs exist at all.
 */
export const NAT_TABLE_FEATURES: NatTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: natGetSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns,
  sortFns
});
