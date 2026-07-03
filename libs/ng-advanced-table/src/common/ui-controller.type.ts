import type { Signal } from '@angular/core';

import type { ColumnFiltersState, PaginationState, RowData, Table } from '@tanstack/angular-table';

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export type NatTableUiController<TData extends RowData = RowData> = {
  /**
   * @deprecated Prefer the typed selectors; retained for rich column-object reads (column-visibility).
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
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  /** Sets the global search query and resets to the first page. */
  setGlobalFilter(value: string): void;
  /** Upserts a column filter (or clears it when `value` is `undefined`) and resets to the first page. */
  setColumnFilter(columnId: string, value: unknown): void;
  /** Sets the page size and returns to the first page. */
  setPageSize(size: number): void;
  /** Navigates to a specific zero-based page index. */
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
