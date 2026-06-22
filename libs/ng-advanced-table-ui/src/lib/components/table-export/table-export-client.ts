import type { Column, Row, RowData } from '@tanstack/angular-table';

import type {
  NatTableColumnExportOptions,
  NatTableColumnExportValueContext,
} from '../../shared/table-ui.types';
import {
  type NatTableExportCellValue,
  type NatTableExportContext,
  type NatTableExportData,
} from './table-export.types';

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';
const CSV_UTF8_BOM = '\uFEFF';
const DEFAULT_CSV_EXTENSION = '.csv';
const DANGEROUS_SPREADSHEET_TEXT_PATTERN = /^[=+\-@\t\r\n]/;

export async function exportNatTableCsv<TData extends RowData>(
  context: NatTableExportContext<TData>,
): Promise<void> {
  const blob = createNatTableCsvBlob(context.getData());

  downloadNatTableExportBlob(blob, normalizeNatTableCsvFileName(context.fileName));
}

export function createNatTableExportData<TData extends RowData>(
  context: Pick<NatTableExportContext<TData>, 'rows' | 'columns'>,
): NatTableExportData {
  return {
    columns: context.columns.map((column) => ({
      id: column.id,
      header: resolveNatTableExportHeader(column),
    })),
    rows: context.rows.map((row) => ({
      id: row.id,
      values: context.columns.map((column) => resolveNatTableExportCellValue(row, column)),
    })),
  };
}

export function createNatTableCsvBlob(data: NatTableExportData): Blob {
  const headerRow = data.columns.map((column) => column.header);
  const bodyRows = data.rows.map((row) => row.values);
  const csv = [headerRow, ...bodyRows].map(serializeNatTableCsvRow).join('\r\n');

  return new Blob([CSV_UTF8_BOM, csv], { type: CSV_MIME_TYPE });
}

export function resolveNatTableExportColumns<TData extends RowData>(
  columns: readonly Column<TData, unknown>[],
): Column<TData, unknown>[] {
  return columns.filter((column) => isNatTableExportColumn(column));
}

export function normalizeNatTableCsvFileName(fileName: string): string {
  const normalized = fileName.trim();

  return normalized.toLowerCase().endsWith(DEFAULT_CSV_EXTENSION)
    ? normalized
    : `${normalized}${DEFAULT_CSV_EXTENSION}`;
}

function isNatTableExportColumn<TData extends RowData>(column: Column<TData, unknown>): boolean {
  const exportOptions = column.columnDef.meta?.export;

  if (exportOptions?.enabled !== undefined) {
    return exportOptions.enabled;
  }

  return isAccessorColumn(column);
}

function isAccessorColumn<TData extends RowData>(column: Column<TData, unknown>): boolean {
  const columnWithAccessor = column as { accessorFn?: unknown };
  const columnDefWithAccessor = column.columnDef as {
    accessorFn?: unknown;
    accessorKey?: unknown;
  };

  return (
    typeof columnWithAccessor.accessorFn === 'function' ||
    typeof columnDefWithAccessor.accessorFn === 'function' ||
    typeof columnDefWithAccessor.accessorKey === 'string'
  );
}

function resolveNatTableExportHeader<TData extends RowData>(
  column: Column<TData, unknown>,
): string {
  const exportHeader = normalizeExportHeader(column.columnDef.meta?.export?.header);

  if (exportHeader) return exportHeader;

  const metaLabel = normalizeExportHeader(column.columnDef.meta?.label);

  if (metaLabel) return metaLabel;

  const hiddenHeaderLabel = normalizeExportHeader(column.columnDef.meta?.hiddenHeaderLabel);

  if (hiddenHeaderLabel) return hiddenHeaderLabel;

  const header = column.columnDef.header;

  if (typeof header === 'string' || typeof header === 'number') {
    const primitiveHeader = normalizeExportHeader(String(header));

    if (primitiveHeader) return primitiveHeader;
  }

  return column.id || 'Column';
}

function resolveNatTableExportCellValue<TData extends RowData>(
  row: Row<TData>,
  column: Column<TData, unknown>,
): NatTableExportCellValue {
  const value = row.getValue<unknown>(column.id);
  const exportOptions = column.columnDef.meta?.export as
    | NatTableColumnExportOptions<TData, unknown>
    | undefined;
  const exportValue =
    typeof exportOptions?.value === 'function'
      ? exportOptions.value({
          row,
          column,
          value,
        } satisfies NatTableColumnExportValueContext<TData, unknown>)
      : value;

  return normalizeExportCellValue(exportValue);
}

function normalizeExportHeader(value: string | undefined): string | null {
  const normalized = value?.trim() ?? '';

  return normalized || null;
}

function normalizeExportCellValue(value: unknown): NatTableExportCellValue {
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
}

function serializeNatTableCsvRow(row: readonly NatTableExportCellValue[]): string {
  return row.map(serializeNatTableCsvCell).join(',');
}

function serializeNatTableCsvCell(value: NatTableExportCellValue): string {
  if (value === null) {
    return '';
  }

  const text = stringifyCsvCellValue(value);
  const safeText = DANGEROUS_SPREADSHEET_TEXT_PATTERN.test(text) ? `'${text}` : text;

  return /[",\r\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText;
}

function stringifyCsvCellValue(value: Exclude<NatTableExportCellValue, null>): string {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : '';
  }

  return String(value);
}

function downloadNatTableExportBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = 'none';

  const anchorRoot = document.body ?? document.documentElement;
  anchorRoot.append(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl));
  }
}
