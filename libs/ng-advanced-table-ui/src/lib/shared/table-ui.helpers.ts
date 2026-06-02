import type { Column, ColumnDef, RowData } from '@tanstack/angular-table';
import type { NatTableUiNumberFormatter } from './table-ui-intl';

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export function sanitizePageSizeOptions(options: readonly number[]): number[] {
  const sanitized = options.map((value) => Math.trunc(value)).filter((value) => value > 0);

  return sanitized.length ? sanitized : [...DEFAULT_PAGE_SIZE_OPTIONS];
}

export function formatNatTableAccessibilityNumber(
  value: number,
  formatter?: NatTableUiNumberFormatter,
  options?: Intl.NumberFormatOptions,
): string {
  return (
    formatter ??
    ((numberValue, numberOptions) =>
      new Intl.NumberFormat(undefined, numberOptions).format(numberValue))
  )(value, options);
}

export function getNatTableColumnLabel<TData extends RowData>(
  column: Column<TData, unknown>,
): string {
  return resolveNatTableColumnLabel(column.columnDef, column.id);
}

export function resolveNatTableColumnLabel<TData extends RowData>(
  columnDef: ColumnDef<TData, unknown>,
  fallbackId: string,
): string {
  const metaLabel = columnDef.meta?.label;

  if (metaLabel) {
    return metaLabel;
  }

  if (typeof columnDef.header === 'string') {
    return columnDef.header;
  }

  const accessorKey = (columnDef as { accessorKey?: unknown }).accessorKey;

  if (typeof accessorKey === 'string') {
    return accessorKey;
  }

  return fallbackId || 'Column';
}
