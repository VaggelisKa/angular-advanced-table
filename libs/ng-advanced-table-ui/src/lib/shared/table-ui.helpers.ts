import type { Column, ColumnDef, RowData } from '@tanstack/angular-table';

import type { NatTableUiNumberFormatter } from './table-ui-intl';

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const normalizeColumnLabel = (label: string | undefined): string | null => {
  const normalized = label?.trim() ?? '';

  return normalized || null;
};

export const sanitizePageSizeOptions = (options: readonly number[]): number[] => {
  const sanitized: number[] = [];
  const seen = new Set<number>();

  for (const value of options) {
    const pageSize = Math.trunc(value);

    if (!(pageSize > 0) || seen.has(pageSize)) {
      continue;
    }

    seen.add(pageSize);
    sanitized.push(pageSize);
  }

  return sanitized.length ? sanitized : [...DEFAULT_PAGE_SIZE_OPTIONS];
};

export const formatNatTableAccessibilityNumber = (
  value: number,
  formatter?: NatTableUiNumberFormatter,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string =>
  (
    formatter ??
    ((numberValue, numberOptions, numberLocale): string => new Intl.NumberFormat(numberLocale, numberOptions).format(numberValue))
  )(value, options, locale);

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

  const accessorKey = (columnDef as { accessorKey?: unknown }).accessorKey;

  if (typeof accessorKey === 'string') {
    return accessorKey;
  }

  return fallbackId || 'Column';
};

export const getNatTableColumnLabel = <TData extends RowData>(column: Column<TData, unknown>): string =>
  resolveNatTableColumnLabel(column.columnDef, column.id);
