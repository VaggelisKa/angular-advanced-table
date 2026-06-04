import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ColumnDef } from '@tanstack/angular-table';
import { NAT_TABLE_INTL, NatTable, type NatTableAccessibilityText } from 'ng-advanced-table';
import {
  NAT_TABLE_UI_INTL,
  NatTablePageSize,
  NatTablePager,
  NatTableSearch,
} from 'ng-advanced-table-ui';
import { NAT_TABLE_UTILS_INTL } from 'ng-advanced-table-utils';

import { NAT_TABLE_BUILT_IN_LOCALES } from './built-in-locales';
import { NAT_EN_LOCALE_ID } from './en';
import { provideNatTableLocales } from './provide-table-locales';

interface Row {
  name: string;
}

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      label: 'Name',
    },
  },
];

@Component({
  imports: [NatTable, NatTablePageSize, NatTablePager, NatTableSearch],
  providers: [
    provideNatTableLocales({
      qa: {
        accessibilityText: {
          emptyState: 'QA empty state',
          tableSummary: () => 'QA table summary',
        },
        search: {
          label: 'QA search',
          placeholder: 'QA search rows',
        },
        pageSize: {
          ariaLabel: 'QA page size',
          accessibilityLabels: {
            pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} qa rows`,
            pageSizeOptionAriaLabel: ({ pageSizeText }) => `QA show ${pageSizeText} rows`,
          },
        },
        pager: {
          ariaLabel: 'QA pager',
          accessibilityLabels: {
            previousPageAriaLabel: 'QA previous',
            nextPageAriaLabel: 'QA next',
            pageIndicator: ({ pageText, pageCountText }) =>
              `QA page ${pageText} of ${pageCountText}`,
          },
        },
      },
    }),
  ],
  template: `
    <nat-table
      #grid="natTable"
      [locale]="locale()"
      [data]="rows()"
      [columns]="columns"
      [enablePagination]="true"
      [accessibilityText]="accessibilityText()"
      ariaLabel="Locale table"
    />

    <nat-table-search [for]="grid" />
    <nat-table-page-size
      [for]="grid"
      [pageSizeOptions]="pageSizeOptions"
      [ariaLabel]="pageSizeAriaLabel()"
    />
    <nat-table-pager [for]="grid" />
  `,
})
class LocaleProviderHost {
  readonly locale = signal(NAT_EN_LOCALE_ID);
  readonly rows = signal<Row[]>([]);
  readonly columns = columns;
  readonly pageSizeOptions = [2, 3] as const;
  readonly accessibilityText = signal<NatTableAccessibilityText>({});
  readonly pageSizeAriaLabel = signal<string | undefined>(undefined);
}

describe('provideNatTableLocales', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('registers every built-in locale with no configuration', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNatTableLocales()],
    });

    const tableIntl = TestBed.inject(NAT_TABLE_INTL);
    const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);
    const utilsIntl = TestBed.inject(NAT_TABLE_UTILS_INTL);

    for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_LOCALES)) {
      expect(tableIntl.locales?.[localeId]).toBeDefined();
      expect(uiIntl.locales?.[localeId]).toBeDefined();
      expect(utilsIntl.locales?.[localeId]).toBeDefined();
    }
  });

  it('merges partial built-in locale overrides without dropping nested defaults', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableLocales({
          en: {
            pageSize: {
              ariaLabel: 'Invoices per page',
              accessibilityLabels: {
                pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} invoices`,
              },
            },
          },
        }),
      ],
    });

    const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);
    const pageSize = uiIntl.locales?.['en']?.pageSize;
    const context = {
      pageSizeValue: 25,
      pageSizeText: '25',
      selectionState: 'not-selected' as const,
    };

    expect(pageSize?.ariaLabel).toBe('Invoices per page');
    expect(pageSize?.accessibilityLabels?.pageSizeOptionText?.(context)).toBe('25 invoices');
    expect(pageSize?.accessibilityLabels?.pageSizeOptionAriaLabel?.(context)).toBe(
      'Show 25 rows per page',
    );
  });

  it('adds custom locale ids through overrides', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableLocales({
          qa: {
            accessibilityText: {
              emptyState: 'QA empty state',
            },
            search: {
              label: 'QA search',
            },
            renderMetrics: {
              panel: {
                ariaLabel: 'QA render panel',
              },
            },
          },
        }),
      ],
    });

    const tableIntl = TestBed.inject(NAT_TABLE_INTL);
    const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);
    const utilsIntl = TestBed.inject(NAT_TABLE_UTILS_INTL);

    expect(tableIntl.locales?.['qa']?.accessibilityText?.emptyState).toBe('QA empty state');
    expect(uiIntl.locales?.['qa']?.search?.label).toBe('QA search');
    expect(utilsIntl.locales?.['qa']?.renderMetrics?.panel?.ariaLabel).toBe('QA render panel');
  });

  it('switches registered locale labels dynamically through the table locale', () => {
    TestBed.configureTestingModule({
      imports: [LocaleProviderHost],
      providers: [provideZonelessChangeDetection()],
    });

    const fixture = TestBed.createComponent(LocaleProviderHost);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const emptyState = nativeElement.querySelector('.empty-state') as HTMLElement;
    const tableSummary = nativeElement.querySelector('p.sr-only') as HTMLElement;
    const searchLabel = nativeElement.querySelector(
      'nat-table-search .control-label',
    ) as HTMLElement;
    const searchInput = nativeElement.querySelector(
      'nat-table-search .search-input',
    ) as HTMLInputElement;
    const pageSizeGroup = nativeElement.querySelector(
      'nat-table-page-size .chip-row',
    ) as HTMLElement;
    const pageSizeButton = nativeElement.querySelector(
      'nat-table-page-size .chip',
    ) as HTMLButtonElement;
    const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
    const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
    const nextButton = nativeElement.querySelector(
      'nat-table-pager .pager-button:last-child',
    ) as HTMLButtonElement;

    expect(emptyState.textContent?.trim()).toBe('No rows match the current view.');
    expect(searchLabel.textContent?.trim()).toBe('Search rows');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rows per page');

    host.locale.set('qa');
    fixture.detectChanges();

    expect(emptyState.textContent?.trim()).toBe('QA empty state');
    expect(tableSummary.textContent?.trim()).toBe('QA table summary');
    expect(searchLabel.textContent?.trim()).toBe('QA search');
    expect(searchInput.placeholder).toBe('QA search rows');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('QA page size');
    expect(pageSizeButton.textContent?.trim()).toBe('2 qa rows');
    expect(pageSizeButton.getAttribute('aria-label')).toBe('QA show 2 rows');
    expect(pager.getAttribute('aria-label')).toBe('QA pager');
    expect(pagerLabel.textContent?.trim()).toBe('QA page 1 of 1');
    expect(nextButton.getAttribute('aria-label')).toBe('QA next');
  });

  it('lets per-instance props override locale defaults', () => {
    TestBed.configureTestingModule({
      imports: [LocaleProviderHost],
      providers: [provideZonelessChangeDetection()],
    });

    const fixture = TestBed.createComponent(LocaleProviderHost);
    const host = fixture.componentInstance;

    host.locale.set('qa');
    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    const emptyState = nativeElement.querySelector('.empty-state') as HTMLElement;
    const pageSizeGroup = nativeElement.querySelector(
      'nat-table-page-size .chip-row',
    ) as HTMLElement;

    expect(emptyState.textContent?.trim()).toBe('QA empty state');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('QA page size');

    host.accessibilityText.set({
      emptyState: 'Instance empty state',
    });
    host.pageSizeAriaLabel.set('Instance page size');
    fixture.detectChanges();

    expect(emptyState.textContent?.trim()).toBe('Instance empty state');
    expect(pageSizeGroup.getAttribute('aria-label')).toBe('Instance page size');
  });
});
