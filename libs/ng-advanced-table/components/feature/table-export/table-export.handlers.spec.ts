import { inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { CustomHandlerHost, DelegatingHandlerHost } from './test-helpers/table-export-hosts.helper';
import {
  DefaultExportHost,
  ExportApi,
  downloadMock,
  expectClientCsvDownload,
  exportButton,
  installExportDownloadMock
} from './test-helpers/table-export-setup.helper';
import type { ExportRow } from './test-helpers/table-export-setup.helper';
import { provideNatTableExport } from '../../domain-logic/table-export.provider';

describe('FEATURE: NatTableExport', () => {
  installExportDownloadMock();

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
});
