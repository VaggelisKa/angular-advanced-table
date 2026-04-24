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
  /** Leaf-column order, restored when columns are unpinned. */
  columnOrder: ColumnOrderState;
  /** Left and right pinned column ids. */
  columnPinning: ColumnPinningState;
  /** Pagination cursor and page size. */
  pagination: PaginationState;
}

/** Fixed-size row virtualization options for {@link NatTable}. */
export interface NatTableVirtualizationOptions {
  /**
   * Fixed row height in CSS pixels.
   *
   * When omitted, the table measures the first rendered body row and falls
   * back to a conservative default until that measurement is available.
   */
  rowHeight?: number;
  /**
   * Maximum number of body rows kept mounted at once.
   *
   * Defaults to `50`.
   */
  maxRenderedRows?: number;
}

/** Context passed to custom table summary formatters. */
export interface NatTableAccessibilitySummaryContext {
  /** Rows currently rendered in the body. */
  visibleRowsValue: number;
  /** Browser-locale text for `visibleRowsValue`. */
  visibleRowsText: string;
  /** Total rows supplied to the table before filtering/pagination. */
  totalRowsValue: number;
  /** Browser-locale text for `totalRowsValue`. */
  totalRowsText: string;
  /** Visible leaf columns in the current view. */
  visibleColumnsValue: number;
  /** Browser-locale text for `visibleColumnsValue`. */
  visibleColumnsText: string;
  /** Zero-based current page index. */
  pageIndex: number;
  /** One-based current page number. */
  pageValue: number;
  /** Browser-locale text for `pageValue`. */
  pageText: string;
  /** Total available pages. */
  pageCountValue: number;
  /** Browser-locale text for `pageCountValue`. */
  pageCountText: string;
  /** Whether the current view is filtered. */
  filterState: 'filtered' | 'unfiltered';
  /** Whether client-side pagination is enabled. */
  paginationState: 'enabled' | 'disabled';
}

/** Context passed to custom sort announcement formatters. */
export interface NatTableAccessibilitySortingAnnouncementContext {
  /** Sorted column id when sorting is active. */
  columnId: string | null;
  /** Resolved human-readable column label when sorting is active. */
  columnLabel: string | null;
  /** Active ARIA sort state. */
  sortState: 'ascending' | 'descending' | 'none';
}

/** Context passed to custom filtering announcement formatters. */
export interface NatTableAccessibilityFilteringAnnouncementContext {
  /** Trimmed global filter query. */
  query: string;
  /** Which filtering inputs are currently active. */
  filterState: 'none' | 'global' | 'column' | 'global-and-column';
  /** Rows currently rendered after filtering/pagination. */
  visibleRowsValue: number;
  /** Browser-locale text for `visibleRowsValue`. */
  visibleRowsText: string;
  /** Total rows supplied to the table before filtering. */
  totalRowsValue: number;
  /** Browser-locale text for `totalRowsValue`. */
  totalRowsText: string;
}

/** Single column change entry passed to visibility announcement formatters. */
export interface NatTableAccessibilityColumnVisibilityAnnouncementChange {
  /** TanStack column id. */
  id: string;
  /** Resolved human-readable column label. */
  label: string;
  /** Next visibility state for the column. */
  visibilityState: 'visible' | 'hidden';
}

/** Context passed to custom column-visibility announcement formatters. */
export interface NatTableAccessibilityColumnVisibilityAnnouncementContext {
  /** Columns whose visibility changed in the last update. */
  changedColumns: readonly NatTableAccessibilityColumnVisibilityAnnouncementChange[];
  /** Visible column count after the change. */
  visibleColumnsValue: number;
  /** Browser-locale text for `visibleColumnsValue`. */
  visibleColumnsText: string;
  /** Total leaf-column count. */
  totalColumnsValue: number;
  /** Browser-locale text for `totalColumnsValue`. */
  totalColumnsText: string;
}

/** Context passed to custom pagination announcement formatters. */
export interface NatTableAccessibilityPaginationAnnouncementContext {
  /** Zero-based current page index. */
  pageIndex: number;
  /** One-based current page number. */
  pageValue: number;
  /** Browser-locale text for `pageValue`. */
  pageText: string;
  /** Total available pages. */
  pageCountValue: number;
  /** Browser-locale text for `pageCountValue`. */
  pageCountText: string;
  /** Current page size. */
  pageSizeValue: number;
  /** Browser-locale text for `pageSizeValue`. */
  pageSizeText: string;
  /** Rows currently rendered in the body. */
  visibleRowsValue: number;
  /** Browser-locale text for `visibleRowsValue`. */
  visibleRowsText: string;
}

/** Context passed to custom column-reorder announcement formatters. */
export interface NatTableAccessibilityColumnReorderAnnouncementContext {
  /** TanStack column id. */
  columnId: string;
  /** Resolved human-readable column label. */
  label: string;
  /** Reorder zone for the column. */
  zone: 'left' | 'center' | 'right';
  /** One-based position within the zone after the move. */
  positionValue: number;
  /** Browser-locale text for `positionValue`. */
  positionText: string;
  /** Total visible columns in the zone. */
  totalValue: number;
  /** Browser-locale text for `totalValue`. */
  totalText: string;
}

/** Optional overrides for built-in screen-reader summaries and announcements. */
export interface NatTableAccessibilityText {
  /** Extra reorder instructions appended when column reordering is enabled. */
  reorderKeyboardInstructions?: string;
  /** Summary announced through `aria-describedby` for the rendered grid. */
  tableSummary?: (context: NatTableAccessibilitySummaryContext) => string;
  /** Live announcement emitted when sorting changes. */
  sortingChange?: (context: NatTableAccessibilitySortingAnnouncementContext) => string;
  /** Live announcement emitted when filtering changes. */
  filteringChange?: (context: NatTableAccessibilityFilteringAnnouncementContext) => string;
  /** Live announcement emitted when column visibility changes. */
  columnVisibilityChange?: (
    context: NatTableAccessibilityColumnVisibilityAnnouncementContext,
  ) => string;
  /** Live announcement emitted when the page size changes. */
  pageSizeChange?: (context: NatTableAccessibilityPaginationAnnouncementContext) => string;
  /** Live announcement emitted when the page index changes. */
  pageChange?: (context: NatTableAccessibilityPaginationAnnouncementContext) => string;
  /** Live announcement emitted when a column is reordered. */
  columnReorder?: (context: NatTableAccessibilityColumnReorderAnnouncementContext) => string;
}

/** Semantic tone that can be applied to a rendered body cell. */
export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/** Current sort direction for a header cell. */
export type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export interface NatTableSortIndicatorContext<TData extends RowData = RowData> {
  /** Alias for `sortState`, useful for `let-state` style template bindings. */
  $implicit: NatTableSortDirection;
  /** Current TanStack sort direction for the column. */
  sortState: NatTableSortDirection;
  /** ARIA token applied to the header cell. */
  ariaSort: 'ascending' | 'descending' | 'none';
  /** TanStack column instance for advanced custom indicators. */
  column: Column<TData, unknown>;
  /** Resolved human-readable label for the column. */
  label: string;
}

/**
 * Extra metadata understood by `<nat-table>` when attached to a TanStack
 * column definition or optional companion UI.
 */
export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  /** Accessible label used by companion controls when the header is not a string. */
  label?: string;
  /** Horizontal alignment for header and body cells in the column. */
  align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  rowHeader?: boolean;
  /** Optional callback that maps a cell to a semantic tone class. */
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}
}
