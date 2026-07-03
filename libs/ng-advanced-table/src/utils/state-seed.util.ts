import type { PaginationState, Updater } from '@tanstack/angular-table';

import type { NatTableUserState } from '../common/table-state.type';

export const isUnavailableRequiredInputError = (error: unknown): error is Error & { readonly code?: number } => {
  return error instanceof Error && Math.abs((error as { readonly code?: number }).code ?? 0) === 950;
};

/** Resolves a TanStack `Updater<T>` (value or function) against the current value. */
export const resolveUpdater = <T>(currentValue: T, updater: Updater<T> | undefined): T => {
  if (updater === undefined) {
    return currentValue;
  }

  return updater instanceof Function ? updater(currentValue) : updater;
};

/** Resets pagination to the first page while preserving page size. */
export const firstPageUpdater: Updater<PaginationState> = (currentPagination) => ({
  ...currentPagination,
  pageIndex: 0
});

/**
 * Reads a required signal input, returning `fallback` while the input is still
 * unavailable (Angular throws NG0950 before the first binding). Re-throws anything else.
 */
export const readRequiredInput = <T>(reader: () => T, fallback: T): T => {
  try {
    return reader();
  } catch (error) {
    if (isUnavailableRequiredInputError(error)) {
      return fallback;
    }

    throw error;
  }
};

/** Returns `value` when defined, otherwise `fallback` (kept as a call so callers stay `??`-free). */
const orDefault = <T>(value: T | undefined, fallback: T): T => value ?? fallback;

/**
 * Fills every slice of a partial initial state from `defaults`, leaving the caller to
 * apply `this`-dependent normalization (sorting/selection) and the globalFilter gate.
 */
export const resolveSeedState = (initialState: Partial<NatTableUserState>, defaults: NatTableUserState): NatTableUserState => ({
  sorting: orDefault(initialState.sorting, defaults.sorting),
  globalFilter: orDefault(initialState.globalFilter, defaults.globalFilter),
  columnFilters: orDefault(initialState.columnFilters, defaults.columnFilters),
  columnVisibility: orDefault(initialState.columnVisibility, defaults.columnVisibility),
  columnOrder: orDefault(initialState.columnOrder, defaults.columnOrder),
  columnPinning: orDefault(initialState.columnPinning, defaults.columnPinning),
  columnSizing: orDefault(initialState.columnSizing, defaults.columnSizing),
  rowSelection: orDefault(initialState.rowSelection, defaults.rowSelection),
  pagination: {
    pageIndex: orDefault(initialState.pagination?.pageIndex, defaults.pagination.pageIndex),
    pageSize: orDefault(initialState.pagination?.pageSize, defaults.pagination.pageSize)
  }
});
