import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ColumnDef } from '@tanstack/angular-table';
import { vi } from 'vitest';

import { NatTable, NatTableService, type NatTableState } from 'ng-advanced-table';

import { NatTableSurface } from '../table-surface/table-surface';
import { NatTableToolbar } from '../table-toolbar/table-toolbar';
import { NatToolbarItem } from '../table-toolbar/toolbar-item/toolbar-item.directive';
import { createNatTableExportData } from './table-export-client';
import { NatTableExport } from './table-export.directive';
import { provideNatTableExport } from './table-export.provider';
import type { NatTableExportContext, NatTableExportData } from './table-export.types';

const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

interface ExportRow {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly details: { readonly risk: string };
}

const EXPORT_ROWS: readonly ExportRow[] = [
  { id: 'row-1', name: 'Alpha', price: 12, details: { risk: 'low' } },
  { id: 'row-2', name: 'Beta', price: 24, details: { risk: 'high' } },
];

const EXPORT_COLUMNS: ColumnDef<ExportRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name' },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: { label: 'Price' },
  },
  {
    accessorKey: 'details',
    header: 'Details',
    meta: {
      export: {
        header: 'Risk profile',
      },
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => 'Open',
    meta: { label: 'Actions' },
  },
];

const EXPORT_VALUE_COLUMNS: ColumnDef<ExportRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name' },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: {
      label: 'Price',
      export: {
        value: () => null,
      },
    },
  },
  {
    accessorKey: 'details',
    header: 'Details',
    meta: {
      export: {
        value: () => undefined,
      },
    },
  },
];

let anchorDownloads: string[];
let downloadedBlobs: Blob[];
let anchorClickSpy: ReturnType<typeof vi.spyOn> | undefined;

const downloadMock = {
  createObjectURL: vi.fn((blob: Blob) => {
    downloadedBlobs.push(blob);
    return 'blob:nat-table-export';
  }),
  revokeObjectURL: vi.fn(),
};

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  host: { 'data-export-spec-host': 'default' },
  template: `
    <nat-table-surface [state]="tableState">
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExport
          exportFileName="orders"
          data-testid="export-button"
        >
          Export
        </button>
      </nat-table-toolbar>

      <nat-table [data]="rows" [columns]="columns" accessibleName="Orders" />
    </nat-table-surface>
  `,
})
class DefaultExportHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
  readonly tableState: Partial<NatTableState> = {
    columnOrder: ['details', 'name', 'price', 'actions'],
    columnVisibility: { price: false },
  };
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  host: { 'data-export-spec-host': 'custom-handler' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExport
          [exportHandler]="exportHandler"
          data-testid="export-button"
        >
          Export
        </button>
      </nat-table-toolbar>

      <nat-table [data]="rows" [columns]="columns" accessibleName="Orders" />
    </nat-table-surface>
  `,
})
class CustomHandlerHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
  readonly exportHandler = vi.fn((_context: NatTableExportContext<ExportRow>) => Promise.resolve());
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  host: { 'data-export-spec-host': 'value-mapping' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExport
          [exportHandler]="exportHandler"
          data-testid="export-button"
        >
          Export
        </button>
      </nat-table-toolbar>

      <nat-table [data]="rows" [columns]="columns" accessibleName="Orders" />
    </nat-table-surface>
  `,
})
class ExportValueMappingHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_VALUE_COLUMNS;
  exportData: NatTableExportData | undefined;
  readonly exportHandler = vi.fn((context: NatTableExportContext<ExportRow>) => {
    this.exportData = createNatTableExportData(context);

    return Promise.resolve();
  });
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  host: { 'data-export-spec-host': 'delegating' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExport
          [exportHandler]="exportHandler"
          data-testid="export-button"
        >
          Export
        </button>
      </nat-table-toolbar>

      <nat-table [data]="rows" [columns]="columns" accessibleName="Orders" />
    </nat-table-surface>
  `,
})
class DelegatingHandlerHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
  readonly exportHandler = vi.fn((context: NatTableExportContext<ExportRow>) =>
    context.exportCsv(),
  );
}

@Component({
  imports: [NatTable, NatTableExport],
  providers: [NatTableService],
  host: { 'data-export-spec-host': 'explicit-controller' },
  template: `
    <nat-table #grid="natTable" [data]="rows" [columns]="columns" accessibleName="Orders" />
    <button type="button" natTableExport [for]="grid" data-testid="export-button">Export</button>
  `,
})
class ExplicitControllerHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { 'data-export-spec-host': 'custom-event' },
  template: `
    <nat-table-surface>
      <my-custom-button
        natTableExport
        #tableExport="natTableExport"
        exportFileName="custom-event"
        data-testid="export-button"
        (pressed)="tableExport.trigger($event)"
      >
        Export
      </my-custom-button>

      <nat-table [data]="rows" [columns]="columns" accessibleName="Orders" />
    </nat-table-surface>
  `,
})
class CustomEventHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
}

@Component({
  imports: [NatTable, NatTableExport, NatTableSurface, NatTableToolbar, NatToolbarItem],
  host: { 'data-export-spec-host': 'busy' },
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExport
          [exportHandler]="exportHandler"
          data-testid="export-button"
        >
          Export
        </button>
      </nat-table-toolbar>

      <nat-table [data]="rows" [columns]="columns" accessibleName="Orders" />
    </nat-table-surface>
  `,
})
class BusyExportHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
  resolveExport: (() => void) | undefined;
  readonly exportHandler = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        this.resolveExport = resolve;
      }),
  );
}

