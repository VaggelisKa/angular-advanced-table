import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
  RowData,
  SortingState,
  VisibilityState,
} from '@tanstack/angular-table';

/**
 * Internal source of truth for normalized table state shared by the published
 * packages. Published entry points must expose local public interfaces so
 * package declarations do not reference this private library.
 */
export interface NatTableState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

/** Semantic tone that can be applied to a rendered body cell. */
export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/** Current sort direction for a header cell. */
export type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export interface NatTableSortIndicatorContext<TData extends RowData = RowData> {
  $implicit: NatTableSortDirection;
  sortState: NatTableSortDirection;
  ariaSort: 'ascending' | 'descending' | 'none';
  column: Column<TData, unknown>;
  label: string;
}

/**
 * Shared canonical metadata contract understood by the table, companion UI,
 * and optional utilities.
 */
export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  label?: string;
  hiddenHeaderLabel?: string;
  align?: 'start' | 'end';
  rowHeader?: boolean;
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
  headerSize?: number | string;
  headerMinSize?: number | string;
  headerMaxSize?: number | string;
  /** Declarative display formatting; used for cells without an explicit `cell` renderer. */
  valueFormatter?: (context: { value: TValue; row: TData; locale: string }) => string;
}
