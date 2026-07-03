import type { ColumnOrderState, ColumnPinningState, ColumnSizingState, PaginationState } from '@tanstack/angular-table';

import type { NatTableUserState } from './table-state.type';

const EMPTY_COLUMN_PINNING: ColumnPinningState = {
  left: [],
  right: []
};
const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10
};
const DEFAULT_COLUMN_ORDER: ColumnOrderState = [];
const EMPTY_COLUMN_SIZING: ColumnSizingState = {};

/** @internal */
export const DEFAULT_TABLE_STATE: NatTableUserState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnOrder: DEFAULT_COLUMN_ORDER,
  columnPinning: EMPTY_COLUMN_PINNING,
  columnSizing: EMPTY_COLUMN_SIZING,
  rowSelection: {},
  pagination: DEFAULT_PAGINATION
};
