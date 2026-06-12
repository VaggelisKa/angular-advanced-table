import type { CellContext, ColumnDef, Row, RowData, Table } from '@tanstack/angular-table';

/** Options for {@link withRowNumberColumn}. */
export interface WithRowNumberColumnOptions {
  /** Column id. Defaults to `__natRowNumber`. */
  columnId?: string;
  /** Visible header. Defaults to the structural `'#'` token. */
  header?: string;
  /**
   * Accessible column label used by companion controls and announcements.
   * Defaults to `header` when a custom header is provided. The library ships
   * no hardcoded copy, so pass the active locale's wording (for example
   * "Row number") when keeping the default `'#'` header.
   */
  label?: string;
  /** Column width in pixels. Defaults to 56. */
  size?: number;
}

const ROW_NUMBER_COLUMN_ID = '__natRowNumber';

/**
 * Memoized 1-based positions per row-model snapshot. TanStack recreates the
 * `rows` array whenever filtering or sorting changes, so keying on it keeps
 * lookups O(1) per cell without manual invalidation.
 */
const rowPositionsByModel = new WeakMap<readonly unknown[], Map<string, number>>();

function resolveRowPosition<TData extends RowData>(table: Table<TData>, row: Row<TData>): number {
  const rows = table.getPrePaginationRowModel().rows;
  let positions = rowPositionsByModel.get(rows);

  if (!positions) {
    positions = new Map(rows.map((modelRow, index) => [modelRow.id, index + 1]));
    rowPositionsByModel.set(rows, positions);
  }

  return positions.get(row.id) ?? row.index + 1;
}

/**
 * Prepends a row-number column. The number is the 1-based position within the
 * current (filtered and sorted) row model and stays continuous across pages —
 * not a stable id.
 *
 * Follows the `(columns) => columns` shape so it composes with the other
 * helpers via `composeColumns(...)`.
 */
export function withRowNumberColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: WithRowNumberColumnOptions = {},
): ColumnDef<TData, unknown>[] {
  const header = options.header ?? '#';
  const label = options.label ?? (header === '#' ? undefined : header);
  const column: ColumnDef<TData, unknown> = {
    id: options.columnId ?? ROW_NUMBER_COLUMN_ID,
    header,
    size: options.size ?? 56,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    enableResizing: false,
    meta: label === undefined ? { align: 'end' } : { label, align: 'end' },
    cell: (info) => resolveRowPosition(info.table, info.row),
  };

  return [column, ...columns];
}

/** Options for {@link withActionsColumn}. */
export interface WithActionsColumnOptions {
  /** Column id. Defaults to `__natActions`. */
  columnId?: string;
  /**
   * Visible header label, e.g. the active locale's wording for "Actions".
   * Required because the library ships no hardcoded copy.
   */
  header: string;
  /** Accessible column label override (`meta.label`). Defaults to `header`. */
  label?: string;
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
  options: WithActionsColumnOptions,
): ColumnDef<TData, unknown>[] {
  const column: ColumnDef<TData, unknown> = {
    id: options.columnId ?? ACTIONS_COLUMN_ID,
    header: options.header,
    size: options.size ?? 96,
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
    enablePinning: false,
    meta: { label: options.label ?? options.header, align: 'end' },
    cell: (context) => render(context),
  };

  return [...columns, column];
}
