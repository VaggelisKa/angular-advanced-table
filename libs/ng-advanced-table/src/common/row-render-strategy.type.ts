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
 *
 * Only `NatTableRowRenderStrategy` and `NatTableVirtualItem` are public — a
 * strategy author implements those. `NatTableRenderedBodyRow` and
 * `NatTableBodyRenderPlan` are the internal shape core hands to its own body
 * template and are deliberately absent from the public barrel.
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
 *
 * ## Variable-height readiness (audit, #327 — documentation only)
 *
 * What core actually consumes, and what a future measured-height strategy
 * would have to satisfy:
 *
 * - **Structural — `items` + `totalSize`.** Core reads only `item.start` /
 *   `item.end` / `item.index` and `totalSize`. `buildNatTableBodyRenderPlan`
 *   turns them into `beforeSize` gaps and one trailing `afterSize`, and the
 *   table template renders those as native spacer rows. Nothing in that path
 *   assumes the extents are equal, contiguous, or a multiple of anything, so a
 *   per-row-height strategy expresses itself in this contract unchanged: it
 *   just emits items whose `end - start` differs per row.
 * - **Not structural — `rowHeight`.** Core uses the scalar in exactly two
 *   places, both guards: it rejects a non-positive height, and it rejects a
 *   `totalSize` smaller than `rows.length * rowHeight` (an undersized global
 *   extent would otherwise produce negative spacers). The rendered body never
 *   reads the scalar in TypeScript; the height itself is applied by core's
 *   `.data-table.is-virtualized` CSS from the `--sys-nat-table-virtual-row-height`
 *   custom property the strategy sets on its host. `rowHeight` is therefore an
 *   artifact of the current fixed-height strategy, not a requirement of the
 *   contract.
 * - **Consequence for a measured-height strategy.** Two assumptions would
 *   break. The `rows.length * rowHeight` floor, because with measured rows
 *   there is no single height that is simultaneously a valid lower bound and a
 *   useful sanity check; and core's fixed-height CSS rule above, which sizes
 *   every body row from one custom property and would have to be scoped off for
 *   a strategy that sizes rows individually. Such a strategy would need core's
 *   guard relaxed —
 *   e.g. `rowHeight` reinterpreted as a *minimum* row extent, or replaced by a
 *   `minRowExtent` field — plus its own scroll-offset correction when a
 *   measurement changes the extent of a row above the viewport. Core's plan
 *   builder, spacer rendering, ARIA row numbering (`subHeaderRowOffsets`,
 *   `gridRowCount`) and focus-retention seam all stay as they are.
 *
 * Measurement, estimation, and scroll anchoring are deliberately not
 * implemented here; this note only records which half of the contract a second
 * strategy could reuse as-is.
 */
export type NatTableRowRenderStrategy = {
  readonly items: Signal<readonly NatTableVirtualItem[]>;
  readonly totalSize: Signal<number>;
  readonly rowHeight: Signal<number>;
  /**
   * Remote windowing: the logical row count the grid represents when it spans
   * more rows than the table holds, or `null` while the supplied row model is
   * the full extent. When non-null, item indexes, `totalSize`, `aria-rowcount`,
   * and reported totals are in logical (remote) coordinates, and every logical
   * index outside the loaded window renders as a placeholder row.
   *
   * Must derive from strategy configuration only — never from the table's row
   * model — because core reads it while building the TanStack options. Core
   * treats a value below the loaded row count as the loaded row count.
   */
  readonly logicalRowCount?: Signal<number | null>;
  /**
   * Remote windowing: logical index of the first supplied row. Ignored while
   * `logicalRowCount` is absent or `null`. Core clamps it so the loaded window
   * always fits inside the logical extent.
   */
  readonly rowWindowOffset?: Signal<number>;
};

/**
 * One loaded TanStack row plus any native-flow space immediately before it.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
export type NatTableRenderedDataRow<TData extends RowData> = {
  readonly kind: 'row';
  readonly row: Row<TData>;
  readonly logicalIndex: number;
  readonly beforeSize: number;
};

/**
 * One mounted logical row slot with no loaded `Row` behind it — a remote
 * windowing gap the body renders as a fixed-height placeholder row.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
export type NatTableRenderedPlaceholderRow = {
  readonly kind: 'placeholder';
  readonly logicalIndex: number;
  readonly beforeSize: number;
};

/**
 * One rendered body slot: a loaded row, or a placeholder for a logical index
 * the table does not hold. Both carry the absolute logical index and the
 * native-flow space rendered immediately before them.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
export type NatTableRenderedBodyRow<TData extends RowData> = NatTableRenderedDataRow<TData> | NatTableRenderedPlaceholderRow;

/**
 * Engine-neutral body plan rendered by the single NatTable body template.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
export type NatTableBodyRenderPlan<TData extends RowData> = {
  readonly rows: readonly NatTableRenderedBodyRow<TData>[];
  readonly afterSize: number;
};
