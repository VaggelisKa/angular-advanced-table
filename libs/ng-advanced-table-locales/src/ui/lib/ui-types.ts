/** Formats numbers used in generated companion-control labels. */
export type NatTableUiNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
) => string;

/** Context passed to page-size option label formatters. */
export interface NatTableAccessibilityPageSizeOptionContext {
  /** Candidate page size. */
  pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  pageSizeText: string;
  /** Whether the option represents the currently selected value. */
  selectionState: 'selected' | 'not-selected';
}

/** Optional accessibility label overrides for page-size controls. */
export interface NatTableAccessibilityPageSizeLabels {
  /** `aria-label` applied to the chip group. */
  groupAriaLabel?: string;
  /** Visible text rendered inside each page-size chip. */
  pageSizeOptionText?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
  /** `aria-label` applied to each page-size chip. */
  pageSizeOptionAriaLabel?: (context: NatTableAccessibilityPageSizeOptionContext) => string;
}

/** Context passed to pager page-indicator formatters. */
export interface NatTableAccessibilityPagerContext {
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
export interface NatTableAccessibilityPagerLabels {
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
export interface NatTableAccessibilityScrollControlPositionContext {
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
export interface NatTableAccessibilityScrollControlLabels {
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
export interface NatTableAccessibilityColumnVisibilitySummaryContext {
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
export interface NatTableAccessibilityColumnVisibilityActionContext {
  /** Human-readable column label. */
  columnLabel: string;
  /** Current visibility state before toggling. */
  visibilityState: 'visible' | 'hidden';
  /** Action that activating the control will perform. */
  toggleAction: 'show' | 'hide';
}

/** Context passed to column state label formatters. */
export interface NatTableAccessibilityColumnVisibilityStateContext {
  /** Current visibility state. */
  visibilityState: 'visible' | 'hidden';
}

/** Optional accessibility label overrides for column-visibility controls. */
export interface NatTableAccessibilityColumnVisibilityLabels {
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

/** Context passed to sort-button label formatters. */
export interface NatTableAccessibilityHeaderActionSortContext {
  /** Human-readable column label. */
  label: string;
  /** Current sort state before toggling. */
  sortState: 'ascending' | 'descending' | 'none';
}

/** Context passed to the overflow menu trigger label formatter. */
export interface NatTableAccessibilityHeaderActionMenuContext {
  /** Human-readable column label. */
  label: string;
}

/** Context passed to pin-button label formatters. */
export interface NatTableAccessibilityHeaderActionPinContext {
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

/** Optional accessibility label overrides for header sort/pin actions. */
export interface NatTableAccessibilityHeaderActionLabels {
  /** `aria-label` applied to the sort button. */
  sortButton?: (context: NatTableAccessibilityHeaderActionSortContext) => string;
  /** `aria-label` applied to the overflow menu trigger. */
  menuButton?: (context: NatTableAccessibilityHeaderActionMenuContext) => string;
  /** `aria-label` applied to the opened pinning menu. */
  menuLabel?: (context: NatTableAccessibilityHeaderActionMenuContext) => string;
  /** `aria-label` applied to the pin button. */
  pinButton?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
  /** Visible text rendered inside each pin menu item. */
  pinButtonText?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
}

export interface NatTableSearchIntl {
  /** Visible label for the global search field. */
  label?: string;
  /** Placeholder for the global search field. */
  placeholder?: string;
}

export interface NatTableColumnVisibilityIntl {
  /** Visible heading above the column visibility chips. */
  label?: string;
  /** `aria-label` applied to the column visibility chip group. */
  groupAriaLabel?: string;
  /** Generated labels and summaries for the column visibility control. */
  accessibilityLabels?: NatTableAccessibilityColumnVisibilityLabels;
}

export interface NatTablePageSizeIntl {
  /** `aria-label` applied to the page-size chip group. */
  groupAriaLabel?: string;
  /** Generated labels for page-size options. */
  accessibilityLabels?: NatTableAccessibilityPageSizeLabels;
}

export interface NatTablePagerIntl {
  /** `aria-label` applied to the pager control group. */
  groupAriaLabel?: string;
  /** Generated pager button and indicator labels. */
  accessibilityLabels?: NatTableAccessibilityPagerLabels;
}

export interface NatTableScrollControlIntl {
  /** `aria-label` applied to the horizontal scroll control group. */
  groupAriaLabel?: string;
  /** Generated scroll button, slider, and position labels. */
  accessibilityLabels?: NatTableAccessibilityScrollControlLabels;
}

export interface NatTableHeaderActionsIntl {
  /** Generated sort, menu, and pin labels for header action controls. */
  accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
}

/** Context passed to the More-button label formatter. */
export interface NatTableAccessibilityToolbarMoreButtonContext {
  /** Number of items currently collapsed into the More menu. */
  hiddenCountValue: number;
  /** Provider-formatted text for `hiddenCountValue`. */
  hiddenCountText: string;
}

/** Context passed to sort menu item label formatters. */
export interface NatTableAccessibilityToolbarSortMenuItemContext {
  /** Human-readable column label. */
  columnLabel: string;
  /** Direction the menu item applies when activated. */
  direction: 'ascending' | 'descending' | 'none';
  /** Whether this direction is currently active for the column. */
  active: boolean;
}

/** Context passed to column visibility menu item label formatters. */
export interface NatTableAccessibilityToolbarColumnMenuItemContext {
  /** Human-readable column label. */
  columnLabel: string;
  /** Whether the column is currently visible. */
  visible: boolean;
}

/** Optional accessibility label overrides for the table toolbar and its built-ins. */
export interface NatTableAccessibilityToolbarLabels {
  /** `aria-label` applied to the More overflow button. */
  moreButton?: (context: NatTableAccessibilityToolbarMoreButtonContext) => string;
  /** `aria-label` applied to the opened More menu. */
  moreMenuLabel?: () => string;
  /** `aria-label` applied to the collapsed search expand button. */
  searchExpandButton?: () => string;
  /** `aria-label` applied to each sort direction menu item (menuitemradio). */
  sortMenuItem?: (context: NatTableAccessibilityToolbarSortMenuItemContext) => string;
  /** `aria-label` applied to each column visibility menu item (menuitemcheckbox). */
  viewMenuItem?: (context: NatTableAccessibilityToolbarColumnMenuItemContext) => string;
}

export interface NatTableToolbarIntl {
  /** Default `aria-label` for the toolbar container; the `accessibleName` input wins. */
  toolbarLabel?: string;
  /** Visible label and `aria-label` for the sort menu trigger. */
  sortMenuLabel?: string;
  /** Visible label and `aria-label` for the column visibility menu trigger. */
  viewMenuLabel?: string;
  /** Visible label and `aria-label` for the generic actions menu trigger. */
  actionsMenuLabel?: string;
  /** Generated labels for the toolbar shell and built-in menus. */
  accessibilityLabels?: NatTableAccessibilityToolbarLabels;
}

/** Locale-specific defaults for generated `ng-advanced-table-ui` copy. */
export interface NatTableUiIntl {
  search?: NatTableSearchIntl;
  columnVisibility?: NatTableColumnVisibilityIntl;
  pageSize?: NatTablePageSizeIntl;
  pager?: NatTablePagerIntl;
  scrollControl?: NatTableScrollControlIntl;
  headerActions?: NatTableHeaderActionsIntl;
  toolbar?: NatTableToolbarIntl;
  /** Number formatter used for `...Text` fields passed to generated label formatters. */
  formatNumber?: NatTableUiNumberFormatter;
}

export interface NatTableUiIntlConfig {
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableUiIntl>;
}

export type NatTableUiIntlProviderConfig = NatTableUiIntl | NatTableUiIntlConfig;

/** UI locale dictionaries keyed by locale id. */
export type NatTableUiLocaleLabelsMap = Record<string, NatTableUiIntl>;

/** Alias for the UI locale label shape. */
export type NatTableUiLocaleLabels = NatTableUiIntl;
