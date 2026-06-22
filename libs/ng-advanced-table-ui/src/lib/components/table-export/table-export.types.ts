import type { Provider } from '@angular/core';
import type { Column, Row, RowData, Table } from '@tanstack/angular-table';

/** Normalized value exposed to table export handlers before format-specific serialization. */
export type NatTableExportCellValue = string | number | boolean | Date | null;

/** Column metadata in the resolved table export snapshot. */
export interface NatTableExportDataColumn {
  /** TanStack column id. */
  readonly id: string;
  /** Export header resolved from column metadata or column definition. */
  readonly header: string;
}

/** Row values in the resolved table export snapshot. */
export interface NatTableExportDataRow {
  /** TanStack row id. */
  readonly id: string;
  /** Values aligned with `NatTableExportData.columns`. */
  readonly values: readonly NatTableExportCellValue[];
}

/** Structured table data resolved for export handlers. */
export interface NatTableExportData {
  /** Exportable columns in their resolved order. */
  readonly columns: readonly NatTableExportDataColumn[];
  /** Exportable row values in their resolved order. */
  readonly rows: readonly NatTableExportDataRow[];
}

/** Context passed to table export handlers. */
export interface NatTableExportContext<TData extends RowData = RowData> {
  /** TanStack table instance resolved for the action. */
  readonly table: Table<TData>;
  /** Rows selected by the directive's current export scope. */
  readonly rows: readonly Row<TData>[];
  /** Columns selected by the directive's current export scope. */
  readonly columns: readonly Column<TData, unknown>[];
  /** Normalized base file name supplied to the action. */
  readonly fileName: string;
  /** Lazily resolves structured export data for the same activation. */
  getData(): NatTableExportData;
  /** Runs the built-in CSV export for the same resolved context. */
  exportCsv(): Promise<void>;
}

/** Operation that performs a table export. */
export type NatTableExportHandler<TData extends RowData = RowData> = (
  context: NatTableExportContext<TData>,
) => void | Promise<void>;

/** App-level table export configuration. */
export interface NatTableExportConfig<TData extends RowData = RowData> {
  /** Replaces the built-in CSV export handler for all matching directives. */
  readonly handler?: NatTableExportHandler<TData>;
}

/** Factory used when app-level table export configuration needs Angular DI. */
export type NatTableExportConfigFactory<TData extends RowData = RowData> =
  () => NatTableExportConfig<TData>;

export type NatTableExportProvider = Provider[];
