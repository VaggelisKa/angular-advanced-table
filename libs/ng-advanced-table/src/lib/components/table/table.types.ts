import type { Signal } from '@angular/core';
import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
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
  /** Pagination cursor and page size. */
  pagination: PaginationState;
  /** Visibility map for hideable columns. */
  columnVisibility: VisibilityState;
  /** Leaf-column order, restored when columns are unpinned. */
  columnOrder: ColumnOrderState;
  /** Left and right pinned column ids. */
  columnPinning: ColumnPinningState;
  /** Selected row ids keyed by `getRowId`. */
  rowSelection: RowSelectionState;
}

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

/** Data lifecycle state rendered by `<nat-table>` when rows are unavailable. */
export type NatTableDataStatus = 'loading' | 'error' | 'success';

/** Horizontal direction used by built-in and custom column-reorder controls. */
export type NatTableColumnMoveDirection = 'left' | 'right';

/** Named data lifecycle states accepted by `<nat-table>`. */
export const NAT_TABLE_DATA_STATUS = {
  loading: 'loading',
  error: 'error',
  success: 'success',
} as const satisfies Record<NatTableDataStatus, NatTableDataStatus>;

/** State row currently rendered in the table body. */
export type NatTableBodyState = 'rows' | 'loading' | 'empty' | 'error';

/** Named state rows rendered in the table body. */
export const NAT_TABLE_BODY_STATE = {
  rows: 'rows',
  loading: 'loading',
  empty: 'empty',
  error: 'error',
} as const satisfies Record<NatTableBodyState, NatTableBodyState>;

/** Shared context passed to custom table body state templates. */
export interface NatTableStateTemplateContext<TData extends RowData = RowData> {
  /** TanStack table instance for advanced reads. */
  table: Table<TData>;
  /** Rows currently rendered in the body. */
  visibleRowsValue: number;
  /** Total rows represented by the current body state before filtering/pagination. */
  totalRowsValue: number;
  /** Visible leaf columns in the current view. */
  visibleColumnsValue: number;
  /** Whether the current view is filtered by global or column filters. */
  filtered: boolean;
}

/** Context passed to `ng-template[natTableLoading]`. */
export interface NatTableLoadingTemplateContext<
  TData extends RowData = RowData,
> extends NatTableStateTemplateContext<TData> {
  /** Alias for `status`, useful for `let-status` style template bindings. */
  $implicit: typeof NAT_TABLE_BODY_STATE.loading;
  /** Current state row status. */
  status: typeof NAT_TABLE_BODY_STATE.loading;
}

/** Context passed to `ng-template[natTableEmpty]`. */
export interface NatTableEmptyTemplateContext<
  TData extends RowData = RowData,
> extends NatTableStateTemplateContext<TData> {
  /** Alias for `status`, useful for `let-status` style template bindings. */
  $implicit: typeof NAT_TABLE_BODY_STATE.empty;
  /** Current state row status. */
  status: typeof NAT_TABLE_BODY_STATE.empty;
}

/** Context passed to `ng-template[natTableError]`. */
export interface NatTableErrorTemplateContext<
  TData extends RowData = RowData,
> extends NatTableStateTemplateContext<TData> {
  /** Alias for `error`, useful for `let-error` style template bindings. */
  $implicit: unknown;
  /** Current state row status. */
  status: typeof NAT_TABLE_BODY_STATE.error;
  /** Consumer-supplied error payload. */
  error: unknown;
}

/** Context passed to custom table summary formatters. */
export interface NatTableAccessibilitySummaryContext {
  /** Rows currently rendered in the body. */
  visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  visibleRowsText: string;
  /** Total rows represented by the current body state before filtering/pagination. */
  totalRowsValue: number;
  /** Provider-formatted text for `totalRowsValue`. */
  totalRowsText: string;
  /** Visible leaf columns in the current view. */
  visibleColumnsValue: number;
  /** Provider-formatted text for `visibleColumnsValue`. */
  visibleColumnsText: string;
  /** Zero-based current page index. */
  pageIndex: number;
  /** One-based current page number. */
  pageValue: number;
  /** Provider-formatted text for `pageValue`. */
  pageText: string;
  /** Total available pages. */
  pageCountValue: number;
  /** Provider-formatted text for `pageCountValue`. */
  pageCountText: string;
  /** Whether the current view is filtered. */
  filterState: 'filtered' | 'unfiltered';
  /** Whether client-side pagination is enabled. */
  paginationState: 'enabled' | 'disabled';
}

/** Single active sort entry passed to sort announcement formatters. */
export type NatTableAccessibilitySortingAnnouncementEntry = {
  /** TanStack column id. */
  readonly id: string;
  /** Resolved human-readable column label. */
  readonly label: string;
  /** Active sort direction for the column. */
  readonly sortState: 'ascending' | 'descending';
};

