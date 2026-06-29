/** Formats numbers used in generated table accessibility copy. */
export type NatTableNumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;

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

/** Context passed to custom row-selection announcement formatters. */
export type NatTableAccessibilitySelectionAnnouncementContext = {
  /** Number of currently selected rows. */
  readonly selectedCountValue: number;
  /** Provider-formatted text for `selectedCountValue`. */
  readonly selectedCountText: string;
  /** Total rows supplied to the table. */
  readonly totalRowsValue: number;
  /** Provider-formatted text for `totalRowsValue`. */
  readonly totalRowsText: string;
};

/** Optional overrides for built-in screen-reader summaries and announcements. */
export type NatTableAccessibilityText = {
  /**
   * Supplemental description announced through `aria-describedby` when the
   * grid receives focus. Set to an empty string to suppress the description.
   */
  readonly description?: string;
  /**
   * Screen-reader instructions for grid keyboard navigation. Falls back to the
   * active locale default when omitted. Set to an empty string to suppress the
   * instructions.
   */
  readonly keyboardInstructions?: string;
  /**
   * Visible message rendered in the body when the current view contains no
   * rows. Falls back to the active locale default when omitted.
   */
  readonly emptyState?: string;
  /**
   * Visible message rendered in the body while initial rows are loading.
   * Falls back to the active locale default when omitted.
   */
  readonly loadingState?: string;
  /**
   * Visible message rendered in the body when the table is in an error state.
   * Falls back to the active locale default when omitted.
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

/** Locale-specific defaults for generated `<nat-table>` accessibility copy. */
export type NatTableIntl = {
  /** Default accessibility copy and announcement formatters for every table in scope. */
  readonly accessibilityText?: NatTableAccessibilityText;
  /** Number formatter used for `...Text` fields passed to generated copy formatters. */
  readonly formatNumber?: NatTableNumberFormatter;
};

export type NatTableIntlConfig = {
  /** Locale dictionaries keyed by locale id. */
  readonly locales?: Record<string, NatTableIntl>;
};

export type NatTableIntlProviderConfig = NatTableIntl | NatTableIntlConfig;

/** Locale dictionaries keyed by locale id. */
export type NatTableLocalesMap = Record<string, NatTableIntl>;
