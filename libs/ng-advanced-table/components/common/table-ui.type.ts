/* eslint-disable max-lines */
import type { CellContext, Column, FlexRenderContent, HeaderContext, Row, RowData } from '@tanstack/angular-table';

import type {
  NatTableColumnMoveDirection as CoreNatTableColumnMoveDirection,
  NatTableUiController as CoreNatTableUiController,
  NatTableUiState as CoreNatTableUiState
} from 'ng-advanced-table';

export type NatTableUiState = CoreNatTableUiState;

export type NatTableUiController<TData extends RowData = RowData> = CoreNatTableUiController<TData>;

export type NatTableColumnMoveDirection = CoreNatTableColumnMoveDirection;

/** Current sort direction for a header cell. */
export type NatTableSortDirection = 'asc' | 'desc' | false;

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

/**
 * Custom content accepted by `withNatTableHeaderActions(..., { sortIndicator })`.
 *
 * Return a string/number for simple glyph swaps, or a FlexRender-compatible
 * renderer for richer Angular content.
 */
export type NatTableSortIndicatorContent =
  | string
  | number
  | ((props: NatTableSortIndicatorContext<RowData>) => FlexRenderContent<NatTableSortIndicatorContext<RowData>>)
  | null
  | undefined;

/** Custom header content accepted by columns wrapped with {@link withNatTableHeaderActions}. */
export type NatTableHeaderRenderContent =
  | string
  | number
  | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>)
  | null
  | undefined;

/**
 * Options for {@link withNatTableHeaderActions}.
 *
 * Use `sortIndicator` to replace the built-in unsorted/ascending/descending glyphs
 * while keeping the same sort, pin, and move-column menu behavior.
 */
export type NatTableHeaderActionsOptions = {
  /** Custom content rendered inside the sort button for each sortable column. */
  readonly sortIndicator?: NatTableSortIndicatorContent;
  /** Static locale override for generated action labels. Defaults to the hosting table locale. */
  readonly locale?: string;
  /** Optional accessibility label overrides for the built-in sort, pin, and move actions. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
  /** Enables left/right pin menu items when the controlled table can pin this column. */
  readonly enableColumnPinActions?: boolean;
  /** Enables Move left / Move right menu items when the controlled table can reorder this column. */
  readonly enableColumnReorderActions?: boolean;
};

/** Value returned by table export metadata before format-specific normalization. */
type NatTableColumnExportValue = unknown;

/** Context passed to column export value callbacks. */
export type NatTableColumnExportValueContext<TData extends RowData = RowData, TValue = unknown> = {
  /** Row being exported. */
  readonly row: Row<TData>;
  /** Column being exported. */
  readonly column: Column<TData, TValue>;
  /** Raw value resolved from the row and column before export-specific normalization. */
  readonly value: TValue;
};

/** Export behavior attached to a table column definition. */
export type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
  /** Whether the column participates in table export. Accessor columns opt in by default. */
  readonly enabled?: boolean;
  /** Header text used by export formats. Defaults to column labels and identifiers. */
  readonly header?: string;
  /** Maps a row/column value into an export value. Defaults to the raw accessor value. */
  readonly value?: (context: NatTableColumnExportValueContext<TData, TValue>) => NatTableColumnExportValue;
};

/** Per-column options for the header action wrapper. */
type NatTableHeaderActionsColumnOptions = {
  /** Custom content rendered inside the sort button for this column. */
  readonly sortIndicator?: NatTableSortIndicatorContent;
  /** Optional accessibility label overrides for this column's built-in actions. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
  /** Enables left/right pin menu items for this column when the table can pin it. */
  readonly enableColumnPinActions?: boolean;
  /** Enables Move left / Move right menu items for this column when the table can reorder it. */
  readonly enableColumnReorderActions?: boolean;
};

/**
 * Extra metadata understood by companion UI when attached to a TanStack
 * column definition. This mirrors the workspace's internal contract without
 * exposing a private package to consumers.
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
  /** Optional callback that maps a cell to a semantic tone. */
  readonly cellTone?: (context: CellContext<TData, TValue>) => 'positive' | 'negative' | 'neutral' | 'warning' | null;
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

/** Context passed to page-size option label formatters. */
export type NatTableAccessibilityPageSizeOptionContext = {
  /** Candidate page size. */
  readonly pageSizeValue: number;
  /** Provider-formatted text for `pageSizeValue`. */
  readonly pageSizeText: string;
  /** Whether the option represents the currently selected value. */
  readonly selectionState: 'selected' | 'not-selected';
};

/** Optional accessibility label overrides for `NatTablePageSize`. */
export type NatTableAccessibilityPageSizeLabels = {
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

/** Optional accessibility label overrides for `NatTablePager`. */
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

/** Optional accessibility label overrides for `NatTableScrollControl`. */
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

/** Optional accessibility label overrides for `NatTableColumnVisibility`. */
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
type NatTableAccessibilitySelectionRowContext = {
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

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface merging, not a type alias
  interface ColumnMeta<TData extends RowData, TValue> extends NatTableColumnMeta<TData, TValue> {
    /**
     * Controls the shared header action wrapper for this column.
     *
     * Set to `false` to opt out of `withNatTableHeaderActions(...)`, or provide
     * overrides that merge with the helper-level options for this column only.
     */
    readonly headerActions?: false | NatTableHeaderActionsColumnOptions;
  }
}
