import type { Row, RowData, Table } from '@tanstack/angular-table';

/**
 * One rendered sub-header group segment: the group value, the group's total
 * row count across the sorted and filtered dataset (pre-pagination), and the
 * first row of the segment on the current page.
 */
export type NatTableSubHeaderGroup<TData extends RowData = RowData> = {
  /** Value of the sub-header column shared by every row in the group. */
  readonly value: unknown;
  /** Rows in the group across the filtered dataset, ignoring pagination. */
  readonly rowCountValue: number;
  /** First row of the group segment on the current page. */
  readonly row: Row<TData>;
};

/** Context passed to `ng-template[natTableSubHeader]`. */
export type NatTableSubHeaderTemplateContext<TData extends RowData = RowData> = {
  /** Alias for `value`, useful for `let-value` style template bindings. */
  readonly $implicit: unknown;
  /** Value of the sub-header column shared by every row in the group. */
  readonly value: unknown;
  /** Rows in the group across the filtered dataset, ignoring pagination. */
  readonly rowCountValue: number;
  /** First row of the group segment on the current page. */
  readonly row: Row<TData>;
  /** TanStack table instance for advanced reads. */
  readonly table: Table<TData>;
};
