import type { Column, ColumnDef, RowData } from '@tanstack/angular-table';

const normalizeColumnLabel = (label: string | undefined): string | null => {
  const normalized = label?.trim() ?? '';

  return normalized || null;
};

export const resolveNatTableColumnLabel = <TData extends RowData>(
  columnDef: ColumnDef<TData, unknown>,
  fallbackId: string
): string => {
  const hiddenHeaderLabel = normalizeColumnLabel(columnDef.meta?.hiddenHeaderLabel);

  if (hiddenHeaderLabel) {
    return hiddenHeaderLabel;
  }

  const metaLabel = columnDef.meta?.label;

  if (metaLabel) {
    return metaLabel;
  }

  if (typeof columnDef.header === 'string') {
    return columnDef.header;
  }

  const accessorKey = (columnDef as { readonly accessorKey?: unknown }).accessorKey;

  if (typeof accessorKey === 'string') {
    return accessorKey;
  }

  return fallbackId || 'Column';
};

export const getNatTableColumnLabel = <TData extends RowData>(column: Column<TData, unknown>): string =>
  resolveNatTableColumnLabel(column.columnDef, column.id);
