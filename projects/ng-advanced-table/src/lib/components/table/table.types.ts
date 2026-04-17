import type {
  CellContext,
  ColumnFiltersState,
  ColumnPinningState,
  PaginationState,
  RowData,
  SortingState,
  VisibilityState,
} from '@tanstack/angular-table';

/**
 * Serializable view state exposed by {@link NatTable} and emitted through
 * `stateChange`.
 */
export interface NatTableState {
  /** Active single-column sort order. */
  sorting: SortingState;
  /** Current global search query. */
  globalFilter: string;
  /** Active column filters keyed by TanStack column id. */
  columnFilters: ColumnFiltersState;
  /** Visibility map for hideable columns. */
  columnVisibility: VisibilityState;
  /** Left and right pinned column ids. */
  columnPinning: ColumnPinningState;
  /** Pagination cursor and page size. */
  pagination: PaginationState;
}

/** Semantic tone that can be applied to a rendered body cell. */
export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/**
 * Extra metadata understood by `<nat-table>` when attached to a TanStack
 * column definition or optional companion UI.
 */
export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  /** Accessible label used by companion controls when the header is not a string. */
  label?: string;
  /** Horizontal alignment for header and body cells in the column. */
  align?: 'start' | 'end';
  /** Optional callback that maps a cell to a semantic tone class. */
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}
}
