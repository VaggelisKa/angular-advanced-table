import type { PaginationState, SortingState } from '@tanstack/angular-table';

import type { TableColumnAccessibilityState } from './column-render.type';
import type { NatTableDataStatus } from './table-status.type';

/** Formats a number into locale-aware screen-reader text. */
export type FormatAccessibilityNumber = (value: number) => string;

/**
 * Captured accessible-state snapshot diffed between reactive updates to build
 * live announcements. Core-internal; produced by the a11y service reading live
 * signals, then consumed by the pure announcement builders.
 */
export type TableAccessibilitySnapshot = {
  readonly dataStatus: NatTableDataStatus;
  readonly sorting: SortingState;
  readonly sortingKey: string;
  readonly globalFilter: string;
  readonly columnFiltersKey: string;
  readonly rowSelectionKey: string;
  readonly selectedRowCount: number;
  readonly pagination: PaginationState;
  readonly pageCount: number;
  readonly visibleRows: number;
  readonly totalRows: number;
  readonly columns: TableColumnAccessibilityState[];
};
