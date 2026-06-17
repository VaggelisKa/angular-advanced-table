import type { Signal } from '@angular/core';
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
  /** Locale id used by generated render-metrics labels, when available. */
  readonly localeId?: Signal<string>;
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
 * TanStack column definitions. This mirrors the workspace's internal contract
 * without exposing a private package to consumers.
 */
export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  /** Accessible label used by companion controls when the header is not a string. */
  label?: string;
  /** Visually hidden header label for utility columns where a visible title would be redundant. */
  hiddenHeaderLabel?: string;
  /** Horizontal alignment for header and body cells in the column. */
  align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  rowHeader?: boolean;
  /** Optional callback that maps a cell to a semantic tone. */
  cellTone?: (
    context: CellContext<TData, TValue>,
  ) => 'positive' | 'negative' | 'neutral' | 'warning' | null;
  /** Optional body-cell height in pixels or any CSS length. Does not affect header cells. */
  cellHeight?: number | string;
  /**
   * Maximum body-cell content lines before truncation. Defaults to 2; set to `Infinity` to disable.
   * Invalid explicit values fall back to 2 lines.
   */
  cellMaxLines?: number;
  /** Optional header-only width in pixels. Does not affect body cells. */
  headerSize?: number | string;
  /** Optional header-only minimum width in pixels. Does not affect body cells. */
  headerMinSize?: number | string;
  /** Optional header-only maximum width in pixels. Does not affect body cells. */
  headerMaxSize?: number | string;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}
}
