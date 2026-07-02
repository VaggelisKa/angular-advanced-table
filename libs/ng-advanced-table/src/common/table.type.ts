/* eslint-disable max-lines -- cohesive public type surface; splitting would scatter related contracts. */
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
 * Serializable view state exposed by {@link NatTable} and emitted through
 * `stateChange`.
 */
export type NatTableUserState = {
  /** Active single-column sort order. */
  readonly sorting: SortingState;
  /** Current global search query. */
  readonly globalFilter: string;
  /** Active column filters keyed by TanStack column id. */
  readonly columnFilters: ColumnFiltersState;
  /** Pagination cursor and page size. */
  readonly pagination: PaginationState;
  /** Visibility map for hideable columns. */
  readonly columnVisibility: VisibilityState;
  /** Leaf-column order, restored when columns are unpinned. */
  readonly columnOrder: ColumnOrderState;
  /** Left and right pinned column ids. */
  readonly columnPinning: ColumnPinningState;
  /** Per-column pixel widths keyed by column id, set by interactive resizing. */
  readonly columnSizing: ColumnSizingState;
  /** Selected row ids keyed by `getRowId`, a string/number `row.id`, or the namespaced positional fallback. */
  readonly rowSelection: RowSelectionState;
};

/** Column zones used for reordering and pinned-offset bookkeeping. */
export type ColumnReorderZone = 'left' | 'center' | 'right';

/** Keyboard reorder direction for a column (-1 = left, 1 = right). */
export type ColumnReorderKeyboardDirection = -1 | 1;

/** Result of a column reorder operation — returned so callers can announce the change. */
export type NatTableColumnReorderResult = {
  readonly movingColumnId: string;
  readonly zone: ColumnReorderZone;
  readonly nextVisibleZoneOrder: readonly string[];
};

/** Per-column accessibility descriptor used by the column-visibility summary. */
export type TableColumnAccessibilityState = {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
};

/** Which intrinsic sizing hints a column declares. */
export type TableColumnSizingState = {
  readonly hasSize: boolean;
  readonly hasMinSize: boolean;
  readonly hasMaxSize: boolean;
};

/** Resolved per-column render state consumed by the table template. */
export type TableColumnRenderState = {
  readonly label: string;
  readonly hiddenHeaderLabel: string | null;
  readonly alignEnd: boolean;
  readonly pinnedLeft: boolean;
  readonly pinnedRight: boolean;
  readonly hasPinnedEdgeLeft: boolean;
  readonly hasPinnedEdgeRight: boolean;
  readonly left: number | null;
  readonly right: number | null;
  readonly width: string | null;
  readonly minWidth: string | null;
  readonly maxWidth: string | null;
  readonly constrainedWidth: boolean;
  readonly headerWidth: string | null;
  readonly headerMinWidth: string | null;
  readonly headerMaxWidth: string | null;
  readonly headerConstrainedWidth: boolean;
  readonly cellHeight: string | null;
  readonly cellMaxLines: number | null;
  readonly ariaSort: 'ascending' | 'descending' | null;
  readonly rowHeader: boolean;
  /** Precomputed space-separated CSS classes for header cells. */
  readonly headerClassMap: string;
  /** Precomputed space-separated CSS classes for body cells. */
  readonly cellClassMap: string;
};

/** Precomputed inputs shared across every column when building render state. */
export type ColumnRenderStateContext<TData extends RowData> = {
  readonly widths: Record<string, number>;
  readonly state: NatTableUserState;
  readonly userColumnSizing: Record<string, TableColumnSizingState>;
  readonly primarySortColumnId: string | null;
  readonly leftVisibleColumns: Column<TData, unknown>[];
  readonly rightVisibleColumns: Column<TData, unknown>[];
  readonly leftPinnedIds: ReadonlySet<string>;
  readonly rightPinnedIds: ReadonlySet<string>;
  readonly leftOffsets: Record<string, number>;
  readonly rightOffsets: Record<string, number>;
};

