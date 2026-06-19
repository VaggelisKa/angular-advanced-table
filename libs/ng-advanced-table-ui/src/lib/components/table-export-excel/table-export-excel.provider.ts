import { InjectionToken } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';

import type {
  NatTableExcelExportConfig,
  NatTableExcelExportProvider,
} from './table-export-excel.types';

export const NAT_TABLE_EXCEL_EXPORT = new InjectionToken<NatTableExcelExportConfig>(
  'NAT_TABLE_EXCEL_EXPORT',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);

export function provideNatTableExcelExport<TData extends RowData = RowData>(
  config: NatTableExcelExportConfig<TData>,
): NatTableExcelExportProvider {
  return [{ provide: NAT_TABLE_EXCEL_EXPORT, useValue: config }];
}
