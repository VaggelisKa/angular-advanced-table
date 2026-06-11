import type { CellContext, ColumnDef, RowData } from '@tanstack/angular-table';

/** Options for {@link withRowNumberColumn}. */
export interface WithRowNumberColumnOptions {
  /** Column id. Defaults to `__natRowNumber`. */
  columnId?: string;
  /** Header label. Defaults to `'#'`. */
  header?: string;
  /** Column width in pixels. Defaults to 56. */
  size?: number;
}

const ROW_NUMBER_COLUMN_ID = '__natRowNumber';

/**
 * Prepends a row-number column. The number is the 1-based position within the
 * current (filtered/paginated) row model — not a stable id.
 *
 * Follows the `(columns) => columns` shape so it composes with the other
 * helpers via `composeColumns(...)`.
 */
export function withRowNumberColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: WithRowNumberColumnOptions = {},
): ColumnDef<TData, unknown>[] {
  const header = options.header ?? '#';
  const column: ColumnDef<TData, unknown> = {
    id: options.columnId ?? ROW_NUMBER_COLUMN_ID,
    header,
    size: options.size ?? 56,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: { label: header === '#' ? 'Row number' : header, align: 'end' },
    cell: (info) => info.row.index + 1,
  };

  return [column, ...columns];
}

/** Options for {@link withActionsColumn}. */
export interface WithActionsColumnOptions {
  /** Column id. Defaults to `__natActions`. */
  columnId?: string;
  /** Header label. Defaults to `'Actions'`. */
  header?: string;
  /** Column width in pixels. Defaults to 96. */
  size?: number;
}

const ACTIONS_COLUMN_ID = '__natActions';

/**
 * Appends an actions column whose cell content is produced by `render`. Mirrors
 * the `withRenderMetricsColumn(columns, store, options)` arity (render second).
 *
 * The actions column does not sort, filter, hide, or pin by default.
 */
export function withActionsColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  render: (context: CellContext<TData, unknown>) => unknown,
  options: WithActionsColumnOptions = {},
): ColumnDef<TData, unknown>[] {
  const header = options.header ?? 'Actions';
  const column: ColumnDef<TData, unknown> = {
    id: options.columnId ?? ACTIONS_COLUMN_ID,
    header,
    size: options.size ?? 96,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    enablePinning: false,
    meta: { label: header, align: 'end' },
    cell: (context) => render(context),
  };

  return [...columns, column];
}