/**
 * Stable row id resolver passed to `getRowId` when the built-in string/number
 * `row.id` default is not enough. Matches TanStack Table's
 * `getRowId(originalRow, index, parentRow?)` shape so consumers can key sub-rows
 * consistently when they enable nested features later.
 */
export type NatTableRowIdGetter<TData extends RowData = RowData> = (row: TData, index: number, parent?: Row<TData>) => string;

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
export type NatTableRowActivateEvent<TData extends RowData = RowData> = {
  /** Original row object supplied in `data`. */
  readonly rowData: TData;
  /** TanStack row instance for advanced interactions. */
  readonly row: Row<TData>;
  /** Pointer or keyboard event that triggered the activation. */
  readonly originalEvent: MouseEvent | KeyboardEvent;
};

/** Data lifecycle state rendered by `<nat-table>` when rows are unavailable. */
export type NatTableDataStatus = 'loading' | 'error' | 'success';

/** Horizontal direction used by built-in and custom column-reorder controls. */
export type NatTableColumnMoveDirection = 'left' | 'right';

/** Named data lifecycle states accepted by `<nat-table>`. */
export const NAT_TABLE_DATA_STATUS = {
  loading: 'loading',
  error: 'error',
  success: 'success'
} as const satisfies Record<NatTableDataStatus, NatTableDataStatus>;

/** State row currently rendered in the table body. */
export type NatTableBodyState = 'rows' | 'loading' | 'empty' | 'error';

/** Named state rows rendered in the table body. */
export const NAT_TABLE_BODY_STATE = {
  rows: 'rows',
  loading: 'loading',
  empty: 'empty',
  error: 'error'
} as const satisfies Record<NatTableBodyState, NatTableBodyState>;

/** Shared context passed to custom table body state templates. */
type NatTableStateTemplateContext<TData extends RowData = RowData> = {
  /** TanStack table instance for advanced reads. */
  readonly table: Table<TData>;
  /** Rows currently rendered in the body. */
  readonly visibleRowsValue: number;
  /** Total rows represented by the current body state before filtering/pagination. */
  readonly totalRowsValue: number;
  /** Visible leaf columns in the current view. */
  readonly visibleColumnsValue: number;
  /** Whether the current view is filtered by global or column filters. */
  readonly filtered: boolean;
};

/** Context passed to `ng-template[natTableLoading]`. */
export type NatTableLoadingTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
  /** Alias for `status`, useful for `let-status` style template bindings. */
  readonly $implicit: typeof NAT_TABLE_BODY_STATE.loading;
  /** Current state row status. */
  readonly status: typeof NAT_TABLE_BODY_STATE.loading;
};

/** Context passed to `ng-template[natTableEmpty]`. */
export type NatTableEmptyTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
  /** Alias for `status`, useful for `let-status` style template bindings. */
  readonly $implicit: typeof NAT_TABLE_BODY_STATE.empty;
  /** Current state row status. */
  readonly status: typeof NAT_TABLE_BODY_STATE.empty;
};

/** Context passed to `ng-template[natTableError]`. */
export type NatTableErrorTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
  /** Alias for `error`, useful for `let-error` style template bindings. */
  readonly $implicit: unknown;
  /** Current state row status. */
  readonly status: typeof NAT_TABLE_BODY_STATE.error;
  /** Consumer-supplied error payload. */
  readonly error: unknown;
};

/** Context passed to custom table summary formatters. */
export type NatTableAccessibilitySummaryContext = {
  /** Rows currently rendered in the body. */
  readonly visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  readonly visibleRowsText: string;
  /** Total rows represented by the current body state before filtering/pagination. */
  readonly totalRowsValue: number;
  /** Provider-formatted text for `totalRowsValue`. */
  readonly totalRowsText: string;
  /** Visible leaf columns in the current view. */
  readonly visibleColumnsValue: number;
  /** Provider-formatted text for `visibleColumnsValue`. */
  readonly visibleColumnsText: string;
  /** Zero-based current page index. */
  readonly pageIndex: number;
  /** One-based current page number. */
  readonly pageValue: number;
  /** Provider-formatted text for `pageValue`. */
  readonly pageText: string;
  /** Total available pages. */
  readonly pageCountValue: number;
  /** Provider-formatted text for `pageCountValue`. */
  readonly pageCountText: string;
  /** Whether the current view is filtered. */
  readonly filterState: 'filtered' | 'unfiltered';
  /** Whether client-side pagination is enabled. */
  readonly paginationState: 'enabled' | 'disabled';
};

