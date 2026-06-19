import type { Provider } from '@angular/core';
import type { Column, Row, RowData, Table } from '@tanstack/angular-table';

/** Context passed to Excel export handlers. */
export interface NatTableExcelExportContext<TData extends RowData = RowData> {
  /** TanStack table instance resolved for the action. */
  readonly table: Table<TData>;
  /** Rows selected by the directive's current export scope. */
  readonly rows: readonly Row<TData>[];
  /** Columns selected by the directive's current export scope. */
  readonly columns: readonly Column<TData, unknown>[];
  /** Normalized `.xlsx` file name. */
  readonly fileName: string;
  /** Runs the client-side Excel export for the same resolved context. */
  export(): Promise<void>;
}

/** Operation that performs an Excel export. */
export type NatTableExcelExportHandler<TData extends RowData = RowData> = (
  context: NatTableExcelExportContext<TData>,
) => void | Promise<void>;

/** App-level Excel export configuration. */
export interface NatTableExcelExportConfig<TData extends RowData = RowData> {
  /** Replaces the client-side export handler for all matching directives. */
  readonly handler?: NatTableExcelExportHandler<TData>;
}

export type NatTableExcelExportProvider = Provider[];
