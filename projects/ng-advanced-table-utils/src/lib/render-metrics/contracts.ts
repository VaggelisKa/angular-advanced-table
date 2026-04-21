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

/**
 * Serializable table-state shape expected by the render-metrics helpers.
 *
 * The contract mirrors the slices the filter helper may patch, including
 * column ordering and pinning.
 */
export interface NatTableRenderMetricsState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

/**
 * Minimal controller contract required by the render-metrics helpers.
 *
 * This keeps the utils package structurally compatible with `NatTable` or any
 * custom wrapper that exposes the same `table` instance and `patchState(...)`
 * behavior.
 */
export interface NatTableRenderMetricsController<TData extends RowData = RowData> {
  readonly table: Table<TData>;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableRenderMetricsState]: Updater<NatTableRenderMetricsState[K]>;
    }>,
  ): void;
}

/** Event payload consumed by `NatTableRenderMetricsStore.record(...)`. */
export interface NatTableRenderMetricsEvent {
  /** Stable row identifier emitted by the table. */
  rowId: string;
  /** Render-cycle token used to group timings from the same paint. */
  renderToken: number;
  /** Elapsed render duration for the row, in milliseconds. */
  durationMs: number;
}

/**
 * Column metadata shape shared by the render-metrics helpers when augmenting
 * TanStack column definitions.
 */
export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  /** Accessible label used by companion controls when the header is not a string. */
  label?: string;
  /** Horizontal alignment for header and body cells in the column. */
  align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  rowHeader?: boolean;
  /** Optional callback that maps a cell to a semantic tone-like value. */
  cellTone?: (context: CellContext<TData, TValue>) => unknown;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}
}
