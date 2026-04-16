import type {
  CellContext,
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  RowData,
  SortingState,
  VisibilityState,
} from '@tanstack/angular-table';

export interface NatTableState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

export interface NatTableColumnMeta<
  TData extends RowData = RowData,
  TValue = unknown,
> {
  label?: string;
  align?: 'start' | 'end';
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends import('@tanstack/angular-table').RowData, TValue>
    extends NatTableColumnMeta<TData, TValue> {}
}
