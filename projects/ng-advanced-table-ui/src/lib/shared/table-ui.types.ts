import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
  RowData,
  SortingState,
  Table,
  Updater,
  VisibilityState,
} from '@tanstack/angular-table';

export interface NatTableUiState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

export interface NatTableUiController<TData extends RowData = RowData> {
  readonly table: Table<TData>;
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableUiState]: Updater<NatTableUiState[K]>;
    }>,
  ): void;
  tableElementId(): string;
}

export type NatTableSortDirection = 'asc' | 'desc' | false;

export interface NatTableSortIndicatorContext<TData extends RowData = RowData> {
  $implicit: NatTableSortDirection;
  sortState: NatTableSortDirection;
  ariaSort: 'ascending' | 'descending' | 'none';
  column: Column<TData, unknown>;
  label: string;
}

export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  label?: string;
  align?: 'start' | 'end';
  rowHeader?: boolean;
  cellTone?: (context: CellContext<TData, TValue>) => unknown;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}
}
