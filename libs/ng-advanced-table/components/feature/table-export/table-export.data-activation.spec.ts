import { TestBed } from '@angular/core/testing';

import { BusyExportHost, CustomEventHost, ExplicitControllerHost, ExportValueMappingHost } from './test-helpers/table-export-hosts.helper';
import {
  DefaultExportHost,
  downloadMock,
  expectClientCsvDownload,
  exportButton,
  installExportDownloadMock
} from './test-helpers/table-export-setup.helper';

describe('FEATURE: NatTableExport', () => {
  installExportDownloadMock();

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