/** Single active sort entry passed to sort announcement formatters. */
type NatTableAccessibilitySortingAnnouncementEntry = {
  /** TanStack column id. */
  readonly id: string;
  /** Resolved human-readable column label. */
  readonly label: string;
  /** Active sort direction for the column. */
  readonly sortState: 'ascending' | 'descending';
};

/** Context passed to custom sort announcement formatters. */
export type NatTableAccessibilitySortingAnnouncementContext = {
  /** Sorted column id, or `null` when sorting is cleared. */
  readonly columnId: string | null;
  /** Resolved human-readable column label, or `null`. */
  readonly columnLabel: string | null;
  /** Active ARIA sort state for the sorted column, or `'none'` when cleared. */
  readonly sortState: 'ascending' | 'descending' | 'none';
  /** All active sort entries in priority order; more than one during a multi-sort. */
  readonly sortedColumns: readonly NatTableAccessibilitySortingAnnouncementEntry[];
};

/** Context passed to custom filtering announcement formatters. */
export type NatTableAccessibilityFilteringAnnouncementContext = {
  /** Trimmed global filter query. */
  readonly query: string;
  /** Which filtering inputs are currently active. */
  readonly filterState: 'none' | 'global' | 'column' | 'global-and-column';
  /** Rows currently rendered after filtering/pagination. */
  readonly visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  readonly visibleRowsText: string;
  /** Total rows represented by the current body state before filtering. */
  readonly totalRowsValue: number;
  /** Provider-formatted text for `totalRowsValue`. */
  readonly totalRowsText: string;
};

/** Single column change entry passed to visibility announcement formatters. */
export type NatTableAccessibilityColumnVisibilityAnnouncementChange = {
  /** TanStack column id. */
  readonly id: string;
  /** Resolved human-readable column label. */
  readonly label: string;
  /** Next visibility state for the column. */
  readonly visibilityState: 'visible' | 'hidden';
};

/** Context passed to custom column-visibility announcement formatters. */
export type NatTableAccessibilityColumnVisibilityAnnouncementContext = {
  /** Columns whose visibility changed in the last update. */
  readonly changedColumns: readonly NatTableAccessibilityColumnVisibilityAnnouncementChange[];
  /** Visible column count after the change. */
  readonly visibleColumnsValue: number;
  /** Provider-formatted text for `visibleColumnsValue`. */
  readonly visibleColumnsText: string;
  /** Total leaf-column count. */
  readonly totalColumnsValue: number;
  /** Provider-formatted text for `totalColumnsValue`. */
  readonly totalColumnsText: string;
};

/** Context passed to custom pagination announcement formatters. */
export type NatTableAccessibilityPaginationAnnouncementContext = {
  /** Zero-based current page index. */
  readonly pageIndex: number;
  /** One-based current page number. */
  readonly pageValue: number;
  /** Provider-formatted text for `pageValue`. */
  readonly pageText: string;
  /** Total available pages. */
  readonly pageCountValue: number;
  /** Provider-formatted text for `pageCountValue`. */
  readonly pageCountText: string;
  /** Current page size. */
  readonly pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  readonly pageSizeText: string;
  /** Rows currently rendered in the body. */
  readonly visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  readonly visibleRowsText: string;
};

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
export type NatTableAccessibilityColumnReorderAnnouncementContext = {
  /** TanStack column id. */
  readonly columnId: string;
  /** Resolved human-readable column label. */
  readonly label: string;
  /** Reorder zone for the column. */
  readonly zone: 'left' | 'center' | 'right';
  /** One-based position within the zone after the move. */
  readonly positionValue: number;
  /** Provider-formatted text for `positionValue`. */
  readonly positionText: string;
  /** Total visible columns in the zone. */
  readonly totalValue: number;
  /** Provider-formatted text for `totalValue`. */
  readonly totalText: string;
};

