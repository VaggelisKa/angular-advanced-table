import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, vi } from 'vitest';

import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';

import type { NatTableExportContext } from '../../../common/table-export.type';
import { NatToolbarItem } from '../../../ui/toolbar-item/toolbar-item.directive';
import { NatTableSurface } from '../../table-surface/table-surface';
import { NatTableToolbar } from '../../table-toolbar/table-toolbar';
import { NatTableExport } from '../table-export.directive';

export const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

export type ExportRow = {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly details: { readonly risk: string };
};

export const EXPORT_ROWS: readonly ExportRow[] = [
  { id: 'row-1', name: 'Alpha', price: 12, details: { risk: 'low' } },
  { id: 'row-2', name: 'Beta', price: 24, details: { risk: 'high' } }
];

export const EXPORT_COLUMNS: ColumnDef<ExportRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name' } },
  { accessorKey: 'price', header: 'Price', meta: { label: 'Price' } },
  { accessorKey: 'details', header: 'Details', meta: { export: { header: 'Risk profile' } } },
  { id: 'actions', header: 'Actions', cell: () => 'Open', meta: { label: 'Actions' } }
];

export const EXPORT_VALUE_COLUMNS: ColumnDef<ExportRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name' } },
  { accessorKey: 'price', header: 'Price', meta: { label: 'Price', export: { value: () => null } } },
  { accessorKey: 'details', header: 'Details', meta: { export: { value: () => undefined } } }
];

export class ExportApi {
  public readonly exportOrders = vi.fn<(context: NatTableExportContext<ExportRow>) => Promise<void>>(async () => Promise.resolve());
}

let anchorDownloads: string[] = [];
let downloadedBlobs: Blob[] = [];
let anchorClickSpy: MockInstance<() => void> | undefined;

/** URL object-url mock shared across export specs; reset by `installExportDownloadMock`. */
export const downloadMock = {
  createObjectURL: vi.fn((blob: Blob) => {
    downloadedBlobs.push(blob);

    return 'blob:nat-table-export';
  }),
  revokeObjectURL: vi.fn()
};

/** Registers the anchor/URL download mocks and the base testing module for an export spec. */
export const installExportDownloadMock = (): void => {
  beforeEach(() => {
    vi.clearAllMocks();
    anchorDownloads = [];
    downloadedBlobs = [];
    anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      anchorDownloads.push(this.download);
    });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: downloadMock.createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: downloadMock.revokeObjectURL });
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    anchorClickSpy?.mockRestore();
    anchorClickSpy = undefined;
  });
};

export const exportButton = (): HTMLElement => document.querySelector('[data-testid="export-button"]') as HTMLElement;

export const expectClientCsvDownload = (fileName: string): Blob => {
  expect(downloadMock.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  expect(downloadedBlobs).toHaveLength(1);
  expect(anchorDownloads).toStrictEqual([fileName]);

  const blob = downloadedBlobs[0];

  expect(blob).toBeDefined();

  expect(blob.type).toBe(CSV_MIME_TYPE);
  expect(blob.size).toBeGreaterThan(0);

  return blob;
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
export class DefaultExportHost {
  protected readonly rows = EXPORT_ROWS;
  protected readonly columns = EXPORT_COLUMNS;
  protected readonly tableState: Partial<NatTableState> = {
    columnOrder: ['details', 'name', 'price', 'actions'],
    columnVisibility: { price: false }
  };
}
