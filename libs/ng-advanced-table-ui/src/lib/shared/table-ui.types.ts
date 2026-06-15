import type { Signal } from '@angular/core';
import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  FlexRenderContent,
  PaginationState,
  RowData,
  SortingState,
  Table,
  Updater,
  VisibilityState,
} from '@tanstack/angular-table';
import type {
  NatTableUiController as CoreNatTableUiController,
  NatTableUiState as CoreNatTableUiState,
} from 'ng-advanced-table';

export type NatTableUiState = CoreNatTableUiState;
export type NatTableUiController<TData extends RowData = RowData> = CoreNatTableUiController<TData>;

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
 * Custom content accepted by `withNatTableHeaderActions(..., { sortIndicator })`.
 *
 * Return a string/number for simple glyph swaps, or a FlexRender-compatible
 * renderer for richer Angular content.
 */
export type NatTableSortIndicatorContent =
  | string
  | number
  | ((
      props: NatTableSortIndicatorContext<RowData>,
    ) => FlexRenderContent<NatTableSortIndicatorContext<RowData>>)
  | null
  | undefined;

/** Per-column options for the header action wrapper. */
export interface NatTableHeaderActionsColumnOptions {
  /** Custom content rendered inside the sort button for this column. */
  sortIndicator?: NatTableSortIndicatorContent;
  /** Optional accessibility label overrides for this column's built-in actions. */
  accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
}

/**
 * Extra metadata understood by companion UI when attached to a TanStack
 * column definition. This mirrors the workspace's internal contract without
 * exposing a private package to consumers.
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
  /** Optional callback that maps a cell to a semantic tone. */
  cellTone?: (
    context: CellContext<TData, TValue>,
  ) => 'positive' | 'negative' | 'neutral' | 'warning' | null;
  /** Optional header-only width in pixels. Does not affect body cells. */
  headerSize?: number | string;
  /** Optional header-only minimum width in pixels. Does not affect body cells. */
  headerMinSize?: number | string;
  /** Optional header-only maximum width in pixels. Does not affect body cells. */
  headerMaxSize?: number | string;
}

/** Context passed to page-size option label formatters. */
export interface NatTableAccessibilityPageSizeOptionContext {
  /** Candidate page size. */
  pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  pageSizeText: string;
  /** Whether the option represents the currently selected value. */
  selectionState: 'selected' | 'not-selected';
}

/** Optional accessibility label overrides for `NatTablePageSize`. */
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

/** Optional accessibility label overrides for `NatTablePager`. */
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

/** Optional accessibility label overrides for `NatTableScrollControl`. */
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

/** Optional accessibility label overrides for `NatTableColumnVisibility`. */
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
  /** 1-based position in a multi-column sort, or `null` when this column is not sorted. */
  sortPriority: number | null;
  /** Total number of columns currently sorted. */
  sortCount: number;
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

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {
    /**
     * Controls the shared header action wrapper for this column.
     *
     * Set to `false` to opt out of `withNatTableHeaderActions(...)`, or provide
     * overrides that merge with the helper-level options for this column only.
     */
    headerActions?: false | NatTableHeaderActionsColumnOptions;
  }
}
