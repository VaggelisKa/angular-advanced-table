import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ExpandedState,
  PaginationState,
  Row,
  RowData,
  SortingState,
  Table,
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
  /** Expanded row ids keyed by the resolved row id. */
  expanded: ExpandedState;
}

/** Expanded row state shape emitted through `NatTableState`. */
export type NatTableExpandedState = ExpandedState;

/** Predicate used to decide whether a row can render expandable detail content. */
export type NatTableRowExpandablePredicate<TData extends RowData = RowData> = (
  row: TData,
  index: number,
) => boolean;

/**
 * Stable row id resolver passed to `getRowId`. Matches TanStack Table's
 * `getRowId(originalRow, index, parentRow?)` shape so consumers can key
 * sub-rows consistently when they enable nested features later.
 */
export type NatTableRowIdGetter<TData extends RowData = RowData> = (
  row: TData,
  index: number,
  parent?: Row<TData>,
) => string;

/**
 * Payload emitted by `(rowActivate)` when a body row is activated through a
 * primary click or an Enter / Space key press.
 *
 * The originating event is forwarded so consumers can call
 * `event.preventDefault()` or read modifier keys without re-deriving them.
 * The table only fires this event for activations that did not originate
 * from an interactive descendant (button, link, form control, menu item,
 * `contenteditable`), so cell-level controls keep their own behavior.
 */
export interface NatTableRowActivateEvent<TData extends RowData = RowData> {
  /** Original row object supplied in `data`. */
  rowData: TData;
  /** TanStack row instance for advanced interactions. */
  row: Row<TData>;
  /** Pointer or keyboard event that triggered the activation. */
  originalEvent: MouseEvent | KeyboardEvent;
}

/** Context exposed to expanded-row `TemplateRef`s. */
export interface NatTableExpandedRowContext<TData extends RowData = RowData> {
  /** Alias for `rowData` so templates can use `let-rowData`. */
  $implicit: TData;
  /** Original row object supplied in `data`. */
  rowData: TData;
  /** TanStack row instance for advanced interactions. */
  row: Row<TData>;
  /** Owning table instance. */
  table: Table<TData>;
  /** Collapses the current row. */
  collapse: () => void;
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
  /** Sorted column id, or `null` when sorting is cleared. */
  columnId: string | null;
  /** Resolved human-readable column label, or `null`. */
  columnLabel: string | null;
  /** Active ARIA sort state for the sorted column, or `'none'` when cleared. */
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
  /**
   * Supplemental description announced through `aria-describedby` when the
   * grid receives focus. Set to an empty string to suppress the description.
   */
  description?: string;
  /**
   * Screen-reader instructions for grid keyboard navigation. Falls back to a
   * built-in English default when omitted. Set to an empty string to suppress
   * the instructions.
   */
  keyboardInstructions?: string;
  /**
   * Visible message rendered in the body when the current view contains no
   * rows. Falls back to a built-in English default when omitted.
   */
  emptyState?: string;
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
