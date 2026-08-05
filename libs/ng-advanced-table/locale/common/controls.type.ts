/** Formats numbers used in generated companion-control labels. */
export type NatTableControlsNumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;

/** Context passed to page-size option label formatters. */
export type NatTableAccessibilityPageSizeOptionContext = {
  /** Candidate page size. */
  readonly pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  readonly pageSizeText: string;
  /** Whether the option represents the currently selected value. */
  readonly selectionState: 'selected' | 'not-selected';
};

/** Optional accessibility label overrides for page-size controls. */
export type NatTableAccessibilityPageSizeLabels = {
  /** `aria-label` applied to the chip group. */
  readonly groupAriaLabel?: string;
  /** Visible text rendered inside each page-size chip. */
  readonly pageSizeOptionText?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
  /** `aria-label` applied to each page-size chip. */
  readonly pageSizeOptionAriaLabel?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
};

/** Context passed to pager page-indicator formatters. */
export type NatTableAccessibilityPagerContext = {
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
export type NatTableAccessibilityPagerLabels = {
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
export type NatTableAccessibilityScrollControlPositionContext = {
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
export type NatTableAccessibilityScrollControlLabels = {
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
export type NatTableAccessibilityColumnVisibilitySummaryContext = {
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
export type NatTableAccessibilityColumnVisibilityActionContext = {
  /** Human-readable column label. */
  readonly columnLabel: string;
  /** Current visibility state before toggling. */
  readonly visibilityState: 'visible' | 'hidden';
  /** Action that activating the control will perform. */
  readonly toggleAction: 'show' | 'hide';
};

/** Context passed to column state label formatters. */
export type NatTableAccessibilityColumnVisibilityStateContext = {
  /** Current visibility state. */
  readonly visibilityState: 'visible' | 'hidden';
};

/** Optional accessibility label overrides for column-visibility controls. */
export type NatTableAccessibilityColumnVisibilityLabels = {
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
export type NatTableAccessibilitySelectionRowContext = {
  /** Stable row id resolved by `<nat-table>`. */
  readonly rowId: string;
};

/** Optional accessibility label overrides for the generated selection column. */
export type NatTableAccessibilitySelectionLabels = {
  /** `aria-label` applied to the select-all header checkbox. */
  readonly selectAllAriaLabel?: string;
  /** `aria-label` applied to each per-row checkbox. */
  readonly selectRowAriaLabel?: (context: NatTableAccessibilitySelectionRowContext) => string;
};

/** Context passed to sort-button label formatters. */
export type NatTableAccessibilityHeaderActionSortContext = {
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
export type NatTableAccessibilityHeaderActionMenuContext = {
  /** Human-readable column label. */
  readonly label: string;
};

/** Context passed to pin-button label formatters. */
export type NatTableAccessibilityHeaderActionPinContext = {
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
export type NatTableColumnMoveDirection = 'left' | 'right';

/** Context passed to move-column label formatters. */
export type NatTableAccessibilityHeaderActionMoveContext = {
  /** Human-readable column label. */
  readonly label: string;
  /** Direction targeted by the current button. */
  readonly direction: NatTableColumnMoveDirection;
};

/** Optional accessibility label overrides for header sort, pin, and move actions. */
export type NatTableAccessibilityHeaderActionLabels = {
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

export type NatTableColumnVisibilityIntl = {
  /** Visible heading above the column visibility chips. */
  readonly label?: string;
  /** `aria-label` applied to the column visibility chip group. */
  readonly groupAriaLabel?: string;
  /** Generated labels and summaries for the column visibility control. */
  readonly accessibilityLabels?: NatTableAccessibilityColumnVisibilityLabels;
};

export type NatTablePageSizeIntl = {
  /** `aria-label` applied to the page-size chip group. */
  readonly groupAriaLabel?: string;
  /** Generated labels for page-size options. */
  readonly accessibilityLabels?: NatTableAccessibilityPageSizeLabels;
};

export type NatTablePagerIntl = {
  /** `aria-label` applied to the pager control group. */
  readonly groupAriaLabel?: string;
  /** Generated pager button and indicator labels. */
  readonly accessibilityLabels?: NatTableAccessibilityPagerLabels;
};

export type NatTableScrollControlIntl = {
  /** `aria-label` applied to the horizontal scroll control group. */
  readonly groupAriaLabel?: string;
  /** Generated scroll button, slider, and position labels. */
  readonly accessibilityLabels?: NatTableAccessibilityScrollControlLabels;
};

export type NatTableHeaderActionsIntl = {
  /** Generated sort, menu, pin, and move labels for header action controls. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
};

type NatTableToolbarIntl = {
  /** Default `aria-label` for the toolbar container; the `accessibleName` input wins. */
  readonly toolbarLabel?: string;
};

export type NatTableSelectionIntl = {
  /** Human-readable label for the generated selection column. */
  readonly columnLabel?: string;
  /** Generated labels for the selection checkboxes. */
  readonly accessibilityLabels?: NatTableAccessibilitySelectionLabels;
};

/** Locale-specific defaults for generated `ng-advanced-table/components` copy. */
export type NatTableControlsIntl = {
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

export type NatTableControlsIntlConfig = {
  /** Locale dictionaries keyed by locale id. */
  readonly locales?: Record<string, NatTableControlsIntl>;
};

export type NatTableControlsIntlStaticProviderConfig = NatTableControlsIntl | NatTableControlsIntlConfig;

/** Components locale dictionaries keyed by locale id. */
export type NatTableControlsLocalesMap = Record<string, NatTableControlsIntl>;
