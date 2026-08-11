import type { Signal } from '@angular/core';

import type { Row, RowData } from '@tanstack/angular-table';

/**
 * Engine-neutral body-row rendering contract.
 *
 * Core owns these types so `NatTableState` can consume a partial row window
 * without depending on any virtualization engine. The opt-in
 * `ng-advanced-table/virtualization` entry point implements the contract with
 * its own windowing engine; core never imports it, which is what keeps that
 * engine out of the bundle for tables that do not virtualize.
 */

/**
 * One mounted row's logical index and body-local vertical extent, in CSS pixels.
 *
 * The index must be a unique in-range integer and the extent must be finite,
 * non-negative, and increasing. Core discards invalid and duplicate items so
 * malformed custom ranges cannot render duplicate rows or corrupt spacers.
 */
export type NatTableVirtualItem = {
  readonly index: number;
  readonly start: number;
  readonly end: number;
};

/**
 * Low-level geometry strategy registered by an opt-in body-row renderer.
 *
 * This contract does not infer engine-specific range retention, cross-window
 * keyboard movement, focus recovery, measurement, lifecycle cleanup, or
 * diagnostics. Custom adapters own those behaviors. `totalSize` must cover at
 * least one `rowHeight` slot per logical row; invalid or undersized global
 * metrics make core fall back to the full-row renderer.
 */
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
