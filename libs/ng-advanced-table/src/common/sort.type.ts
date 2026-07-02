import type { Column, RowData } from '@tanstack/angular-table';

/** Current sort direction for a header cell. */
type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export type NatTableSortIndicatorContext<TData extends RowData = RowData> = {
  /** Alias for `sortState`, useful for `let-state` style template bindings. */
  readonly $implicit: NatTableSortDirection;
  /** Current TanStack sort direction for the column. */
  readonly sortState: NatTableSortDirection;
  /** ARIA token applied to the header cell. */
  readonly ariaSort: 'ascending' | 'descending' | 'none';
  /** TanStack column instance for advanced custom indicators. */
  readonly column: Column<TData, unknown>;
  /** Resolved human-readable label for the column. */
  readonly label: string;
};
