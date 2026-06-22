import {
  EnvironmentInjector,
  createEnvironmentInjector,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  NAT_TABLE_BUILT_IN_UI_LOCALES,
  NAT_TABLE_BUILT_IN_UTILS_LOCALES,
  NAT_TABLE_UI_INTL,
  NAT_TABLE_UTILS_INTL,
  provideNatTableUiLocales,
  provideNatTableUtilsLocales,
} from 'ng-advanced-table-locales';

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

  // eslint-disable-next-line complexity
  it('uses platform primary modifier shortcuts in the built-in English column reorder instructions', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNatTableLocales()],
    });

    const tableIntl = TestBed.inject(NAT_TABLE_INTL);

    expect(tableIntl.locales?.['en']?.accessibilityText?.reorderKeyboardInstructions).toBe(
      'Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.',
    );
  });

  // eslint-disable-next-line complexity
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

  // eslint-disable-next-line complexity
  it('merges partial built-in locale overrides without dropping nested defaults', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiLocales({
          en: {
            pageSize: {
              groupAriaLabel: 'Invoices per page',
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

    expect(pageSize?.groupAriaLabel).toBe('Invoices per page');
    expect(pageSize?.accessibilityLabels?.pageSizeOptionText?.(context)).toBe('25 invoices');
    expect(pageSize?.accessibilityLabels?.pageSizeOptionAriaLabel?.(context)).toBe(
      '25 rows per page',
    );
  });

  // eslint-disable-next-line complexity
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

  // eslint-disable-next-line complexity
  it('preserves parent table locale overrides in nested providers', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableLocales({
          en: {
            accessibilityText: {
              emptyState: 'Parent empty state',
              loadingState: 'Parent loading state',
            },
          },
        }),
      ],
    });

    const childInjector = createEnvironmentInjector(
      [
        provideNatTableLocales({
          en: {
            accessibilityText: {
              description: 'Child table description',
            },
          },
        }),
      ],
      TestBed.inject(EnvironmentInjector),
    );

    try {
      const tableIntl = childInjector.get(NAT_TABLE_INTL);
      const accessibilityText = tableIntl.locales?.['en']?.accessibilityText;

      expect(accessibilityText?.emptyState).toBe('Parent empty state');
      expect(accessibilityText?.loadingState).toBe('Parent loading state');
      expect(accessibilityText?.errorState).toBe('Rows could not be loaded.');
      expect(accessibilityText?.description).toBe('Child table description');
      expect(accessibilityText?.keyboardInstructions).toContain('Use arrow keys');
    } finally {
      childInjector.destroy();
    }
  });

  // eslint-disable-next-line complexity
  it('preserves parent UI locale overrides in nested providers', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUiLocales({
          en: {
            pageSize: {
              groupAriaLabel: 'Parent page size',
            },
          },
        }),
      ],
    });

    const childInjector = createEnvironmentInjector(
      [
        provideNatTableUiLocales({
          en: {
            search: {
              label: 'Child search',
            },
          },
        }),
      ],
      TestBed.inject(EnvironmentInjector),
    );

    try {
      const uiIntl = childInjector.get(NAT_TABLE_UI_INTL);
      const pageSizeContext = {
        pageSizeValue: 25,
        pageSizeText: '25',
        selectionState: 'not-selected' as const,
      };

      expect(uiIntl.locales?.['en']?.pageSize?.groupAriaLabel).toBe('Parent page size');
      expect(uiIntl.locales?.['en']?.search?.label).toBe('Child search');
      expect(
        uiIntl.locales?.['en']?.pageSize?.accessibilityLabels?.pageSizeOptionAriaLabel?.(
          pageSizeContext,
        ),
      ).toBe('25 rows per page');
    } finally {
      childInjector.destroy();
    }
  });

  // eslint-disable-next-line complexity
  it('preserves parent utils locale overrides in nested providers', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideNatTableUtilsLocales({
          en: {
            renderMetrics: {
              panel: {
                ariaLabel: 'Parent render panel',
              },
            },
          },
        }),
      ],
    });

    const childInjector = createEnvironmentInjector(
      [
        provideNatTableUtilsLocales({
          en: {
            renderMetrics: {
              column: {
                header: 'Child render column',
              },
            },
          },
        }),
      ],
      TestBed.inject(EnvironmentInjector),
    );

    try {
      const utilsIntl = childInjector.get(NAT_TABLE_UTILS_INTL);

      expect(utilsIntl.locales?.['en']?.renderMetrics?.panel?.ariaLabel).toBe(
        'Parent render panel',
      );
      expect(utilsIntl.locales?.['en']?.renderMetrics?.column?.header).toBe('Child render column');
      expect(utilsIntl.locales?.['en']?.renderMetrics?.column?.unitSuffix).toBe(' ms');
    } finally {
      childInjector.destroy();
    }
  });
});
