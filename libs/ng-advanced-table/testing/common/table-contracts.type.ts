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
  VisibilityState
} from '@tanstack/angular-table';

/**
 * Internal source of truth for normalized table state shared by the published
 * packages. Published entry points must expose local public interfaces so
 * package declarations do not reference this private library.
 */
export type NatTableUserState = {
  readonly sorting: SortingState;
  readonly globalFilter: string;
  readonly columnFilters: ColumnFiltersState;
  readonly columnVisibility: VisibilityState;
  readonly columnOrder: ColumnOrderState;
  readonly columnPinning: ColumnPinningState;
  readonly columnSizing: ColumnSizingState;
  readonly rowSelection: RowSelectionState;
  readonly pagination: PaginationState;
};

/** Semantic tone that can be applied to a rendered body cell. */
type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/** Current sort direction for a header cell. */
type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export type NatTableSortIndicatorContext<TData extends RowData = RowData> = {
  readonly $implicit: NatTableSortDirection;
  readonly sortState: NatTableSortDirection;
  readonly ariaSort: 'ascending' | 'descending' | 'none';
  readonly column: Column<TData, unknown>;
  readonly label: string;
};

/** Value returned by table export metadata before format-specific normalization. */
type NatTableColumnExportValue = unknown;

/** Context passed to column export value callbacks. */
type NatTableColumnExportValueContext<TData extends RowData = RowData, TValue = unknown> = {
  readonly row: Row<TData>;
  readonly column: Column<TData, TValue>;
  readonly value: TValue;
};

/** Export behavior attached to a table column definition. */
type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
  readonly enabled?: boolean;
  readonly header?: string;
  readonly value?: (context: NatTableColumnExportValueContext<TData, TValue>) => NatTableColumnExportValue;
};

/**
 * Shared canonical metadata contract understood by the table, companion UI,
 * and optional utilities.
 */
export type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
  readonly label?: string;
  readonly hiddenHeaderLabel?: string;
  readonly align?: 'start' | 'end';
  readonly rowHeader?: boolean;
  readonly cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
  readonly cellHeight?: number | string;
  readonly cellMaxLines?: number;
  readonly headerSize?: number | string;
  readonly headerMinSize?: number | string;
  readonly headerMaxSize?: number | string;
  readonly export?: NatTableColumnExportOptions<TData, TValue>;
};

/**
 * Minimal table-controller contract consumed by render-metrics helpers.
 */
export type NatTableRenderMetricsController<TData extends RowData = RowData> = {
  readonly table: Table<TData>;
  readonly localeId?: Signal<string>;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void;
};

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export type NatTableUiController<TData extends RowData = RowData> = {
  readonly table: Table<TData>;
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void;
  readonly tableElementId: Signal<string>;
  readonly tableScrollContainer?: Signal<HTMLElement | null>;
  readonly localeId?: Signal<string>;
};
