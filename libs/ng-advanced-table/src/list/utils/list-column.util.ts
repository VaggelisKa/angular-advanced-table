import type { Cell, Column, Row, RowData } from '@tanstack/angular-table';

/**
 * Finds a row's cell for a column id, or `null` when the column has no cell.
 *
 * Reads TanStack's memoized per-row record instead of scanning `getAllCells()`:
 * the template calls this per field on every change-detection pass, so an
 * O(columns) scan here would cost rows x columns^2 comparisons per pass.
 */
export const findRowCell = <TData extends RowData>(row: Row<TData>, columnId: string): Cell<TData, unknown> | null =>
  // eslint-disable-next-line no-underscore-dangle -- TanStack's memoized internal accessor; implementation files may import TanStack internals directly.
  row._getAllCellsByColumnId()[columnId] ?? null;

/**
 * Whether the column resolves a plain-text field label (`meta.hiddenHeaderLabel`,
 * `meta.label`, or a string `header`). Columns without one render their header
 * def (component, template, or returned text) through `flexRender` instead.
 */
export const hasStaticLabel = <TData extends RowData>(column: Column<TData, unknown>): boolean => {
  const { header, meta } = column.columnDef;

  return typeof header === 'string' || !!meta?.label || !!meta?.hiddenHeaderLabel;
};

/**
 * Whether the column's resolved label comes from `meta.hiddenHeaderLabel`,
 * which renders as screen-reader-only text — same contract as the table's
 * hidden header labels. Setting it (without `meta.label`) removes the visible
 * field label from the list while keeping the accessible name.
 */
export const isSrOnlyLabel = <TData extends RowData>(column: Column<TData, unknown>): boolean =>
  !!column.columnDef.meta?.hiddenHeaderLabel;