/** Context passed to custom column-resize announcement formatters. */
export type NatTableAccessibilityColumnResizeAnnouncementContext = {
  /** TanStack column id. */
  readonly columnId: string;
  /** Resolved human-readable column label. */
  readonly label: string;
  /** New column width in CSS pixels. */
  readonly widthValue: number;
  /** Provider-formatted text for `widthValue`. */
  readonly widthText: string;
  /** Whether the width sits on the column's minimum resize bound. */
  readonly atMinimum?: boolean;
  /** Whether the width sits on the column's maximum resize bound. */
  readonly atMaximum?: boolean;
};

/** Optional overrides for built-in screen-reader summaries and announcements. */
export type NatTableAccessibilityText = {
  /**
   * Supplemental description announced through `aria-describedby` when the
   * grid receives focus. Set to an empty string to suppress the description.
   */
  readonly description?: string;
  /**
   * Screen-reader instructions for grid keyboard navigation. Falls back to a
   * built-in English default when omitted. Set to an empty string to suppress
   * the instructions.
   */
  readonly keyboardInstructions?: string;
  /**
   * Visible message rendered in the body when the current view contains no
   * rows. Falls back to a built-in English default when omitted.
   */
  readonly emptyState?: string;
  /**
   * Visible message rendered in the body while initial rows are loading.
   * Falls back to a built-in English default when omitted.
   */
  readonly loadingState?: string;
  /**
   * Visible message rendered in the body when the table is in an error state.
   * Falls back to a built-in English default when omitted.
   */
  readonly errorState?: string;
  /** Extra reorder instructions appended when column reordering is enabled. */
  readonly reorderKeyboardInstructions?: string;
  /** Extra resize instructions appended when column resizing is enabled. */
  readonly resizeKeyboardInstructions?: string;
  /** Summary announced through `aria-describedby` for the rendered grid. */
  readonly tableSummary?: (context: NatTableAccessibilitySummaryContext) => string;
  /** Live announcement emitted when sorting changes. */
  readonly sortingChange?: (context: NatTableAccessibilitySortingAnnouncementContext) => string;
  /** Live announcement emitted when filtering changes. */
  readonly filteringChange?: (context: NatTableAccessibilityFilteringAnnouncementContext) => string;
  /** Live announcement emitted when column visibility changes. */
  readonly columnVisibilityChange?: (context: NatTableAccessibilityColumnVisibilityAnnouncementContext) => string;
  /** Live announcement emitted when the page size changes. */
  readonly pageSizeChange?: (context: NatTableAccessibilityPaginationAnnouncementContext) => string;
  /** Live announcement emitted when the page index changes. */
  readonly pageChange?: (context: NatTableAccessibilityPaginationAnnouncementContext) => string;
  /** Live announcement emitted when a column is reordered. */
  readonly columnReorder?: (context: NatTableAccessibilityColumnReorderAnnouncementContext) => string;
  /** Live announcement emitted when a column is resized. */
  readonly columnResize?: (context: NatTableAccessibilityColumnResizeAnnouncementContext) => string;
  /** Live announcement emitted when the row selection changes. */
  readonly selectionChange?: (context: NatTableAccessibilitySelectionAnnouncementContext) => string;
};

/** Semantic tone that can be applied to a rendered body cell. */
export type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';

/** Current sort direction for a header cell. */
type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export type NatTableSortIndicatorContext<TData extends RowData = RowData> = {
  /** Alias for `sortState`, useful for `let-state` style template bindings. */
  readonly $implicit: NatTableSortDirection;
  /** Current TanStack sort direction for the column. */
  readonly sortState: NatTableSortDirection;
  /** ARIA token applied to the header cell. */
  readonly ariaSort: 'ascending' | 'descending' | 'none';
  /** TanStack column instance for advanced custom indicators. */
  readonly column: Column<TData, unknown>;
  /** Resolved human-readable label for the column. */
  readonly label: string;
};

