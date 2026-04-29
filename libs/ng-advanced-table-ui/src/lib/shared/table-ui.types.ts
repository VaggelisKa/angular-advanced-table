import type { Signal } from '@angular/core';
import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
  RowData,
  SortingState,
  Table,
  Updater,
  VisibilityState,
} from '@tanstack/angular-table';

/**
 * Serializable state shape expected by `ng-advanced-table-ui` companion
 * controls.
 *
 * This mirrors the slices surfaced by `NatTable.patchState(...)`, including
 * column ordering for drag-and-drop header actions.
 */
export interface NatTableUiState {
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  pagination: PaginationState;
}

/**
 * Minimal table-controller contract consumed by the optional UI package.
 *
 * `<nat-table #grid="natTable">` satisfies this shape directly, but custom
 * wrappers can also implement it to reuse the stock controls.
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
}

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
 * Extra metadata understood by companion UI when attached to a TanStack
 * column definition.
 */
export interface NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> {
  /** Accessible label used by companion controls when the header is not a string. */
  label?: string;
  /** Horizontal alignment for header and body cells in the column. */
  align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  rowHeader?: boolean;
  /** Optional callback that maps a cell to a semantic tone-like value. */
  cellTone?: (context: CellContext<TData, TValue>) => unknown;
}

/** Context passed to page-size option label formatters. */
export interface NatTableAccessibilityPageSizeOptionContext {
  /** Candidate page size. */
  pageSizeValue: number;
  /** Browser-locale text for `pageSizeValue`. */
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
  /** Browser-locale text for `pageValue`. */
  pageText: string;
  /** Total available pages. */
  pageCountValue: number;
  /** Browser-locale text for `pageCountValue`. */
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

/** Context passed to column-visibility summary formatters. */
export interface NatTableAccessibilityColumnVisibilitySummaryContext {
  /** Number of currently visible leaf columns. */
  visibleColumnCountValue: number;
  /** Browser-locale text for `visibleColumnCountValue`. */
  visibleColumnCountText: string;
  /** Total leaf-column count. */
  totalColumnCountValue: number;
  /** Browser-locale text for `totalColumnCountValue`. */
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
  /** `aria-label` applied to the pin button. */
  pinButton?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
  /** Visible text rendered inside each pin menu item. */
  pinButtonText?: (context: NatTableAccessibilityHeaderActionPinContext) => string;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    TData extends import('@tanstack/angular-table').RowData,
    TValue,
  > extends NatTableColumnMeta<TData, TValue> {}
}
