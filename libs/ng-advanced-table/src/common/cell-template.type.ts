import type { Cell, Column, Row, RowData, Table } from '@tanstack/angular-table';

/**
 * Row handed to consumer templates. An alias owned by the library so template
 * code keeps one name across TanStack Table major versions.
 */
export type NatTableRow<TData extends RowData = RowData> = Row<TData>;

/** Column handed to consumer templates. See {@link NatTableRow} for why it is an alias. */
export type NatTableColumn<TData extends RowData = RowData, TValue = unknown> = Column<TData, TValue>;

/** Cell handed to consumer templates. See {@link NatTableRow} for why it is an alias. */
export type NatTableCellRef<TData extends RowData = RowData, TValue = unknown> = Cell<TData, TValue>;

/** Renderer drawing a consumer template, for templates shared by `<nat-table>` and `<nat-list>`. */
export type NatTableCellTemplateRenderer = 'table' | 'list';

/** Context passed to `ng-template[natTableCell]`. */
export type NatTableCellTemplateContext<TData extends RowData = RowData, TValue = unknown> = {
  /** Alias for `value`, useful for `let-value` style template bindings. */
  readonly $implicit: TValue;
  /** Accessor value of the cell. */
  readonly value: TValue;
  /** Row the cell belongs to; `row.original` is the consumer's row object. */
  readonly row: NatTableRow<TData>;
  /** Column the cell belongs to. */
  readonly column: NatTableColumn<TData, TValue>;
  /** The cell itself, for advanced reads. */
  readonly cell: NatTableCellRef<TData, TValue>;
  /** Zero-based logical row index: the position on the current page, or in the whole dataset under remote windowing. */
  readonly rowIndex: number;
  /** Which renderer is drawing the cell. */
  readonly renderer: NatTableCellTemplateRenderer;
  /** TanStack table instance for advanced reads. */
  readonly table: Table<TData>;
};
