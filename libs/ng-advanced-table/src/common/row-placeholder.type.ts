import type { Column, RowData, Table } from '@tanstack/angular-table';

/**
 * Context passed to `ng-template[natTableRowPlaceholder]`, rendered once per
 * visible column cell of a placeholder row — a logical row slot the table does
 * not hold under remote windowing (`remoteRowCount`).
 */
export type NatTableRowPlaceholderTemplateContext<TData extends RowData = RowData> = {
  /** Alias for `logicalIndex`, useful for `let-logicalIndex` style template bindings. */
  readonly $implicit: number;
  /** Zero-based absolute logical row index of the unfetched slot. */
  readonly logicalIndex: number;
  /** Visible leaf column the placeholder cell belongs to. */
  readonly column: Column<TData, unknown>;
  /** TanStack table instance for advanced reads. */
  readonly table: Table<TData>;
};
