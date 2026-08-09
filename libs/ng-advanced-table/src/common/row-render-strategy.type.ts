import type { Signal } from '@angular/core';

import type { Row, RowData } from '@tanstack/angular-table';

/**
 * Engine-neutral body-row rendering contract.
 *
 * Core owns these types so `NatTableState` can consume a partial row window
 * without depending on any virtualization engine. The opt-in
 * `ng-advanced-table/virtualization` entry point implements the contract on top
 * of TanStack Virtual; core never imports it, which is what keeps that engine
 * out of the bundle for tables that do not virtualize.
 */

/** One mounted row's index and its vertical extent, in CSS pixels. */
export type NatTableVirtualItem = {
  readonly index: number;
  readonly start: number;
  readonly end: number;
};

/** Strategy registered by an opt-in body-row renderer. */
export type NatTableRowRenderStrategy = {
  readonly items: Signal<readonly NatTableVirtualItem[]>;
  readonly totalSize: Signal<number>;
  readonly rowHeight: Signal<number>;
};

/** One logical TanStack row plus any native-flow space immediately before it. */
export type NatTableRenderedBodyRow<TData extends RowData> = {
  readonly row: Row<TData>;
  readonly logicalIndex: number;
  readonly beforeSize: number;
};

/** Engine-neutral body plan rendered by the single NatTable body template. */
export type NatTableBodyRenderPlan<TData extends RowData> = {
  readonly rows: readonly NatTableRenderedBodyRow<TData>[];
  readonly afterSize: number;
  readonly renderKey: string;
  readonly rowHeight: number | null;
  readonly virtualized: boolean;
};
