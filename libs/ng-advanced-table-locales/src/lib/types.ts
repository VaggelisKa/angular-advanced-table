/** Formats numbers used in generated table accessibility copy. */
export type NatTableNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
) => string;

/** Context passed to custom table summary formatters. */
export interface NatTableAccessibilitySummaryContext {
  /** Rows currently rendered in the body. */
  visibleRowsValue: number;
  /** Provider-formatted text for `visibleRowsValue`. */
  visibleRowsText: string;
  /** Total rows supplied to the table before filtering/pagination. */
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
export interface NatTableAccessibilitySortingAnnouncementEntry {
  /** TanStack column id. */
  id: string;
  /** Resolved human-readable column label. */
  label: string;
  /** Active sort direction for the column. */
  sortState: 'ascending' | 'descending';
}

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
  /** Total rows supplied to the table before filtering. */
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
   * Screen-reader instructions for grid keyboard navigation. Falls back to the
   * active locale default when omitted. Set to an empty string to suppress the
   * instructions.
   */
  keyboardInstructions?: string;
  /**
   * Visible message rendered in the body when the current view contains no
   * rows. Falls back to the active locale default when omitted.
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

/** Locale-specific defaults for generated `<nat-table>` accessibility copy. */
export interface NatTableIntl {
  /** Default accessibility copy and announcement formatters for every table in scope. */
  accessibilityText?: NatTableAccessibilityText;
  /** Number formatter used for `...Text` fields passed to generated copy formatters. */
  formatNumber?: NatTableNumberFormatter;
}

export interface NatTableIntlConfig {
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableIntl>;
}

export type NatTableIntlProviderConfig = NatTableIntl | NatTableIntlConfig;

/** Locale dictionaries keyed by locale id. */
export type NatTableLocaleLabelsMap = Record<string, NatTableIntl>;

/** Alias for the table locale label shape. */
export type NatTableLocaleLabels = NatTableIntl;
