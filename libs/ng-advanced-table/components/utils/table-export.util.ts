import type { Column, Row, RowData } from '@tanstack/angular-table';

import type {
  NatTableColumnExportOptions,
  NatTableColumnExportValueContext,
  NatTableExportCellValue,
  NatTableExportContext,
  NatTableExportData
} from '../common/table-export.type';

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';
const CSV_UTF8_BOM = '﻿';
const DEFAULT_CSV_EXTENSION = '.csv';
const DANGEROUS_SPREADSHEET_TEXT_PATTERN = /^[=+\-@\t\r\n]/;

const stringifyCsvCellValue = (value: Exclude<NatTableExportCellValue, null>): string => {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : '';
  }

  return String(value);
};

const serializeNatTableCsvCell = (value: NatTableExportCellValue): string => {
  if (value === null) {
    return '';
  }

  const text = stringifyCsvCellValue(value);
  const safeText = DANGEROUS_SPREADSHEET_TEXT_PATTERN.test(text) ? `'${text}` : text;

  return /[",\r\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText;
};

const serializeNatTableCsvRow = (row: readonly NatTableExportCellValue[]): string => row.map(serializeNatTableCsvCell).join(',');

const normalizeExportHeader = (value: string | undefined): string | null => {
  const normalized = value?.trim() ?? '';

  return normalized || null;
};

const normalizeExportCellValue = (value: unknown): NatTableExportCellValue => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : String(value);
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const isAccessorColumn = <TData extends RowData>(column: Column<TData, unknown>): boolean => {
  const columnWithAccessor = column as { readonly accessorFn?: unknown };
  const columnDefWithAccessor = column.columnDef as {
    readonly accessorFn?: unknown;
    readonly accessorKey?: unknown;
  };

  return (
    typeof columnWithAccessor.accessorFn === 'function' ||
    typeof columnDefWithAccessor.accessorFn === 'function' ||
    typeof columnDefWithAccessor.accessorKey === 'string'
  );
};

const isNatTableExportColumn = <TData extends RowData>(column: Column<TData, unknown>): boolean => {
  const exportOptions = column.columnDef.meta?.export;

  if (exportOptions?.enabled !== undefined) {
    return exportOptions.enabled;
  }

  return isAccessorColumn(column);
};

const normalizePrimitiveHeader = (header: unknown): string | null =>
  typeof header === 'string' || typeof header === 'number' ? normalizeExportHeader(String(header)) : null;

const resolveNatTableExportHeader = <TData extends RowData>(column: Column<TData, unknown>): string => {
  const meta = column.columnDef.meta;
  const resolvedHeader =
    normalizeExportHeader(meta?.export?.header) ??
    normalizeExportHeader(meta?.label) ??
    normalizeExportHeader(meta?.hiddenHeaderLabel) ??
    normalizePrimitiveHeader(column.columnDef.header);

  if (resolvedHeader) {
    return resolvedHeader;
  }

  return column.id || 'Column';
};

const resolveNatTableExportCellValue = <TData extends RowData>(
  row: Row<TData>,
  column: Column<TData, unknown>
): NatTableExportCellValue => {
  const value = row.getValue<unknown>(column.id);
  const exportOptions = column.columnDef.meta?.export as NatTableColumnExportOptions<TData, unknown> | undefined;
  const exportValue =
    typeof exportOptions?.value === 'function'
      ? exportOptions.value({
          row,
          column,
          value
        } satisfies NatTableColumnExportValueContext<TData, unknown>)
      : value;

  return normalizeExportCellValue(exportValue);
};

// ponytail: browser download lives here; promote to a data-access layer only if more I/O appears
const downloadNatTableExportBlob = (blob: Blob, fileName: string): void => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = 'none';

  // `document.body` is typed non-null but is absent before <body> is parsed or in
  // non-standard document hosts; query it so the nullable fallback stays type-honest.
  const anchorRoot = document.querySelector('body') ?? document.documentElement;

  anchorRoot.append(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl));
  }
};

export const createNatTableExportData = <TData extends RowData>(
  context: Pick<NatTableExportContext<TData>, 'rows' | 'columns'>
): NatTableExportData => ({
  columns: context.columns.map((column) => ({
    id: column.id,
    header: resolveNatTableExportHeader(column)
  })),
  rows: context.rows.map((row) => ({
    id: row.id,
    values: context.columns.map((column) => resolveNatTableExportCellValue(row, column))
  }))
});

export const createNatTableCsvBlob = (data: NatTableExportData): Blob => {
  const headerRow = data.columns.map((column) => column.header);
  const bodyRows = data.rows.map((row) => row.values);
  const csv = [headerRow, ...bodyRows].map(serializeNatTableCsvRow).join('\r\n');

  return new Blob([CSV_UTF8_BOM, csv], { type: CSV_MIME_TYPE });
};

export const resolveNatTableExportColumns = <TData extends RowData>(
  columns: readonly Column<TData, unknown>[]
): Column<TData, unknown>[] => columns.filter((column) => isNatTableExportColumn(column));

export const normalizeNatTableCsvFileName = (fileName: string): string => {
  const normalized = fileName.trim();

  return normalized.toLowerCase().endsWith(DEFAULT_CSV_EXTENSION) ? normalized : `${normalized}${DEFAULT_CSV_EXTENSION}`;
};

export const exportNatTableCsv = <TData extends RowData>(context: NatTableExportContext<TData>): void => {
  const blob = createNatTableCsvBlob(context.getData());

  downloadNatTableExportBlob(blob, normalizeNatTableCsvFileName(context.fileName));
};
