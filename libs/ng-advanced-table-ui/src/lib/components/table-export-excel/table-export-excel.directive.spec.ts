import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ColumnDef } from '@tanstack/angular-table';
import { vi } from 'vitest';

import { NatTable, NatTableService, type NatTableState } from 'ng-advanced-table';

import { NatTableSurface } from '../table-surface/table-surface';
import { NatTableToolbar } from '../table-toolbar/table-toolbar';
import { NatToolbarItem } from '../table-toolbar/toolbar-item/toolbar-item.directive';
import { NatTableExportExcel } from './table-export-excel.directive';
import { provideNatTableExcelExport } from './table-export-excel.provider';
import type { NatTableExcelExportContext } from './table-export-excel.types';

const xlsxMock = vi.hoisted(() => ({
  aoaToSheet: vi.fn((data: unknown[][]) => ({ data })),
  bookNew: vi.fn(() => ({ sheets: [] })),
  bookAppendSheet: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: xlsxMock.aoaToSheet,
    book_new: xlsxMock.bookNew,
    book_append_sheet: xlsxMock.bookAppendSheet,
  },
  writeFile: xlsxMock.writeFile,
}));

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

@Component({
  imports: [NatTable, NatTableExportExcel, NatTableSurface, NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-surface [state]="tableState">
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExportExcel
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
  imports: [NatTable, NatTableExportExcel, NatTableSurface, NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExportExcel
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
  readonly exportHandler = vi.fn((_context: NatTableExcelExportContext<ExportRow>) =>
    Promise.resolve(),
  );
}

@Component({
  imports: [NatTable, NatTableExportExcel],
  providers: [NatTableService],
  template: `
    <nat-table #grid="natTable" [data]="rows" [columns]="columns" accessibleName="Orders" />
    <button type="button" natTableExportExcel [for]="grid" data-testid="export-button">
      Export
    </button>
  `,
})
class ExplicitControllerHost {
  readonly rows = EXPORT_ROWS;
  readonly columns = EXPORT_COLUMNS;
}

@Component({
  imports: [NatTable, NatTableExportExcel, NatTableSurface],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <nat-table-surface>
      <my-custom-button
        natTableExportExcel
        #excelExport="natTableExportExcel"
        exportFileName="custom-event"
        data-testid="export-button"
        (pressed)="excelExport.trigger($event)"
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
  imports: [NatTable, NatTableExportExcel, NatTableSurface, NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-surface>
      <nat-table-toolbar accessibleName="Export toolbar">
        <button
          type="button"
          natToolbarItem
          natTableExportExcel
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

describe('NatTableExportExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function exportButton(): HTMLButtonElement {
    return document.querySelector('[data-testid="export-button"]') as HTMLButtonElement;
  }

  it('exports all client rows with visible exportable columns by default', async () => {
    const fixture = TestBed.createComponent(DefaultExportHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(xlsxMock.aoaToSheet).toHaveBeenCalledWith([
      ['Risk profile', 'Name'],
      ['{"risk":"low"}', 'Alpha'],
      ['{"risk":"high"}', 'Beta'],
    ]);
    expect(xlsxMock.writeFile).toHaveBeenCalledWith(expect.anything(), 'orders.xlsx', {
      bookType: 'xlsx',
    });
  });

  it('lets a directive-level handler replace provider and client-side handlers', async () => {
    const providerHandler = vi.fn(() => Promise.resolve());

    TestBed.configureTestingModule({
      providers: [provideNatTableExcelExport({ handler: providerHandler })],
    });
    const fixture = TestBed.createComponent(CustomHandlerHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(fixture.componentInstance.exportHandler).toHaveBeenCalledTimes(1);
    expect(providerHandler).not.toHaveBeenCalled();
    expect(xlsxMock.writeFile).not.toHaveBeenCalled();
  });

  it('uses an app-level provider handler when no directive handler is present', async () => {
    const providerHandler = vi.fn(() => Promise.resolve());

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableExcelExport({ handler: providerHandler }),
      ],
    });
    const fixture = TestBed.createComponent(DefaultExportHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(providerHandler).toHaveBeenCalledTimes(1);
    expect(xlsxMock.writeFile).not.toHaveBeenCalled();
  });

  it('supports explicit controller targeting outside nat-table-surface', async () => {
    const fixture = TestBed.createComponent(ExplicitControllerHost);

    fixture.detectChanges();
    await fixture.whenStable();

    exportButton().click();
    await fixture.whenStable();

    expect(xlsxMock.writeFile).toHaveBeenCalledWith(expect.anything(), 'table-export.xlsx', {
      bookType: 'xlsx',
    });
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
    expect(xlsxMock.writeFile).toHaveBeenCalledWith(expect.anything(), 'custom-event.xlsx', {
      bookType: 'xlsx',
    });
  });

  it('marks native buttons busy and ignores duplicate activations while exporting', async () => {
    const fixture = TestBed.createComponent(BusyExportHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const button = exportButton();
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
