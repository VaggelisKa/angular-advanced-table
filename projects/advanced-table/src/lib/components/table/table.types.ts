import type {
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/angular-table';

export interface AdvancedTableState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

export interface AdvancedTableColumnMeta {
  label?: string;
  align?: 'start' | 'end';
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends import('@tanstack/angular-table').RowData, TValue>
    extends AdvancedTableColumnMeta {}
}
