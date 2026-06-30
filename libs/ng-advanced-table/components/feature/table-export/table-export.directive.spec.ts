/* eslint-disable max-lines */
import { CUSTOM_ELEMENTS_SCHEMA, Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import { NatTable, NatTableService } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';

import { NatTableExport } from './table-export.directive';
import { provideNatTableExport } from '../../common/table-export.provider';
import type { NatTableExportContext, NatTableExportData } from '../../common/table-export.type';
import { NatToolbarItem } from '../../ui/toolbar-item/toolbar-item.directive';
import { createNatTableExportData } from '../../utils/table-export-client';
import { NatTableSurface } from '../table-surface/table-surface';
import { NatTableToolbar } from '../table-toolbar/table-toolbar';

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

type ExportRow = {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly details: { readonly risk: string };
};

const EXPORT_ROWS: readonly ExportRow[] = [
  { id: 'row-1', name: 'Alpha', price: 12, details: { risk: 'low' } },
  { id: 'row-2', name: 'Beta', price: 24, details: { risk: 'high' } }
];

const EXPORT_COLUMNS: ColumnDef<ExportRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name' }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: { label: 'Price' }
  },
  {
    accessorKey: 'details',
    header: 'Details',
    meta: {
      export: {
        header: 'Risk profile'
      }
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => 'Open',
    meta: { label: 'Actions' }
  }
];

const EXPORT_VALUE_COLUMNS: ColumnDef<ExportRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name' }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: {
      label: 'Price',
      export: {
        value: () => null
      }
    }
  },
  {
    accessorKey: 'details',
    header: 'Details',
    meta: {
      export: {
        value: () => undefined
      }
    }
  }
];

let anchorDownloads: string[];
let downloadedBlobs: Blob[];
let anchorClickSpy: MockInstance<() => void> | undefined;

const downloadMock = {
  createObjectURL: vi.fn((blob: Blob) => {
    downloadedBlobs.push(blob);

    return 'blob:nat-table-export';
  }),
  revokeObjectURL: vi.fn()
};

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  selector: 'nat-export-default-host',
  host: { 'data-export-spec-host': 'default' },
  template: `
    <nat-table-surface [state]="tableState">
      <nat-table-toolbar accessibleName="Export toolbar">
        <button data-testid="export-button" exportFileName="orders" natTableExport natToolbarItem type="button">Export</button>
      </nat-table-toolbar>

      <nat-table [columns]="columns" [data]="rows" accessibleName="Orders" />
    </nat-table-surface>
  `
})
class DefaultExportHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
  protected readonly tableState: Partial<NatTableState> = {
    columnOrder: ['details', 'name', 'price', 'actions'],
    columnVisibility: { price: false }
  };
}

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
class CustomHandlerHost {
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
class ExportValueMappingHost {
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
class DelegatingHandlerHost {
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
class ExplicitControllerHost {
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
class CustomEventHost {
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
class BusyExportHost {
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

class ExportApi {
  public readonly exportOrders = vi.fn<(context: NatTableExportContext<ExportRow>) => Promise<void>>(async () => Promise.resolve());
}

describe('FEATURE: NatTableExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    anchorDownloads = [];
    downloadedBlobs = [];
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      anchorDownloads.push(this.download);
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: downloadMock.createObjectURL
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: downloadMock.revokeObjectURL
    });
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  afterEach(() => {
    anchorClickSpy?.mockRestore();
    anchorClickSpy = undefined;
  });

  const exportButton = (): HTMLElement => {
    return document.querySelector('[data-testid="export-button"]') as HTMLElement;
  };

