import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NAT_TABLE_BUILT_IN_UI_LOCALES,
  NAT_TABLE_UI_INTL,
  provideNatTableUiLocales,
} from 'ng-advanced-table-locales/ui';
import {
  NAT_TABLE_BUILT_IN_UTILS_LOCALES,
  NAT_TABLE_UTILS_INTL,
  provideNatTableUtilsLocales,
} from 'ng-advanced-table-locales/utils';

import { NAT_TABLE_BUILT_IN_LOCALES } from './built-in-locales';
import { NAT_TABLE_INTL, provideNatTableLocales } from './provide-table-locales';

describe('provideNatTableLocales', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('registers every built-in table locale with no configuration', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNatTableLocales()],
    });

    const tableIntl = TestBed.inject(NAT_TABLE_INTL);

    for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_LOCALES)) {
      expect(tableIntl.locales?.[localeId]).toBeDefined();
    }
  });

  it('registers companion UI and utils locales through explicit providers', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiLocales(),
        provideNatTableUtilsLocales(),
      ],
    });

    const uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);
    const utilsIntl = TestBed.inject(NAT_TABLE_UTILS_INTL);

    for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES)) {
      expect(uiIntl.locales?.[localeId]).toBeDefined();
    }

    for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_UTILS_LOCALES)) {
      expect(utilsIntl.locales?.[localeId]).toBeDefined();
    }
  });

  it('merges partial built-in locale overrides without dropping nested defaults', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiLocales({
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
          },
        }),
        provideNatTableUiLocales({
          qa: {
            search: {
              label: 'QA search',
            },
          },
        }),
        provideNatTableUtilsLocales({
          qa: {
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
});
