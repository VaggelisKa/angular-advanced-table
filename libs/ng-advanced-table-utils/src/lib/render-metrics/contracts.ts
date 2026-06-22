import type { Signal } from '@angular/core';

import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
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
export type NatTableRenderMetricsState = {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  columnSizing: ColumnSizingState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
}

/**
 * Minimal controller contract required by the render-metrics helpers.
 *
 * This keeps the utils package structurally compatible with `NatTable` or any
 * custom wrapper that exposes the same `table` instance and `patchState(...)`
 * behavior.
 */
export type NatTableRenderMetricsController<TData extends RowData = RowData> = {
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
export type NatTableRenderMetricsEvent = {
  /** Stable row identifier emitted by the table. */
  rowId: string;
  /** Render-cycle token used to group timings from the same paint. */
  renderToken: number;
  /** Elapsed render duration for the row, in milliseconds. */
  durationMs: number;
}

/** Value returned by table export metadata before format-specific normalization. */
export type NatTableColumnExportValue = unknown;

/** Context passed to column export value callbacks. */
export type NatTableColumnExportValueContext<
  TData extends RowData = RowData,
  TValue = unknown,
> = {
  /** Row being exported. */
  readonly row: Row<TData>;
  /** Column being exported. */
  readonly column: Column<TData, TValue>;
  /** Raw value resolved from the row and column before export-specific normalization. */
  readonly value: TValue;
}

/** Export behavior attached to a table column definition. */
export type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
  /** Whether the column participates in table export. Accessor columns opt in by default. */
  readonly enabled?: boolean;
  /** Header text used by export formats. Defaults to column labels and identifiers. */
  readonly header?: string;
  /** Maps a row/column value into an export value. Defaults to the raw accessor value. */
  readonly value?: (
    context: NatTableColumnExportValueContext<TData, TValue>,
  ) => NatTableColumnExportValue;
}

/**
 * Column metadata shape shared by the render-metrics helpers when augmenting
 * TanStack column definitions. This mirrors the workspace's internal contract
 * without exposing a private package to consumers.
 */
export type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
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
  /** Optional table export behavior for this column. */
  export?: NatTableColumnExportOptions<TData, TValue>;
}

declare module '@tanstack/table-core' {
  // Module augmentation requires an interface; the empty body merges our metadata into ColumnMeta.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface ColumnMeta<TData extends RowData, TValue>
    extends NatTableColumnMeta<TData, TValue> {}
}
