import type { Signal } from '@angular/core';

import type { Row, RowData } from '@tanstack/angular-table';

/**
 * Contract between `NatTable` and an attached row-virtualization directive.
 *
 * A directive placed on the same `<nat-table>` element provides this contract
 * under `NAT_TABLE_ROW_WINDOW`. While present, the table mounts only the body
 * rows named by `renderedRowIndexes` and fills the gaps between them with
 * fixed-height spacer rows, so scroll geometry stays identical to a fully
 * rendered table. The indexes are positions in the table's current body row
 * model (post sorting/filtering/pagination), sorted ascending.
 *
 * The window owner never renders rows itself; it only decides which row
 * indexes stay mounted. That keeps native `<table>` semantics — sticky
 * headers, pinned columns, `<colgroup>` widths, and the ARIA grid — fully
 * owned by the table shell.
 */
export type NatTableRowWindow = {
  /** Sorted, unique body-row indexes to keep in the DOM. Out-of-range indexes are ignored. */
  readonly renderedRowIndexes: Signal<readonly number[]>;
  /** Fixed rendered height of one body row in px; drives spacer-row heights. */
  readonly rowHeight: Signal<number>;
};

/** A mounted body row inside the table's body render plan. */
export type NatTableBodyRowItem<TData extends RowData = RowData> = {
  readonly kind: 'row';
  /** Track key, namespaced so it can never collide with a gap key. */
  readonly key: string;
  readonly row: Row<TData>;
  /** Absolute index of the row in the current body row model. */
  readonly bodyIndex: number;
};

/** A spacer standing in for a run of unmounted rows. */
export type NatTableBodyGapItem = {
  readonly kind: 'gap';
  /** Track key derived from the first body-row index the gap replaces. */
  readonly key: string;
  /** Number of unmounted rows the spacer stands in for. */
  readonly rowCount: number;
  /** Spacer height: `rowCount * rowHeight`. */
  readonly heightPx: number;
};

/** One entry of the table body's render plan: a mounted row or a gap spacer. */
export type NatTableBodyRenderItem<TData extends RowData = RowData> = NatTableBodyRowItem<TData> | NatTableBodyGapItem;