  const expectClientCsvDownload = (fileName: string): Blob => {
    expect(downloadMock.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(downloadedBlobs).toHaveLength(1);
    expect(anchorDownloads).toStrictEqual([fileName]);

    const blob = downloadedBlobs[0];

    expect(blob).toBeDefined();

    expect(blob.type).toBe(CSV_MIME_TYPE);
    expect(blob.size).toBeGreaterThan(0);

    return blob;
  };

  describe('GIVEN: an export directive host is configured', () => {
    describe('WHEN: exports all client rows with visible exportable columns to CSV by default', () => {
      it('THEN: it passes visible exportable client rows to the CSV handler', async () => {
        const fixture = TestBed.createComponent(DefaultExportHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        const blob = expectClientCsvDownload('orders.csv');

        await expect(blob.text()).resolves.toBe('Risk profile,Name\r\n"{""risk"":""low""}",Alpha\r\n"{""risk"":""high""}",Beta');
      });
    });
  });

  describe('GIVEN: an export directive host is configured with exportable visible columns', () => {
    describe('WHEN: builds export data from visible exportable columns and lets value callbacks clear cells', () => {
      it('THEN: it applies column visibility, export flags, and value callbacks', async () => {
        const fixture = TestBed.createComponent(ExportValueMappingHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        expect(fixture.componentInstance.exportData).toStrictEqual({
          columns: [
            { id: 'name', header: 'Name' },
            { id: 'price', header: 'Price' },
            { id: 'details', header: 'Details' }
          ],
          rows: [
            { id: 'row-1', values: ['Alpha', null, null] },
            { id: 'row-2', values: ['Beta', null, null] }
          ]
        });
        expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN: an export directive host is configured with a directive export handler', () => {
    describe('WHEN: lets a directive-level handler replace provider and client-side handlers', () => {
      it('THEN: it invokes only the directive export handler', async () => {
        const providerHandler = vi.fn(async () => Promise.resolve());

        TestBed.configureTestingModule({
          providers: [provideNatTableExport({ handler: providerHandler })]
        });
        const fixture = TestBed.createComponent(CustomHandlerHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        expect(fixture.componentInstance.exportHandler).toHaveBeenCalledTimes(1);
        expect(providerHandler).not.toHaveBeenCalled();
        expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN: an export directive host is configured with an app-level export handler', () => {
    describe('WHEN: uses an app-level provider handler when no directive handler is present', () => {
      it('THEN: it invokes the provider export handler', async () => {
        const providerHandler = vi.fn(async () => Promise.resolve());

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection(), provideNatTableExport({ handler: providerHandler })]
        });
        const fixture = TestBed.createComponent(DefaultExportHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        expect(providerHandler).toHaveBeenCalledTimes(1);
        expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN: an export directive host is configured with injectable export handler factories', () => {
    describe('WHEN: supports app-level provider factories that use Angular injection', () => {
      it('THEN: it resolves injected provider factories for export handling', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            provideZonelessChangeDetection(),
            ExportApi,
            provideNatTableExport<ExportRow>(() => {
              const api = inject(ExportApi);

              return {
                handler: async (context): Promise<void> => api.exportOrders(context)
              };
            })
          ]
        });
        const fixture = TestBed.createComponent(DefaultExportHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        expect(TestBed.inject(ExportApi).exportOrders).toHaveBeenCalledTimes(1);
        expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN: an export directive host is configured with delegated CSV export handlers', () => {
    describe('WHEN: lets custom handlers delegate back to the client-side CSV export', () => {
      it('THEN: it allows custom handlers to call the CSV client', async () => {
        const fixture = TestBed.createComponent(DelegatingHandlerHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        expect(fixture.componentInstance.exportHandler).toHaveBeenCalledTimes(1);
        expectClientCsvDownload('table-export.csv');
      });
    });
  });

  describe('GIVEN: an export directive host is configured with an explicit export controller target', () => {
    describe('WHEN: supports explicit controller targeting outside nat-table-surface', () => {
      it('THEN: it uses the explicitly targeted table controller', async () => {
        const fixture = TestBed.createComponent(ExplicitControllerHost);

        fixture.detectChanges();
        await fixture.whenStable();

        exportButton().click();
        await fixture.whenStable();

        expect(expectClientCsvDownload('table-export.csv')).toBeInstanceOf(Blob);
      });
    });
  });

  describe('GIVEN: an export directive host is configured with custom export activation events', () => {
    describe('WHEN: supports custom activation events through the exported directive instance', () => {
      it('THEN: it runs export from the directive API', async () => {
        const fixture = TestBed.createComponent(CustomEventHost);

        fixture.detectChanges();
        await fixture.whenStable();

        const event = new CustomEvent('pressed', { bubbles: true, cancelable: true });
        const dispatchResult = exportButton().dispatchEvent(event);

        await fixture.whenStable();

        expect(dispatchResult).toBe(false);
        expect(event.defaultPrevented).toBe(true);
        expectClientCsvDownload('custom-event.csv');
      });
    });
  });

  describe('GIVEN: an export directive host is configured with a busy native export button', () => {
    describe('WHEN: marks native buttons busy and ignores duplicate activations while exporting', () => {
      it('THEN: it sets busy state and suppresses concurrent exports', async () => {
        const fixture = TestBed.createComponent(BusyExportHost);

        fixture.detectChanges();
        await fixture.whenStable();

        const button = exportButton() as HTMLButtonElement;

        button.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.exportHandler).toHaveBeenCalledTimes(1);
        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-busy')).toBe('true');

        button.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.exportHandler).toHaveBeenCalledTimes(1);

        fixture.componentInstance.resolveExport?.();
        // Drain the async handler's promise-adoption microtasks past a macrotask
        // boundary, then settle + render so the directive's `finally` clears busy.
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
        await fixture.whenStable();
        fixture.detectChanges();

        expect(button.disabled).toBe(false);
        expect(button.hasAttribute('aria-busy')).toBe(false);
      });
    });
  });
});
