/** Formats numbers used in generated companion-control labels. */
export type NatTableUiNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
) => string;

/** Context passed to page-size option label formatters. */
export type NatTableAccessibilityPageSizeOptionContext = {
  /** Candidate page size. */
  pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  pageSizeText: string;
  /** Whether the option represents the currently selected value. */
  selectionState: 'selected' | 'not-selected';
}

/** Optional accessibility label overrides for page-size controls. */
export type NatTableAccessibilityPageSizeLabels = {
  /** `aria-label` applied to the chip group. */
  groupAriaLabel?: string;
  /** Visible text rendered inside each page-size chip. */
  pageSizeOptionText?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
  /** `aria-label` applied to each page-size chip. */
  pageSizeOptionAriaLabel?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
}

/** Context passed to pager page-indicator formatters. */
export type NatTableAccessibilityPagerContext = {
  /** One-based current page number. */
  pageValue: number;
  /** Provider-formatted text for `pageValue`. */
  pageText: string;
  /** Total available pages. */
  pageCountValue: number;
  /** Provider-formatted text for `pageCountValue`. */
  pageCountText: string;
}

/** Optional accessibility label overrides for pager controls. */
export type NatTableAccessibilityPagerLabels = {
  /** `aria-label` applied to the pager group. */
  groupAriaLabel?: string;
  /** `aria-label` for the previous-page button. */
  previousPageAriaLabel?: string;
  /** `aria-label` for the next-page button. */
  nextPageAriaLabel?: string;
  /** Visible page-indicator text between the pager buttons. */
  pageIndicator?: (context: NatTableAccessibilityPagerContext) => string;
}

/** Context passed to horizontal scroll position label formatters. */
export type NatTableAccessibilityScrollControlPositionContext = {
  /** Current horizontal scroll offset in CSS pixels. */
  scrollLeftValue: number;
  /** Provider-formatted text for `scrollLeftValue`. */
  scrollLeftText: string;
  /** Maximum horizontal scroll offset in CSS pixels. */
  maxScrollLeftValue: number;
  /** Provider-formatted text for `maxScrollLeftValue`. */
  maxScrollLeftText: string;
  /** Rounded scroll completion percentage from 0 to 100. */
  percentageValue: number;
  /** Provider-formatted text for `percentageValue`. */
  percentageText: string;
}

/** Optional accessibility label overrides for horizontal scroll controls. */
export type NatTableAccessibilityScrollControlLabels = {
  /** `aria-label` applied to the scroll control group. */
  groupAriaLabel?: string;
  /** `aria-label` for the scroll-left button. */
  scrollLeftAriaLabel?: string;
  /** `aria-label` for the scroll-right button. */
  scrollRightAriaLabel?: string;
  /** `aria-label` applied to the horizontal scroll slider. */
  scrollPositionAriaLabel?: string;
  /** Visible and screen-reader position text for the scroll slider. */
  scrollPositionText?: (context: NatTableAccessibilityScrollControlPositionContext) => string;
}

/** Context passed to column-visibility summary formatters. */
export type NatTableAccessibilityColumnVisibilitySummaryContext = {
  /** Number of currently visible leaf columns. */
  visibleColumnCountValue: number;
  /** Provider-formatted text for `visibleColumnCountValue`. */
  visibleColumnCountText: string;
  /** Total leaf-column count. */
  totalColumnCountValue: number;
  /** Provider-formatted text for `totalColumnCountValue`. */
  totalColumnCountText: string;
}

/** Context passed to column-visibility button label formatters. */
export type NatTableAccessibilityColumnVisibilityActionContext = {
  /** Human-readable column label. */
  columnLabel: string;
  /** Current visibility state before toggling. */
  visibilityState: 'visible' | 'hidden';
  /** Action that activating the control will perform. */
  toggleAction: 'show' | 'hide';
}

/** Context passed to column state label formatters. */
export type NatTableAccessibilityColumnVisibilityStateContext = {
  /** Current visibility state. */
  visibilityState: 'visible' | 'hidden';
}

/** Optional accessibility label overrides for column-visibility controls. */
export type NatTableAccessibilityColumnVisibilityLabels = {
  /** Visible heading rendered above the chip group. */
  heading?: string;
  /** `aria-label` applied to the chip group. */
  groupAriaLabel?: string;
  /** Visible caption showing how many columns are active. */
  visibilitySummary?: (context: NatTableAccessibilityColumnVisibilitySummaryContext) => string;
  /** `aria-label` applied to each column chip. */
  toggleColumnAriaLabel?: (context: NatTableAccessibilityColumnVisibilityActionContext) => string;
  /** Visible state text rendered inside each chip. */
  columnState?: (context: NatTableAccessibilityColumnVisibilityStateContext) => string;
}

/** Context passed to per-row selection checkbox label formatters. */
export type NatTableAccessibilitySelectionRowContext = {
  /** Stable row id resolved through the table's `getRowId`. */
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
  label: string;
  /** Current sort state before toggling. */
  sortState: 'ascending' | 'descending' | 'none';
  /** 1-based position in a multi-column sort, or `null` when this column is not sorted. */
  sortPriority: number | null;
  /** Total number of columns currently sorted. */
  sortCount: number;
}

