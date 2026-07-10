import type { Signal } from '@angular/core';

import type { ColumnFiltersState, PaginationState, RowData, RowSelectionState, SortingState, Table } from '@tanstack/angular-table';

/** One leaf column's visibility descriptor, in table order. */
export type NatTableColumnVisibilityItem = {
  /** Column id. */
  readonly id: string;
  /** Resolved companion-control label for the column. */
  readonly label: string;
  /** Whether the column is currently visible. */
  readonly visible: boolean;
  /** Whether the column may be hidden (`getCanHide()`). */
  readonly canHide: boolean;
};

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export type NatTableUiController<TData extends RowData = RowData> = {
  /**
   * @deprecated Prefer the typed commands/selectors (sorting, column visibility, and row selection
   * now have typed alternatives). Retained for custom export-handler context and advanced raw reads
   * against the underlying TanStack instance.
   */
  readonly table: Table<TData>;
  /** Current pagination slice (page index and size). */
  readonly pagination: Signal<PaginationState>;
  /** Total page count, floored at 1. */
  readonly pageCount: Signal<number>;
  /** Whether a previous page is available. */
  readonly canPreviousPage: Signal<boolean>;
  /** Whether a next page is available. */
  readonly canNextPage: Signal<boolean>;
  /** Current global filter query (empty string when unset). */
  readonly globalFilter: Signal<string>;
  /** Active column filters. */
  readonly columnFilters: Signal<ColumnFiltersState>;
  /** Current sorting state. */
  readonly sorting: Signal<SortingState>;
  /** All leaf columns in order, with resolved labels and visibility. */
  readonly columnVisibility: Signal<readonly NatTableColumnVisibilityItem[]>;
  /** Current row-selection state. */
  readonly rowSelection: Signal<RowSelectionState>;
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  /** Sets the global search query and resets to the first page. */
  setGlobalFilter(value: string): void;
  /**
   * Upserts a column filter (or clears it when `value` is `undefined`) and resets to the first page.
   * Silently no-ops when `columnId` doesn't match a column.
   */
  setColumnFilter(columnId: string, value: unknown): void;
  /**
   * Single-column absolute sort. `'asc'`/`'desc'` replaces the whole sorting state with just this
   * column; `false` removes this column's entry, leaving any other columns' entries intact.
   * Silently no-ops when `columnId` doesn't match a column.
   */
  setColumnSort(columnId: string, direction: 'asc' | 'desc' | false): void;
  /**
   * Shows or hides a leaf column. Silently no-ops when `columnId` doesn't match a column, or when
   * hiding a column whose `getCanHide()` is `false`.
   */
  setColumnVisible(columnId: string, visible: boolean): void;
  /** Selects or deselects a row by id. Silently no-ops when `rowId` doesn't match a row or when row selection is disabled. */
  setRowSelected(rowId: string, selected: boolean): void;
  /** Clears the entire row-selection state. */
  clearRowSelection(): void;
  /** Sets the page size and returns to the first page. */
  setPageSize(size: number): void;
  /** Navigates to a specific zero-based page index, clamped to the valid page range. */
  goToPage(pageIndex: number): void;
  /** Advances to the next page when one is available. */
  nextPage(): void;
  /** Returns to the previous page when one is available. */
  previousPage(): void;
  /** DOM id of the controlled `<table>`; companion controls bind `aria-controls` to this. */
  readonly tableElementId: Signal<string>;
  /** Scrollable container that wraps the controlled `<table>`, when available. */
  readonly tableScrollContainer?: Signal<HTMLElement | null>;
  /** Locale id used by generated companion-control labels, when available. */
  readonly localeId?: Signal<string>;
};
