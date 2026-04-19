import type {
  CellContext,
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

export interface NatTableRenderMetricsState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

export interface NatTableRenderMetricsController<TData extends RowData = RowData> {
  readonly table: Table<TData>;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableRenderMetricsState]: Updater<NatTableRenderMetricsState[K]>;
    }>,
  ): void;
}

export interface NatTableRenderMetricsEvent {
  rowId: string;
  renderToken: number;
  durationMs: number;
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
