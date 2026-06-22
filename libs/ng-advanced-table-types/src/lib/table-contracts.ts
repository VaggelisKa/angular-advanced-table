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
  VisibilityState,
} from '@tanstack/angular-table';

/**
 * Internal source of truth for normalized table state shared by the published
 * packages. Published entry points must expose local public interfaces so
 * package declarations do not reference this private library.
 */
export type NatTableState = {
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

/** Semantic tone that can be applied to a rendered body cell. */
export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/** Current sort direction for a header cell. */
export type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export type NatTableSortIndicatorContext<TData extends RowData = RowData> = {
  $implicit: NatTableSortDirection;
  sortState: NatTableSortDirection;
  ariaSort: 'ascending' | 'descending' | 'none';
  column: Column<TData, unknown>;
  label: string;
}

/** Value returned by table export metadata before format-specific normalization. */
export type NatTableColumnExportValue = unknown;

/** Context passed to column export value callbacks. */
export type NatTableColumnExportValueContext<
  TData extends RowData = RowData,
  TValue = unknown,
> = {
  readonly row: Row<TData>;
  readonly column: Column<TData, TValue>;
  readonly value: TValue;
}

/** Export behavior attached to a table column definition. */
export type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
  readonly enabled?: boolean;
  readonly header?: string;
  readonly value?: (
    context: NatTableColumnExportValueContext<TData, TValue>,
  ) => NatTableColumnExportValue;
}

/**
 * Shared canonical metadata contract understood by the table, companion UI,
 * and optional utilities.
 */
export type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
  label?: string;
  hiddenHeaderLabel?: string;
  align?: 'start' | 'end';
  rowHeader?: boolean;
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
  cellHeight?: number | string;
  cellMaxLines?: number;
  headerSize?: number | string;
  headerMinSize?: number | string;
  headerMaxSize?: number | string;
  export?: NatTableColumnExportOptions<TData, TValue>;
}
