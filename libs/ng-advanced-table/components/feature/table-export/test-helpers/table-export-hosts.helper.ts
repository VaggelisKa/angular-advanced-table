import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { vi } from 'vitest';

import { NatTable, NatTableService } from 'ng-advanced-table';

import { NatTableExport } from '../table-export.directive';
import { EXPORT_COLUMNS, EXPORT_ROWS, EXPORT_VALUE_COLUMNS } from './table-export-setup.helper';
import type { ExportRow } from './table-export-setup.helper';
import type { NatTableExportContext, NatTableExportData } from '../../../common/table-export.type';
import { NatToolbarItem } from '../../../ui/toolbar-item/toolbar-item.directive';
import { createNatTableExportData } from '../../../utils/table-export.util';
import { NatTableSurface } from '../../table-surface/table-surface';
import { NatTableToolbar } from '../../table-toolbar/table-toolbar';

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  selector: 'nat-export-custom-handler-host',
  host: { 'data-export-spec-host': 'custom-handler' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button [exportHandler]="exportHandler" data-testid="export-button" natTableExport natToolbarItem type="button">Export</button>
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
    </nat-table-surface>
  `
})
export class CustomHandlerHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
  public readonly exportHandler = vi.fn(async (): Promise<void> => Promise.resolve());
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  selector: 'nat-export-value-mapping-host',
  host: { 'data-export-spec-host': 'value-mapping' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button [exportHandler]="exportHandler" data-testid="export-button" natTableExport natToolbarItem type="button">Export</button>
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
    </nat-table-surface>
  `
})
export class ExportValueMappingHost {
  public exportData: NatTableExportData | undefined;
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_VALUE_COLUMNS;
  public readonly exportHandler = vi.fn(async (context: NatTableExportContext<ExportRow>) => {
    this.exportData = createNatTableExportData(context);

    return Promise.resolve();
  });
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  selector: 'nat-export-delegating-host',
  host: { 'data-export-spec-host': 'delegating' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button [exportHandler]="exportHandler" data-testid="export-button" natTableExport natToolbarItem type="button">Export</button>
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
    </nat-table-surface>
  `
})
export class DelegatingHandlerHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
  public readonly exportHandler = vi.fn(async (context: NatTableExportContext<ExportRow>) => context.exportCsv());
}

@Component({
  imports: [NatTable, NatTableExport],
  providers: [NatTableService],
  selector: 'nat-export-explicit-controller-host',
  host: { 'data-export-spec-host': 'explicit-controller' },
  template: `
    <nat-table #grid="natTable" [columns]="columns" [data]="rows" accessibleName="Orders" />
    <button [for]="grid" data-testid="export-button" natTableExport type="button">Export</button>
  `
})
export class ExplicitControllerHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'nat-export-custom-event-host',
  host: { 'data-export-spec-host': 'custom-event' },
  template: `
    <nat-table-surface>
      <my-custom-button
        #tableExport="natTableExport"
        data-testid="export-button"
        exportFileName="custom-event"
        natTableExport
        (pressed)="tableExport.trigger($event)">
        Export
      </my-custom-button>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
    </nat-table-surface>
  `
})
export class CustomEventHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  selector: 'nat-export-busy-host',
  host: { 'data-export-spec-host': 'busy' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button [exportHandler]="exportHandler" data-testid="export-button" natTableExport natToolbarItem type="button">Export</button>
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
    </nat-table-surface>
  `
})
export class BusyExportHost {
  public resolveExport: (() => void) | undefined;
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
  public readonly exportHandler = vi.fn(
    async () =>
      new Promise<void>((resolve) => {
        this.resolveExport = resolve;
      })
  );
}
