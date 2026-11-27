import type { Signal } from '@angular/core';

import type { RowData, Updater } from '@tanstack/angular-table';

import type { Table } from './table-features.type';
import type { NatTableUiState } from './table-state.type';

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
export type NatTableUiController<TData extends RowData = RowData> = {
  readonly table: Table<TData>;
  /**
   * Applies pending state to `table` now. A companion that writes state from an
   * effect calls it before reading `table.atoms`, since the renderer otherwise
   * applies changes only in its own change-detection pass.
   */
  flushTableOptions?(): void;
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
