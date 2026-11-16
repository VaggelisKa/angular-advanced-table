import type { RowData, Table } from '@tanstack/angular-table';

import type { NatTableRow } from './cell-template.type';

/** Context passed to `ng-template[natListItem]`. */
export type NatListItemTemplateContext<TData extends RowData = RowData> = {
  /** The consumer's row object; alias for `row.original`. */
  readonly $implicit: TData;
  /** Row rendered by the item, for selection and other row state. */
  readonly row: NatTableRow<TData>;
  /** Zero-based position of the item among the items of the current page. */
  readonly rowIndex: number;
  /** Whether the row is selected. */
  readonly selected: boolean;
  /** Ids of the visible columns in display order, for templates that honour column visibility or order. */
  readonly visibleColumnIds: readonly string[];
  /** TanStack table instance for advanced reads. */
  readonly table: Table<TData>;
};
