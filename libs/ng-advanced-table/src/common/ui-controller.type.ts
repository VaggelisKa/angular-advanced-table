import type { Signal } from '@angular/core';

import type { RowData, Table, Updater } from '@tanstack/angular-table';

import type { NatTableUiState } from './table-state.type';

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export type NatTableUiController<TData extends RowData = RowData> = {
  readonly table: Table<TData>;
  enableGlobalFilter(): boolean;
  enablePagination(): boolean;
  patchState(
    updaters: Partial<{
      [K in keyof NatTableUiState]: Updater<NatTableUiState[K]>;
    }>
  ): void;
  /** DOM id of the controlled `<table>`; companion controls bind `aria-controls` to this. */
  readonly tableElementId: Signal<string>;
  /** Scrollable container that wraps the controlled `<table>`, when available. */
  readonly tableScrollContainer?: Signal<HTMLElement | null>;
  /** Locale id used by generated companion-control labels, when available. */
  readonly localeId?: Signal<string>;
};
