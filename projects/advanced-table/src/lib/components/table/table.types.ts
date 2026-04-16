import type {
  CellContext,
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  RowData,
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

export type AdvancedTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

export interface AdvancedTableColumnMeta<
  TData extends RowData = RowData,
  TValue = unknown,
> {
  label?: string;
  align?: 'start' | 'end';
  cellTone?: (context: CellContext<TData, TValue>) => AdvancedTableCellTone | null;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends import('@tanstack/angular-table').RowData, TValue>
    extends AdvancedTableColumnMeta<TData, TValue> {}
}