/** Context passed to custom sort announcement formatters. */
export interface NatTableAccessibilitySortingAnnouncementContext {
  /** Sorted column id, or `null` when sorting is cleared. */
  columnId: string | null;
  /** Resolved human-readable column label, or `null`. */
  columnLabel: string | null;
  /** Active ARIA sort state for the sorted column, or `'none'` when cleared. */
  sortState: 'ascending' | 'descending' | 'none';
  /** All active sort entries in priority order; more than one during a multi-sort. */
  sortedColumns: readonly NatTableAccessibilitySortingAnnouncementEntry[];
}

/** Context passed to custom filtering announcement formatters. */
export interface NatTableAccessibilityFilteringAnnouncementContext {
  /** Trimmed global filter query. */
  query: string;
  /** Which filtering inputs are currently active. */
  filterState: 'none' | 'global' | 'column' | 'global-and-column';
  /** Rows currently rendered after filtering/pagination. */
  visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  visibleRowsText: string;
  /** Total rows represented by the current body state before filtering. */
  totalRowsValue: number;
  /** Provider-formatted text for `totalRowsValue`. */
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
  /** Provider-formatted text for `visibleColumnsValue`. */
  visibleColumnsText: string;
  /** Total leaf-column count. */
  totalColumnsValue: number;
  /** Provider-formatted text for `totalColumnsValue`. */
  totalColumnsText: string;
}

/** Context passed to custom pagination announcement formatters. */
export interface NatTableAccessibilityPaginationAnnouncementContext {
  /** Zero-based current page index. */
  pageIndex: number;
  /** One-based current page number. */
  pageValue: number;
  /** Provider-formatted text for `pageValue`. */
  pageText: string;
  /** Total available pages. */
  pageCountValue: number;
  /** Provider-formatted text for `pageCountValue`. */
  pageCountText: string;
  /** Current page size. */
  pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  pageSizeText: string;
  /** Rows currently rendered in the body. */
  visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  visibleRowsText: string;
}

/** Context passed to custom row-selection announcement formatters. */
export type NatTableAccessibilitySelectionAnnouncementContext = {
  /** Number of currently selected rows. */
  readonly selectedCountValue: number;
  /** Browser-locale text for `selectedCountValue`. */
  readonly selectedCountText: string;
  /** Total rows supplied to the table. */
  readonly totalRowsValue: number;
  /** Browser-locale text for `totalRowsValue`. */
  readonly totalRowsText: string;
};

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
  /** Provider-formatted text for `positionValue`. */
  positionText: string;
  /** Total visible columns in the zone. */
  totalValue: number;
  /** Provider-formatted text for `totalValue`. */
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
  /**
   * Visible message rendered in the body while initial rows are loading.
   * Falls back to a built-in English default when omitted.
   */
  loadingState?: string;
  /**
   * Visible message rendered in the body when the table is in an error state.
   * Falls back to a built-in English default when omitted.
   */
  errorState?: string;
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
  /** Live announcement emitted when the row selection changes. */
  selectionChange?: (context: NatTableAccessibilitySelectionAnnouncementContext) => string;
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

/** Value returned by table export metadata before format-specific normalization. */
export type NatTableColumnExportValue = unknown;

/** Context passed to column export value callbacks. */
export interface NatTableColumnExportValueContext<
  TData extends RowData = RowData,
  TValue = unknown,
> {
  /** Row being exported. */
  readonly row: Row<TData>;
  /** Column being exported. */
  readonly column: Column<TData, TValue>;
  /** Raw value resolved from the row and column before export-specific normalization. */
  readonly value: TValue;
}

/** Export behavior attached to a table column definition. */
export interface NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> {
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
 * Extra metadata understood by `<nat-table>` when attached to a TanStack
 * column definition or optional companion UI.
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
  /** Optional callback that maps a cell to a semantic tone class. */
  cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
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
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}

  interface TableMeta<TData extends import('@tanstack/angular-table').RowData> {
    /** Current table locale id exposed to companion header controls. */
    natTableLocaleId?: string;
    /** Returns whether a visible column can move within its current pinned region. */
    natTableCanMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => boolean;
    /** Moves a visible column within its current pinned region and announces the change. */
    natTableMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => void;
  }
}

export type NatTableMode = 'auto' | 'manual';

export interface NatTableModeConfiguration {
  pagination?: NatTableMode;
  sorting?: NatTableMode;
  filtering?: NatTableMode;
}

/** Alias to NatTableState for UI component consumption. */
export type NatTableUiState = NatTableState;

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export interface NatTableUiController<TData extends RowData = RowData> {
  readonly table: Table<TData>;
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableUiState]: Updater<NatTableUiState[K]>;
    }>,
  ): void;
  /** DOM id of the controlled `<table>`; companion controls bind `aria-controls` to this. */
  readonly tableElementId: Signal<string>;
  /** Scrollable container that wraps the controlled `<table>`, when available. */
  readonly tableScrollContainer?: Signal<HTMLElement | null>;
  /** Locale id used by generated companion-control labels, when available. */
  readonly localeId?: Signal<string>;
}
