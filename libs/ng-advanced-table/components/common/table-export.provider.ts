import { InjectionToken } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTableExportConfig, NatTableExportConfigFactory, NatTableExportProvider } from './table-export.type';

export const NAT_TABLE_EXPORT = new InjectionToken<NatTableExportConfig>('NAT_TABLE_EXPORT', {
  providedIn: 'root',
  factory: (): NatTableExportConfig => ({})
});

export const provideNatTableExport = <TData extends RowData = RowData>(
  config: NatTableExportConfig<TData> | NatTableExportConfigFactory<TData>
): NatTableExportProvider => {
  if (typeof config === 'function') {
    return [{ provide: NAT_TABLE_EXPORT, useFactory: config }];
  }

  return [{ provide: NAT_TABLE_EXPORT, useValue: config }];
};
