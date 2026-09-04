import { Signal, InjectionToken, Provider } from '@angular/core';

/** Locale id for the built-in English locale dictionaries. */
declare const NAT_EN_LOCALE_ID = "en";

/** Formats numbers used in generated table accessibility copy. */
type NatTableNumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;
/** Context passed to custom table summary formatters. */
type NatTableAccessibilitySummaryContext = {
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
type NatTableAccessibilitySortingAnnouncementContext = {
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
type NatTableAccessibilityFilteringAnnouncementContext = {
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
type NatTableAccessibilityColumnVisibilityAnnouncementChange = {
    /** TanStack column id. */
    readonly id: string;
    /** Resolved human-readable column label. */
    readonly label: string;
    /** Next visibility state for the column. */
    readonly visibilityState: 'visible' | 'hidden';
};
/** Context passed to custom column-visibility announcement formatters. */
type NatTableAccessibilityColumnVisibilityAnnouncementContext = {
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
type NatTableAccessibilityPaginationAnnouncementContext = {
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
type NatTableAccessibilityColumnReorderAnnouncementContext = {
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
type NatTableAccessibilityColumnResizeAnnouncementContext = {
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
/** Context passed to custom sub-header row announcement formatters. */
type NatTableAccessibilitySubHeaderContext = {
    /** Raw sub-header group value. */
    readonly value: unknown;
    /** Human-readable text for `value` (empty for null/undefined). */
    readonly valueText: string;
    /** Rows in the group across the filtered dataset, ignoring pagination. */
    readonly rowCountValue: number;
    /** Provider-formatted text for `rowCountValue`. */
    readonly rowCountText: string;
};
/** Context passed to custom placeholder-row text formatters (remote windowing). */
type NatTableAccessibilityRowPlaceholderContext = {
    /** One-based absolute position of the placeholder row in the represented dataset. */
    readonly positionValue: number;
    /** Provider-formatted text for `positionValue`. */
    readonly positionText: string;
    /** Total logical rows the grid represents. */
    readonly totalRowsValue: number;
    /** Provider-formatted text for `totalRowsValue`. */
    readonly totalRowsText: string;
};
/** Context passed to custom row-selection announcement formatters. */
type NatTableAccessibilitySelectionAnnouncementContext = {
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
type NatTableAccessibilityText = {
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
     * Screen-reader instructions for list item navigation, announced when a
     * list renders with composite item navigation enabled. Phrases the grid
     * keyboard model as items rather than cells; falls back to
     * `keyboardInstructions` when only that one is overridden.
     */
    readonly listKeyboardInstructions?: string;
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
    /**
     * Summary announced through `aria-describedby` for a rendered list. Receives
     * the same context as `tableSummary`; the default phrases it as items and
     * fields rather than rows and columns.
     */
    readonly listSummary?: (context: NatTableAccessibilitySummaryContext) => string;
    /** Live announcement emitted when sorting changes. */
    readonly sortingChange?: (context: NatTableAccessibilitySortingAnnouncementContext) => string;
    /** Live announcement emitted when filtering changes. */
    readonly filteringChange?: (context: NatTableAccessibilityFilteringAnnouncementContext) => string;
    /** Live announcement emitted when column visibility changes. */
    readonly columnVisibilityChange?: (context: NatTableAccessibilityColumnVisibilityAnnouncementContext) => string;
    /**
     * Live announcement emitted when column visibility changes in a list.
     * Receives the same context as `columnVisibilityChange`; the default phrases
     * it as fields rather than columns.
     */
    readonly listColumnVisibilityChange?: (context: NatTableAccessibilityColumnVisibilityAnnouncementContext) => string;
    /**
     * Live announcement emitted when a list's page size changes. Receives the
     * same context as `pageSizeChange`; the default phrases it as items.
     */
    readonly listPageSizeChange?: (context: NatTableAccessibilityPaginationAnnouncementContext) => string;
    /**
     * Live announcement emitted when a list's page changes. Receives the same
     * context as `pageChange`; the default phrases it as items.
     */
    readonly listPageChange?: (context: NatTableAccessibilityPaginationAnnouncementContext) => string;
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
    /** Screen-reader text rendered for a table sub-header group row. */
    readonly subHeaderRow?: (context: NatTableAccessibilitySubHeaderContext) => string;
    /**
     * Screen-reader text rendered inside a placeholder row for a logical row the
     * table has not loaded (remote windowing).
     */
    readonly placeholderRow?: (context: NatTableAccessibilityRowPlaceholderContext) => string;
    /**
     * Screen-reader text rendered for a list sub-header group item. Receives the
     * same context as `subHeaderRow`; the default phrases it as items.
     */
    readonly listSubHeaderRow?: (context: NatTableAccessibilitySubHeaderContext) => string;
};
/** Locale-specific defaults for generated `<nat-table>` accessibility copy. */
type NatTableIntl = {
    /** Default accessibility copy and announcement formatters for every table in scope. */
    readonly accessibilityText?: NatTableAccessibilityText;
    /** Number formatter used for `...Text` fields passed to generated copy formatters. */
    readonly formatNumber?: NatTableNumberFormatter;
};
type NatTableIntlConfig = {
    /** Locale dictionaries keyed by locale id. */
    readonly locales?: Record<string, NatTableIntl>;
};
type NatTableIntlStaticProviderConfig = NatTableIntl | NatTableIntlConfig;
/** Static or signal-backed table intl configuration. */
type NatTableIntlProviderSource = NatTableIntlStaticProviderConfig | Signal<NatTableIntlStaticProviderConfig>;
/** Factory resolved once inside Angular dependency injection. Use `inject(...)` to read services. */
type NatTableIntlProviderFactory = () => NatTableIntlProviderSource;
type NatTableIntlProviderConfig = NatTableIntlProviderSource | NatTableIntlProviderFactory;
/** Locale dictionaries keyed by locale id. */
type NatTableLocalesMap = Record<string, NatTableIntl>;
/** Static or signal-backed table locale dictionaries. */
type NatTableLocalesProviderSource = NatTableLocalesMap | Signal<NatTableLocalesMap>;
/** Factory resolved once inside Angular dependency injection. */
type NatTableLocalesProviderFactory = () => NatTableLocalesProviderSource;
/** Configuration accepted by `provideNatTableLocales(...)`. */
type NatTableLocalesProviderConfig = NatTableLocalesProviderSource | NatTableLocalesProviderFactory;

/** Built-in English labels shipped with the table locale package. */
declare const NAT_EN_LOCALE_LABELS: NatTableIntl;
/**
 * Table locale registry shipped by `ng-advanced-table/locale`.
 *
 * Importing `provideNatTableLocales()` registers every locale in this object.
 */
declare const NAT_TABLE_BUILT_IN_LOCALES: NatTableLocalesMap;

/** Formats numbers used in generated companion-control labels. */
type NatTableControlsNumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;
/** Context passed to page-size option label formatters. */
type NatTableAccessibilityPageSizeOptionContext = {
    /** Candidate page size. */
    readonly pageSizeValue: number;
    /** Provider-formatted text for `pageSizeValue`. */
    readonly pageSizeText: string;
    /** Whether the option represents the currently selected value. */
    readonly selectionState: 'selected' | 'not-selected';
};
/** Optional accessibility label overrides for page-size controls. */
type NatTableAccessibilityPageSizeLabels = {
    /** `aria-label` applied to the chip group. */
    readonly groupAriaLabel?: string;
    /** Visible text rendered inside each page-size chip. */
    readonly pageSizeOptionText?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
    /** `aria-label` applied to each page-size chip. */
    readonly pageSizeOptionAriaLabel?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
};
/** Context passed to pager page-indicator formatters. */
type NatTableAccessibilityPagerContext = {
    /** One-based current page number. */
    readonly pageValue: number;
    /** Provider-formatted text for `pageValue`. */
    readonly pageText: string;
    /** Total available pages. */
    readonly pageCountValue: number;
    /** Provider-formatted text for `pageCountValue`. */
    readonly pageCountText: string;
};
/** Optional accessibility label overrides for pager controls. */
type NatTableAccessibilityPagerLabels = {
    /** `aria-label` applied to the pager group. */
    readonly groupAriaLabel?: string;
    /** `aria-label` for the previous-page button. */
    readonly previousPageAriaLabel?: string;
    /** `aria-label` for the next-page button. */
    readonly nextPageAriaLabel?: string;
    /** Visible page-indicator text between the pager buttons. */
    readonly pageIndicator?: (context: NatTableAccessibilityPagerContext) => string;
};
/** Context passed to horizontal scroll position label formatters. */
type NatTableAccessibilityScrollControlPositionContext = {
    /** Current horizontal scroll offset in CSS pixels. */
    readonly scrollLeftValue: number;
    /** Provider-formatted text for `scrollLeftValue`. */
    readonly scrollLeftText: string;
    /** Maximum horizontal scroll offset in CSS pixels. */
    readonly maxScrollLeftValue: number;
    /** Provider-formatted text for `maxScrollLeftValue`. */
    readonly maxScrollLeftText: string;
    /** Rounded scroll completion percentage from 0 to 100. */
    readonly percentageValue: number;
    /** Provider-formatted text for `percentageValue`. */
    readonly percentageText: string;
};
/** Optional accessibility label overrides for horizontal scroll controls. */
type NatTableAccessibilityScrollControlLabels = {
    /** `aria-label` applied to the scroll control group. */
    readonly groupAriaLabel?: string;
    /** `aria-label` for the scroll-left button. */
    readonly scrollLeftAriaLabel?: string;
    /** `aria-label` for the scroll-right button. */
    readonly scrollRightAriaLabel?: string;
    /** `aria-label` applied to the horizontal scroll slider. */
    readonly scrollPositionAriaLabel?: string;
    /** Visible and screen-reader position text for the scroll slider. */
    readonly scrollPositionText?: (context: NatTableAccessibilityScrollControlPositionContext) => string;
};
/** Context passed to column-visibility summary formatters. */
type NatTableAccessibilityColumnVisibilitySummaryContext = {
    /** Number of currently visible leaf columns. */
    readonly visibleColumnCountValue: number;
    /** Provider-formatted text for `visibleColumnCountValue`. */
    readonly visibleColumnCountText: string;
    /** Total leaf-column count. */
    readonly totalColumnCountValue: number;
    /** Provider-formatted text for `totalColumnCountValue`. */
    readonly totalColumnCountText: string;
};
/** Context passed to column-visibility button label formatters. */
type NatTableAccessibilityColumnVisibilityActionContext = {
    /** Human-readable column label. */
    readonly columnLabel: string;
    /** Current visibility state before toggling. */
    readonly visibilityState: 'visible' | 'hidden';
    /** Action that activating the control will perform. */
    readonly toggleAction: 'show' | 'hide';
};
/** Context passed to column state label formatters. */
type NatTableAccessibilityColumnVisibilityStateContext = {
    /** Current visibility state. */
    readonly visibilityState: 'visible' | 'hidden';
};
/** Optional accessibility label overrides for column-visibility controls. */
type NatTableAccessibilityColumnVisibilityLabels = {
    /** Visible heading rendered above the chip group. */
    readonly heading?: string;
    /** `aria-label` applied to the chip group. */
    readonly groupAriaLabel?: string;
    /** Visible caption showing how many columns are active. */
    readonly visibilitySummary?: (context: NatTableAccessibilityColumnVisibilitySummaryContext) => string;
    /** `aria-label` applied to each column chip. */
    readonly toggleColumnAriaLabel?: (context: NatTableAccessibilityColumnVisibilityActionContext) => string;
    /** Visible state text rendered inside each chip. */
    readonly columnState?: (context: NatTableAccessibilityColumnVisibilityStateContext) => string;
};
/** Context passed to per-row selection checkbox label formatters. */
type NatTableAccessibilitySelectionRowContext = {
    /** Stable row id resolved by `<nat-table>`. */
    readonly rowId: string;
};
/** Optional accessibility label overrides for the generated selection column. */
type NatTableAccessibilitySelectionLabels = {
    /** `aria-label` applied to the select-all header checkbox. */
    readonly selectAllAriaLabel?: string;
    /** `aria-label` applied to each per-row checkbox. */
    readonly selectRowAriaLabel?: (context: NatTableAccessibilitySelectionRowContext) => string;
};
/** Context passed to sort-button label formatters. */
type NatTableAccessibilityHeaderActionSortContext = {
    /** Human-readable column label. */
    readonly label: string;
    /** Current sort state before toggling. */
    readonly sortState: 'ascending' | 'descending' | 'none';
    /** 1-based position in a multi-column sort, or `null` when this column is not sorted. */
    readonly sortPriority: number | null;
    /** Total number of columns currently sorted. */
    readonly sortCount: number;
};
/** Context passed to the overflow menu trigger label formatter. */
type NatTableAccessibilityHeaderActionMenuContext = {
    /** Human-readable column label. */
    readonly label: string;
};
/** Context passed to pin-button label formatters. */
type NatTableAccessibilityHeaderActionPinContext = {
    /** Human-readable column label. */
    readonly label: string;
    /** Whether the column is pinned at all before toggling. */
    readonly pinState: 'pinned' | 'unpinned';
    /** Action that activating the control will perform. */
    readonly toggleAction: 'pin' | 'unpin';
    /** Side targeted by the current button. */
    readonly pinSide: 'left' | 'right';
    /** Currently active pin side for the column, if any. */
    readonly pinnedSide: 'left' | 'right' | null;
};
/** Direction used by generated move-column labels. */
type NatTableColumnMoveDirection = 'left' | 'right';
/** Context passed to move-column label formatters. */
type NatTableAccessibilityHeaderActionMoveContext = {
    /** Human-readable column label. */
    readonly label: string;
    /** Direction targeted by the current button. */
    readonly direction: NatTableColumnMoveDirection;
};
/** Optional accessibility label overrides for header sort, pin, and move actions. */
type NatTableAccessibilityHeaderActionLabels = {
    /** `aria-label` applied to the sort button. */
    readonly sortButton?: (context: NatTableAccessibilityHeaderActionSortContext) => string;
    /** `aria-label` applied to the overflow menu trigger. */
    readonly menuButton?: (context: NatTableAccessibilityHeaderActionMenuContext) => string;
    /** `aria-label` applied to the opened column actions menu. */
    readonly menuLabel?: (context: NatTableAccessibilityHeaderActionMenuContext) => string;
    /** `aria-label` applied to the pin button. */
    readonly pinButton?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
    /** Visible text rendered inside each pin action menu item. */
    readonly pinButtonText?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
    /** `aria-label` applied to the move-column button. */
    readonly moveButton?: (context: NatTableAccessibilityHeaderActionMoveContext) => string;
    /** Visible text rendered inside each move-column menu item. */
    readonly moveButtonText?: (context: NatTableAccessibilityHeaderActionMoveContext) => string;
};
type NatTableSearchIntl = {
    /** Visible label for the global search field. */
    readonly label?: string;
    /** Placeholder for the global search field. */
    readonly placeholder?: string;
};
type NatTableColumnVisibilityIntl = {
    /** Visible heading above the column visibility chips. */
    readonly label?: string;
    /** `aria-label` applied to the column visibility chip group. */
    readonly groupAriaLabel?: string;
    /** Generated labels and summaries for the column visibility control. */
    readonly accessibilityLabels?: NatTableAccessibilityColumnVisibilityLabels;
};
type NatTablePageSizeIntl = {
    /** `aria-label` applied to the page-size chip group. */
    readonly groupAriaLabel?: string;
    /** Generated labels for page-size options. */
    readonly accessibilityLabels?: NatTableAccessibilityPageSizeLabels;
};
type NatTablePagerIntl = {
    /** `aria-label` applied to the pager control group. */
    readonly groupAriaLabel?: string;
    /** Generated pager button and indicator labels. */
    readonly accessibilityLabels?: NatTableAccessibilityPagerLabels;
};
type NatTableScrollControlIntl = {
    /** `aria-label` applied to the horizontal scroll control group. */
    readonly groupAriaLabel?: string;
    /** Generated scroll button, slider, and position labels. */
    readonly accessibilityLabels?: NatTableAccessibilityScrollControlLabels;
};
type NatTableHeaderActionsIntl = {
    /** Generated sort, menu, pin, and move labels for header action controls. */
    readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
};
type NatTableToolbarIntl = {
    /** Default `aria-label` for the toolbar container; the `accessibleName` input wins. */
    readonly toolbarLabel?: string;
};
type NatTableSelectionIntl = {
    /** Human-readable label for the generated selection column. */
    readonly columnLabel?: string;
    /** Generated labels for the selection checkboxes. */
    readonly accessibilityLabels?: NatTableAccessibilitySelectionLabels;
};
/** Locale-specific defaults for generated `ng-advanced-table/components` copy. */
type NatTableControlsIntl = {
    readonly search?: NatTableSearchIntl;
    readonly columnVisibility?: NatTableColumnVisibilityIntl;
    readonly pageSize?: NatTablePageSizeIntl;
    readonly pager?: NatTablePagerIntl;
    readonly scrollControl?: NatTableScrollControlIntl;
    readonly headerActions?: NatTableHeaderActionsIntl;
    readonly toolbar?: NatTableToolbarIntl;
    readonly selection?: NatTableSelectionIntl;
    /** Number formatter used for `...Text` fields passed to generated label formatters. */
    readonly formatNumber?: NatTableControlsNumberFormatter;
};
type NatTableControlsIntlConfig = {
    /** Locale dictionaries keyed by locale id. */
    readonly locales?: Record<string, NatTableControlsIntl>;
};
type NatTableControlsIntlStaticProviderConfig = NatTableControlsIntl | NatTableControlsIntlConfig;
/** Components locale dictionaries keyed by locale id. */
type NatTableControlsLocalesMap = Record<string, NatTableControlsIntl>;

/** Built-in English labels shipped with `ng-advanced-table/locale`. */
declare const NAT_EN_CONTROLS_LOCALE_LABELS: NatTableControlsIntl;
/**
 * Companion components locale registry shipped by `ng-advanced-table/locale`.
 *
 * Importing `provideNatTableControlsLocales()` registers every locale in this object.
 */
declare const NAT_TABLE_BUILT_IN_CONTROLS_LOCALES: NatTableControlsLocalesMap;

/** Static or signal-backed companion-controls intl configuration. */
type NatTableControlsIntlProviderSource = NatTableControlsIntlStaticProviderConfig | Signal<NatTableControlsIntlStaticProviderConfig>;
/** Factory resolved once inside Angular dependency injection. Use `inject(...)` to read services. */
type NatTableControlsIntlProviderFactory = () => NatTableControlsIntlProviderSource;
type NatTableControlsIntlProviderConfig = NatTableControlsIntlProviderSource | NatTableControlsIntlProviderFactory;
/** Static or signal-backed companion-controls locale dictionaries. */
type NatTableControlsLocalesProviderSource = NatTableControlsLocalesMap | Signal<NatTableControlsLocalesMap>;
/** Factory resolved once inside Angular dependency injection. */
type NatTableControlsLocalesProviderFactory = () => NatTableControlsLocalesProviderSource;
/** Configuration accepted by `provideNatTableControlsLocales(...)`. */
type NatTableControlsLocalesProviderConfig = NatTableControlsLocalesProviderSource | NatTableControlsLocalesProviderFactory;

/** Formats numbers used in render-metrics labels and values. */
type NatTableRenderMetricsNumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;
type RowRenderTone = 'fast' | 'watch' | 'slow';
type RowRenderFilterOption = {
    readonly value: RowRenderTone | 'all';
    readonly label: string;
    readonly description: string;
};
/** Context passed to row-count label formatters. */
type NatTableRenderMetricsRowCountContext = {
    /** Numeric row count. */
    readonly rowCountValue: number;
    /** Provider-formatted text for `rowCountValue`. */
    readonly rowCountText: string;
};
/** Context passed to duration label formatters. */
type NatTableRenderMetricsDurationContext = {
    /** Duration in milliseconds. */
    readonly durationMsValue: number;
    /** Provider-formatted text for `durationMsValue`. */
    readonly durationMsText: string;
};
/** Labels used by render-metrics filters. */
type NatTableRenderMetricsFilterIntl = {
    /** Visible label for the filter control. */
    readonly heading?: string;
    /** Group label for the filter chips. */
    readonly groupAriaLabel?: string;
    /** Caption shown before measurements are recorded. */
    readonly idleCaption?: string;
    /** Caption shown when a measurement is available. */
    readonly rowSampleCaption?: (context: NatTableRenderMetricsRowCountContext) => string;
    /** Filter chip labels and descriptions. */
    readonly options?: readonly RowRenderFilterOption[];
};
/** Labels used by render-metrics panels. */
type NatTableRenderMetricsPanelIntl = {
    /** Label applied to the KPI panel. */
    readonly ariaLabel?: string;
    /** Visible label for the current tone. */
    readonly toneLabel?: (tone: RowRenderTone | 'idle') => string;
    /** Summary shown before measurements are recorded. */
    readonly idleSummary?: string;
    /** Summary shown when a measurement is available. */
    readonly rowSampleSummary?: (context: NatTableRenderMetricsRowCountContext) => string;
    /** Visible duration text. */
    readonly duration?: (context: NatTableRenderMetricsDurationContext) => string;
};
/** Defaults used by render-metrics columns. */
type NatTableRenderMetricsColumnIntl = {
    /** Static header label. */
    readonly header?: string;
    /** Cell label when no metric has been recorded yet. */
    readonly pendingLabel?: string;
    /** Suffix appended to measurement values when `duration` is omitted. */
    readonly unitSuffix?: string;
    /** Visible cell duration text. */
    readonly duration?: (context: NatTableRenderMetricsDurationContext) => string;
};
/** App or feature-level defaults for render-metrics helper copy. */
type NatTableRenderMetricsWidgetsIntl = {
    readonly filter?: NatTableRenderMetricsFilterIntl;
    readonly panel?: NatTableRenderMetricsPanelIntl;
    readonly column?: NatTableRenderMetricsColumnIntl;
};
/** Locale-specific defaults for `ng-advanced-table/render-metrics`. */
type NatTableRenderMetricsIntl = {
    readonly renderMetrics?: NatTableRenderMetricsWidgetsIntl;
    /** Number formatter used for row counts and durations. */
    readonly formatNumber?: NatTableRenderMetricsNumberFormatter;
};
type NatTableRenderMetricsIntlConfig = {
    /** Locale dictionaries keyed by locale id. */
    readonly locales?: Record<string, NatTableRenderMetricsIntl>;
};
type NatTableRenderMetricsIntlStaticProviderConfig = NatTableRenderMetricsIntl | NatTableRenderMetricsIntlConfig;
/** Static or signal-backed render-metrics intl configuration. */
type NatTableRenderMetricsIntlProviderSource = NatTableRenderMetricsIntlStaticProviderConfig | Signal<NatTableRenderMetricsIntlStaticProviderConfig>;
/** Factory resolved once inside Angular dependency injection. Use `inject(...)` to read services. */
type NatTableRenderMetricsIntlProviderFactory = () => NatTableRenderMetricsIntlProviderSource;
type NatTableRenderMetricsIntlProviderConfig = NatTableRenderMetricsIntlProviderSource | NatTableRenderMetricsIntlProviderFactory;
/** Render-metrics locale dictionaries keyed by locale id. */
type NatTableRenderMetricsLocalesMap = Record<string, NatTableRenderMetricsIntl>;
/** Static or signal-backed render-metrics locale dictionaries. */
type NatTableRenderMetricsLocalesProviderSource = NatTableRenderMetricsLocalesMap | Signal<NatTableRenderMetricsLocalesMap>;
/** Factory resolved once inside Angular dependency injection. */
type NatTableRenderMetricsLocalesProviderFactory = () => NatTableRenderMetricsLocalesProviderSource;
/** Configuration accepted by `provideNatTableRenderMetricsLocales(...)`. */
type NatTableRenderMetricsLocalesProviderConfig = NatTableRenderMetricsLocalesProviderSource | NatTableRenderMetricsLocalesProviderFactory;

declare const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[];
/** Built-in English labels shipped with `ng-advanced-table/locale`. */
declare const NAT_EN_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl;
/**
 * Render-metrics locale registry shipped by `ng-advanced-table/locale`.
 *
 * Importing `provideNatTableRenderMetricsLocales()` registers every locale in this object.
 */
declare const NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES: NatTableRenderMetricsLocalesMap;

/** Injection token backing `provideNatTableLocales(...)`. */
declare const NAT_TABLE_INTL: InjectionToken<NatTableIntlConfig>;
/**
 * Provides default table labels, announcement formatters, and number formatting.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
declare const provideNatTableIntl: (intl: NatTableIntlProviderConfig) => Provider[];
/**
 * Registers every table locale shipped by `ng-advanced-table/locale`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated table labels. Instance-specific copy such as table names,
 * captions, descriptions, and column labels should stay on component inputs or
 * column definitions.
 */
declare const provideNatTableLocales: (overrides?: NatTableLocalesProviderConfig) => Provider[];

/** Injection token backing `provideNatTableControlsLocales(...)`. */
declare const NAT_TABLE_CONTROLS_INTL: InjectionToken<NatTableControlsIntlConfig>;
/**
 * Provides default labels and number formatting for the companion controls in `ng-advanced-table/components`.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
declare const provideNatTableControlsIntl: (intl: NatTableControlsIntlProviderConfig) => Provider[];
/**
 * Registers every companion components locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/components`.
 */
declare const provideNatTableControlsLocales: (overrides?: NatTableControlsLocalesProviderConfig) => Provider[];

/** Injection token backing `provideNatTableRenderMetricsLocales(...)`. */
declare const NAT_TABLE_RENDER_METRICS_INTL: InjectionToken<NatTableRenderMetricsIntlConfig>;
/**
 * Provides default labels and number formatting for optional render-metrics helpers.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
declare const provideNatTableRenderMetricsIntl: (intl: NatTableRenderMetricsIntlProviderConfig) => Provider[];
/**
 * Registers every render-metrics locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/render-metrics`.
 */
declare const provideNatTableRenderMetricsLocales: (overrides?: NatTableRenderMetricsLocalesProviderConfig) => Provider[];
/**
 * Reads render-metrics locale defaults when called inside Angular injection context.
 *
 * Calls outside injection context fall back to the built-in default config.
 */
declare const injectNatTableRenderMetricsIntl: () => NatTableRenderMetricsIntlConfig;

/** Merges table accessibility copy and formatter callbacks field by field. */
declare const mergeNatTableAccessibilityText: (parent?: NatTableAccessibilityText, override?: NatTableAccessibilityText) => NatTableAccessibilityText;
/** Formats generated table accessibility numbers through the configured locale formatter. */
declare const formatNatTableNumber: (intl: NatTableIntl, value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;
/** Resolves a locale dictionary, falling back to built-in English defaults. */
declare const resolveNatTableIntl: (intl: NatTableIntlConfig, locale: string) => NatTableIntl;

/** Merges column visibility labels and formatters field by field. */
declare const mergeColumnVisibilityLabels: (parent?: NatTableAccessibilityColumnVisibilityLabels, override?: NatTableAccessibilityColumnVisibilityLabels) => NatTableAccessibilityColumnVisibilityLabels;
/** Merges page-size labels and formatters field by field. */
declare const mergePageSizeLabels: (parent?: NatTableAccessibilityPageSizeLabels, override?: NatTableAccessibilityPageSizeLabels) => NatTableAccessibilityPageSizeLabels;
/** Merges pager labels and formatters field by field. */
declare const mergePagerLabels: (parent?: NatTableAccessibilityPagerLabels, override?: NatTableAccessibilityPagerLabels) => NatTableAccessibilityPagerLabels;
/** Merges horizontal scroll-control labels and formatters field by field. */
declare const mergeScrollControlLabels: (parent?: NatTableAccessibilityScrollControlLabels, override?: NatTableAccessibilityScrollControlLabels) => NatTableAccessibilityScrollControlLabels;
/** Merges selection-column labels and formatters field by field. */
declare const mergeSelectionLabels: (parent?: NatTableAccessibilitySelectionLabels, override?: NatTableAccessibilitySelectionLabels) => NatTableAccessibilitySelectionLabels;
/** Merges header action labels and formatters field by field. */
declare const mergeHeaderActionLabels: (parent?: NatTableAccessibilityHeaderActionLabels, override?: NatTableAccessibilityHeaderActionLabels) => NatTableAccessibilityHeaderActionLabels;

/** Resolves a companion components locale dictionary, falling back to built-in English defaults. */
declare const resolveNatTableControlsIntl: (intl: NatTableControlsIntlConfig, locale: string) => NatTableControlsIntl;

/** Merges render-metrics filter labels and options field by field. */
declare const mergeRenderMetricsFilterIntl: (parent?: NatTableRenderMetricsFilterIntl, override?: NatTableRenderMetricsFilterIntl) => NatTableRenderMetricsFilterIntl;
/** Merges render-metrics panel labels and formatters field by field. */
declare const mergeRenderMetricsPanelIntl: (parent?: NatTableRenderMetricsPanelIntl, override?: NatTableRenderMetricsPanelIntl) => NatTableRenderMetricsPanelIntl;
/** Merges render-metrics column labels and formatters field by field. */
declare const mergeRenderMetricsColumnIntl: (parent?: NatTableRenderMetricsColumnIntl, override?: NatTableRenderMetricsColumnIntl) => NatTableRenderMetricsColumnIntl;
/** Formats generated render-metrics numbers through the configured locale formatter. */
declare const formatNatTableRenderMetricsNumber: (intl: NatTableRenderMetricsIntl, value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;
/** Resolves a render-metrics locale dictionary, falling back to built-in English defaults. */
declare const resolveNatTableRenderMetricsIntl: (intl: NatTableRenderMetricsIntlConfig, locale: string) => NatTableRenderMetricsIntl;

export { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_EN_LOCALE_ID, NAT_EN_LOCALE_LABELS, NAT_EN_RENDER_METRICS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES, NAT_TABLE_BUILT_IN_LOCALES, NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES, NAT_TABLE_CONTROLS_INTL, NAT_TABLE_INTL, NAT_TABLE_RENDER_METRICS_INTL, RENDER_METRICS_FILTER_OPTIONS, formatNatTableNumber, formatNatTableRenderMetricsNumber, injectNatTableRenderMetricsIntl, mergeColumnVisibilityLabels, mergeHeaderActionLabels, mergeNatTableAccessibilityText, mergePageSizeLabels, mergePagerLabels, mergeRenderMetricsColumnIntl, mergeRenderMetricsFilterIntl, mergeRenderMetricsPanelIntl, mergeScrollControlLabels, mergeSelectionLabels, provideNatTableControlsIntl, provideNatTableControlsLocales, provideNatTableIntl, provideNatTableLocales, provideNatTableRenderMetricsIntl, provideNatTableRenderMetricsLocales, resolveNatTableControlsIntl, resolveNatTableIntl, resolveNatTableRenderMetricsIntl };
export type { NatTableAccessibilityColumnReorderAnnouncementContext, NatTableAccessibilityColumnResizeAnnouncementContext, NatTableAccessibilityColumnVisibilityActionContext, NatTableAccessibilityColumnVisibilityAnnouncementChange, NatTableAccessibilityColumnVisibilityAnnouncementContext, NatTableAccessibilityColumnVisibilityLabels, NatTableAccessibilityColumnVisibilityStateContext, NatTableAccessibilityColumnVisibilitySummaryContext, NatTableAccessibilityFilteringAnnouncementContext, NatTableAccessibilityHeaderActionLabels, NatTableAccessibilityHeaderActionMenuContext, NatTableAccessibilityHeaderActionMoveContext, NatTableAccessibilityHeaderActionPinContext, NatTableAccessibilityHeaderActionSortContext, NatTableAccessibilityPageSizeLabels, NatTableAccessibilityPageSizeOptionContext, NatTableAccessibilityPagerContext, NatTableAccessibilityPagerLabels, NatTableAccessibilityPaginationAnnouncementContext, NatTableAccessibilityRowPlaceholderContext, NatTableAccessibilityScrollControlLabels, NatTableAccessibilityScrollControlPositionContext, NatTableAccessibilitySelectionAnnouncementContext, NatTableAccessibilitySelectionLabels, NatTableAccessibilitySelectionRowContext, NatTableAccessibilitySortingAnnouncementContext, NatTableAccessibilitySubHeaderContext, NatTableAccessibilitySummaryContext, NatTableAccessibilityText, NatTableColumnMoveDirection, NatTableColumnVisibilityIntl, NatTableControlsIntl, NatTableControlsIntlConfig, NatTableControlsIntlProviderConfig, NatTableControlsIntlProviderFactory, NatTableControlsIntlProviderSource, NatTableControlsIntlStaticProviderConfig, NatTableControlsLocalesMap, NatTableControlsLocalesProviderConfig, NatTableControlsLocalesProviderFactory, NatTableControlsLocalesProviderSource, NatTableControlsNumberFormatter, NatTableHeaderActionsIntl, NatTableIntl, NatTableIntlConfig, NatTableIntlProviderConfig, NatTableIntlProviderFactory, NatTableIntlProviderSource, NatTableIntlStaticProviderConfig, NatTableLocalesMap, NatTableLocalesProviderConfig, NatTableLocalesProviderFactory, NatTableLocalesProviderSource, NatTableNumberFormatter, NatTablePageSizeIntl, NatTablePagerIntl, NatTableRenderMetricsColumnIntl, NatTableRenderMetricsDurationContext, NatTableRenderMetricsFilterIntl, NatTableRenderMetricsIntl, NatTableRenderMetricsIntlConfig, NatTableRenderMetricsIntlProviderConfig, NatTableRenderMetricsIntlProviderFactory, NatTableRenderMetricsIntlProviderSource, NatTableRenderMetricsIntlStaticProviderConfig, NatTableRenderMetricsLocalesMap, NatTableRenderMetricsLocalesProviderConfig, NatTableRenderMetricsLocalesProviderFactory, NatTableRenderMetricsLocalesProviderSource, NatTableRenderMetricsNumberFormatter, NatTableRenderMetricsPanelIntl, NatTableRenderMetricsRowCountContext, NatTableRenderMetricsWidgetsIntl, NatTableScrollControlIntl, NatTableSelectionIntl, RowRenderFilterOption, RowRenderTone };