/** Context passed to the overflow menu trigger label formatter. */
export type NatTableAccessibilityHeaderActionMenuContext = {
  /** Human-readable column label. */
  label: string;
}

/** Context passed to pin-button label formatters. */
export type NatTableAccessibilityHeaderActionPinContext = {
  /** Human-readable column label. */
  label: string;
  /** Whether the column is pinned at all before toggling. */
  pinState: 'pinned' | 'unpinned';
  /** Action that activating the control will perform. */
  toggleAction: 'pin' | 'unpin';
  /** Side targeted by the current button. */
  pinSide: 'left' | 'right';
  /** Currently active pin side for the column, if any. */
  pinnedSide: 'left' | 'right' | null;
}

/** Direction used by generated move-column labels. */
export type NatTableColumnMoveDirection = 'left' | 'right';

/** Context passed to move-column label formatters. */
export type NatTableAccessibilityHeaderActionMoveContext = {
  /** Human-readable column label. */
  label: string;
  /** Direction targeted by the current button. */
  direction: NatTableColumnMoveDirection;
}

/** Optional accessibility label overrides for header sort, pin, and move actions. */
export type NatTableAccessibilityHeaderActionLabels = {
  /** `aria-label` applied to the sort button. */
  sortButton?: (context: NatTableAccessibilityHeaderActionSortContext) => string;
  /** `aria-label` applied to the overflow menu trigger. */
  menuButton?: (context: NatTableAccessibilityHeaderActionMenuContext) => string;
  /** `aria-label` applied to the opened column actions menu. */
  menuLabel?: (context: NatTableAccessibilityHeaderActionMenuContext) => string;
  /** `aria-label` applied to the pin button. */
  pinButton?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
  /** Visible text rendered inside each pin action menu item. */
  pinButtonText?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
  /** `aria-label` applied to the move-column button. */
  moveButton?: (context: NatTableAccessibilityHeaderActionMoveContext) => string;
  /** Visible text rendered inside each move-column menu item. */
  moveButtonText?: (context: NatTableAccessibilityHeaderActionMoveContext) => string;
}

export type NatTableSearchIntl = {
  /** Visible label for the global search field. */
  label?: string;
  /** Placeholder for the global search field. */
  placeholder?: string;
}

export type NatTableColumnVisibilityIntl = {
  /** Visible heading above the column visibility chips. */
  label?: string;
  /** `aria-label` applied to the column visibility chip group. */
  groupAriaLabel?: string;
  /** Generated labels and summaries for the column visibility control. */
  accessibilityLabels?: NatTableAccessibilityColumnVisibilityLabels;
}

export type NatTablePageSizeIntl = {
  /** `aria-label` applied to the page-size chip group. */
  groupAriaLabel?: string;
  /** Generated labels for page-size options. */
  accessibilityLabels?: NatTableAccessibilityPageSizeLabels;
}

export type NatTablePagerIntl = {
  /** `aria-label` applied to the pager control group. */
  groupAriaLabel?: string;
  /** Generated pager button and indicator labels. */
  accessibilityLabels?: NatTableAccessibilityPagerLabels;
}

export type NatTableScrollControlIntl = {
  /** `aria-label` applied to the horizontal scroll control group. */
  groupAriaLabel?: string;
  /** Generated scroll button, slider, and position labels. */
  accessibilityLabels?: NatTableAccessibilityScrollControlLabels;
}

export type NatTableHeaderActionsIntl = {
  /** Generated sort, menu, pin, and move labels for header action controls. */
  accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
}

export type NatTableToolbarIntl = {
  /** Default `aria-label` for the toolbar container; the `accessibleName` input wins. */
  toolbarLabel?: string;
}

export type NatTableSelectionIntl = {
  /** Human-readable label for the generated selection column. */
  readonly columnLabel?: string;
  /** Generated labels for the selection checkboxes. */
  readonly accessibilityLabels?: NatTableAccessibilitySelectionLabels;
};

/** Locale-specific defaults for generated `ng-advanced-table-ui` copy. */
export type NatTableUiIntl = {
  search?: NatTableSearchIntl;
  columnVisibility?: NatTableColumnVisibilityIntl;
  pageSize?: NatTablePageSizeIntl;
  pager?: NatTablePagerIntl;
  scrollControl?: NatTableScrollControlIntl;
  headerActions?: NatTableHeaderActionsIntl;
  toolbar?: NatTableToolbarIntl;
  selection?: NatTableSelectionIntl;
  /** Number formatter used for `...Text` fields passed to generated label formatters. */
  formatNumber?: NatTableUiNumberFormatter;
}

export type NatTableUiIntlConfig = {
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableUiIntl>;
}

export type NatTableUiIntlProviderConfig = NatTableUiIntl | NatTableUiIntlConfig;

/** UI locale dictionaries keyed by locale id. */
export type NatTableUiLocaleLabelsMap = Record<string, NatTableUiIntl>;

/** Alias for the UI locale label shape. */
export type NatTableUiLocaleLabels = NatTableUiIntl;