/** Value returned by table export metadata before format-specific normalization. */
type NatTableColumnExportValue = unknown;

/** Context passed to column export value callbacks. */
type NatTableColumnExportValueContext<TData extends RowData = RowData, TValue = unknown> = {
  /** Row being exported. */
  readonly row: Row<TData>;
  /** Column being exported. */
  readonly column: Column<TData, TValue>;
  /** Raw value resolved from the row and column before export-specific normalization. */
  readonly value: TValue;
};

/** Export behavior attached to a table column definition. */
type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
  /** Whether the column participates in table export. Accessor columns opt in by default. */
  readonly enabled?: boolean;
  /** Header text used by export formats. Defaults to column labels and identifiers. */
  readonly header?: string;
  /** Maps a row/column value into an export value. Defaults to the raw accessor value. */
  readonly value?: (context: NatTableColumnExportValueContext<TData, TValue>) => NatTableColumnExportValue;
};

/**
 * Extra metadata understood by `<nat-table>` when attached to a TanStack
 * column definition or optional companion UI.
 */
export type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
  /** Accessible label used by companion controls when the header is not a string. */
  readonly label?: string;
  /** Visually hidden header label for utility columns where a visible title would be redundant. */
  readonly hiddenHeaderLabel?: string;
  /** Horizontal alignment for header and body cells in the column. */
  readonly align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  readonly rowHeader?: boolean;
  /** Optional callback that maps a cell to a semantic tone class. */
  readonly cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
  /** Optional body-cell height in pixels or any CSS length. Does not affect header cells. */
  readonly cellHeight?: number | string;
  /**
   * Maximum body-cell content lines before truncation. Defaults to 2; set to `Infinity` to disable.
   * Invalid explicit values fall back to 2 lines.
   */
  readonly cellMaxLines?: number;
  /** Optional header-only width in pixels. Does not affect body cells. */
  readonly headerSize?: number | string;
  /** Optional header-only minimum width in pixels. Does not affect body cells. */
  readonly headerMinSize?: number | string;
  /** Optional header-only maximum width in pixels. Does not affect body cells. */
  readonly headerMaxSize?: number | string;
  /** Optional table export behavior for this column. */
  readonly export?: NatTableColumnExportOptions<TData, TValue>;
};

declare module '@tanstack/table-core' {
  // Module augmentation must use `interface` (declaration merging); the empty
  // body intentionally inherits every NatTableColumnMeta field.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface ColumnMeta<TData extends RowData, TValue> extends NatTableColumnMeta<TData, TValue> {}

  // Module augmentation must use `interface`; `TData` is required to match the
  // upstream signature even though this augmentation does not reference it.
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    /** Current table locale id exposed to companion header controls. */
    readonly natTableLocaleId?: string;
    /** Returns whether a visible column can move within its current pinned region. */
    readonly natTableCanMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => boolean;
    /** Moves a visible column within its current pinned region. Returns the reorder result, or null if no move occurred. */
    readonly natTableMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => NatTableColumnReorderResult | null;
  }
}

export type NatTableMode = 'auto' | 'manual';

export type NatTableModeConfiguration = {
  readonly pagination?: NatTableMode;
  readonly sorting?: NatTableMode;
  readonly filtering?: NatTableMode;
};

/** Alias to NatTableUserState for UI component consumption. */
export type NatTableUiState = NatTableUserState;

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export type NatTableUiController<TData extends RowData = RowData> = {
  readonly table: Table<TData>;
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableUiState]: Updater<NatTableUiState[K]>;
    }>
  ): void;
  /** DOM id of the controlled `<table>`; companion controls bind `aria-controls` to this. */
  readonly tableElementId: Signal<string>;
  /** Scrollable container that wraps the controlled `<table>`, when available. */
  readonly tableScrollContainer?: Signal<HTMLElement | null>;
  /** Locale id used by generated companion-control labels, when available. */
  readonly localeId?: Signal<string>;
};