class ExportApi {
  readonly exportOrders = vi.fn((_context: NatTableExportContext<ExportRow>) => Promise.resolve());
}

describe('NatTableExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    anchorDownloads = [];
    downloadedBlobs = [];
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      anchorDownloads.push(this.download);
    });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: downloadMock.createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: downloadMock.revokeObjectURL,
    });
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  afterEach(() => {
    anchorClickSpy?.mockRestore();
    anchorClickSpy = undefined;
  });

  function exportButton(): HTMLElement {
    return document.querySelector('[data-testid="export-button"]') as HTMLElement;
  }

  function expectClientCsvDownload(fileName: string): Blob {
    expect(downloadMock.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(downloadedBlobs).toHaveLength(1);
    expect(anchorDownloads).toEqual([fileName]);

    const blob = downloadedBlobs[0];

    if (!blob) {
      throw new Error('Expected table export to create a Blob.');
    }

    expect(blob.type).toBe(CSV_MIME_TYPE);
    expect(blob.size).toBeGreaterThan(0);

    return blob;
  }

  it('exports all client rows with visible exportable columns to CSV by default', async () => {
    const fixture = TestBed.createComponent(DefaultExportHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    const blob = expectClientCsvDownload('orders.csv');

    await expect(blob.text()).resolves.toBe(
      'Risk profile,Name\r\n"{""risk"":""low""}",Alpha\r\n"{""risk"":""high""}",Beta',
    );
  });

  it('builds export data from visible exportable columns and lets value callbacks clear cells', async () => {
    const fixture = TestBed.createComponent(ExportValueMappingHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.exportData).toEqual({
      columns: [
        { id: 'name', header: 'Name' },
        { id: 'price', header: 'Price' },
        { id: 'details', header: 'Details' },
      ],
      rows: [
        { id: '0', values: ['Alpha', null, null] },
        { id: '1', values: ['Beta', null, null] },
      ],
    });
    expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
  });

  it('lets a directive-level handler replace provider and client-side handlers', async () => {
    const providerHandler = vi.fn(() => Promise.resolve());

    TestBed.configureTestingModule({
      providers: [provideNatTableExport({ handler: providerHandler })],
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

  it('uses an app-level provider handler when no directive handler is present', async () => {
    const providerHandler = vi.fn(() => Promise.resolve());

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableExport({ handler: providerHandler }),
      ],
    });
    const fixture = TestBed.createComponent(DefaultExportHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(providerHandler).toHaveBeenCalledTimes(1);
    expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
  });

  it('supports app-level provider factories that use Angular injection', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ExportApi,
        provideNatTableExport<ExportRow>(() => {
          const api = inject(ExportApi);

          return {
            handler: (context) => api.exportOrders(context),
          };
        }),
      ],
    });
    const fixture = TestBed.createComponent(DefaultExportHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(TestBed.inject(ExportApi).exportOrders).toHaveBeenCalledTimes(1);
    expect(downloadMock.createObjectURL).not.toHaveBeenCalled();
  });

  it('lets custom handlers delegate back to the client-side CSV export', async () => {
    const fixture = TestBed.createComponent(DelegatingHandlerHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.exportHandler).toHaveBeenCalledTimes(1);
    expectClientCsvDownload('table-export.csv');
  });

  it('supports explicit controller targeting outside nat-table-surface', async () => {
    const fixture = TestBed.createComponent(ExplicitControllerHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expectClientCsvDownload('table-export.csv');
  });

  it('supports custom activation events through the exported directive instance', async () => {
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

  it('marks native buttons busy and ignores duplicate activations while exporting', async () => {
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
    await fixture.whenStable();
    fixture.detectChanges();

    expect(button.disabled).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });
});
