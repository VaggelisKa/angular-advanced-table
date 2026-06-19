import type { Column, Row, RowData } from '@tanstack/angular-table';
import writeExcelFile from 'write-excel-file/universal';
import type { SheetData } from 'write-excel-file/universal';

import type {
  NatTableColumnExportOptions,
  NatTableColumnExportValueContext,
} from '../../shared/table-ui.types';
import type { NatTableExcelExportContext } from './table-export-excel.types';

const EXCEL_SHEET_NAME = 'Table';
const EXCEL_DATE_FORMAT = 'yyyy-mm-dd hh:mm:ss';

export async function exportNatTableExcel<TData extends RowData>(
  context: NatTableExcelExportContext<TData>,
): Promise<void> {
  const headerRow = context.columns.map(resolveNatTableExcelExportHeader);
  const bodyRows = context.rows.map((row) =>
    context.columns.map((column) => resolveNatTableExcelExportCellValue(row, column)),
  );
  const sheetData: SheetData = [headerRow, ...bodyRows];
  const blob = await writeExcelFile(sheetData, {
    dateFormat: EXCEL_DATE_FORMAT,
    sheet: EXCEL_SHEET_NAME,
  }).toBlob();

  downloadNatTableExcelBlob(blob, context.fileName);
}

export function resolveNatTableExcelExportColumns<TData extends RowData>(
  columns: readonly Column<TData, unknown>[],
): Column<TData, unknown>[] {
  return columns.filter((column) => isNatTableExcelExportColumn(column));
}

function isNatTableExcelExportColumn<TData extends RowData>(
  column: Column<TData, unknown>,
): boolean {
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

function resolveNatTableExcelExportHeader<TData extends RowData>(
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

function resolveNatTableExcelExportCellValue<TData extends RowData>(
  row: Row<TData>,
  column: Column<TData, unknown>,
): string | number | boolean | Date | null {
  const value = row.getValue<unknown>(column.id);
  const exportOptions = column.columnDef.meta?.export as
    | NatTableColumnExportOptions<TData, unknown>
    | undefined;
  const exportValue =
    exportOptions?.value?.({
      row,
      column,
      value,
    } satisfies NatTableColumnExportValueContext<TData, unknown>) ?? value;

  return normalizeExcelCellValue(exportValue);
}

function normalizeExportHeader(value: string | undefined): string | null {
  const normalized = value?.trim() ?? '';

  return normalized || null;
}

function normalizeExcelCellValue(value: unknown): string | number | boolean | Date | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
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

function downloadNatTableExcelBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = 'none';

  const anchorRoot = document.body ?? document.documentElement;
  anchorRoot.append(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl));
}
