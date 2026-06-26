import { EnvironmentInjector, createEnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  NAT_TABLE_BUILT_IN_UI_LOCALES,
  NAT_TABLE_BUILT_IN_UTILS_LOCALES,
  NAT_TABLE_UI_INTL,
  NAT_TABLE_UTILS_INTL,
  provideNatTableUiLocales,
  provideNatTableUtilsLocales
} from 'ng-advanced-table/locale';

import { NAT_TABLE_BUILT_IN_LOCALES } from './built-in-locales';
import { NAT_TABLE_INTL, provideNatTableLocales } from './provide-table-locales';
import type { NatTableAccessibilityText, NatTableIntlConfig } from './types';
import type { NatTableAccessibilityPageSizeLabels, NatTableUiIntl, NatTableUiIntlConfig } from './ui/ui-types';
import type { NatTableRenderMetricsIntl, NatTableUtilsIntlConfig } from './utils/utils-types';

const configure = (...providers: Provider[]): void => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ...providers]
  });
};

const tableAccess = (intl: NatTableIntlConfig, localeId: string): NatTableAccessibilityText | undefined =>
  intl.locales?.[localeId]?.accessibilityText;

const uiLocale = (intl: NatTableUiIntlConfig, localeId: string): NatTableUiIntl | undefined => intl.locales?.[localeId];

const pageSizeLabels = (ui?: NatTableUiIntl): NatTableAccessibilityPageSizeLabels | undefined => ui?.pageSize?.accessibilityLabels;

const utilsMetrics = (intl: NatTableUtilsIntlConfig, localeId: string): NatTableRenderMetricsIntl | undefined =>
  intl.locales?.[localeId]?.renderMetrics;

const pageSizeContext = {
  pageSizeValue: 25,
  pageSizeText: '25',
  selectionState: 'not-selected' as const
};

afterEach(() => {
  TestBed.resetTestingModule();
});

describe('FEATURE: provideNatTableLocales', () => {
  describe('GIVEN: registers every built-in table locale with no configuration', () => {
    describe('WHEN: registers every built-in table locale with no configuration', () => {
      it('THEN: it registers every built-in table locale with no configuration', () => {
        configure(provideNatTableLocales());

        const tableIntl = TestBed.inject(NAT_TABLE_INTL);

        for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_LOCALES)) {
          expect(tableIntl.locales?.[localeId]).toBeDefined();
        }
      });
    });
  });

  describe('GIVEN: uses platform primary modifier shortcuts in the built-in English column reorder instructions', () => {
    describe('WHEN: uses platform primary modifier shortcuts in the built-in English column reorder instructions', () => {
      it('THEN: it uses platform primary modifier shortcuts in the built-in English column reorder instructions', () => {
        configure(provideNatTableLocales());

        expect(tableAccess(TestBed.inject(NAT_TABLE_INTL), 'en')?.reorderKeyboardInstructions).toBe(
          'Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.'
        );
      });
    });
  });
});

describe('FEATURE: companion UI and utils locale registration', () => {
  let uiIntl: NatTableUiIntlConfig;
  let utilsIntl: NatTableUtilsIntlConfig;

  beforeEach(() => {
    configure(provideNatTableUiLocales(), provideNatTableUtilsLocales());
    uiIntl = TestBed.inject(NAT_TABLE_UI_INTL);
    utilsIntl = TestBed.inject(NAT_TABLE_UTILS_INTL);
  });

  describe('GIVEN: registers companion UI locale %s', () => {
    describe('WHEN: registers companion UI locale %s', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES))('THEN: it registers companion UI locale %s', (localeId) => {
        expect(uiLocale(uiIntl, localeId)).toBeDefined();
      });
    });
  });

  describe('GIVEN: registers companion utils locale %s', () => {
    describe('WHEN: registers companion utils locale %s', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_UTILS_LOCALES))('THEN: it registers companion utils locale %s', (localeId) => {
        expect(utilsIntl.locales?.[localeId]).toBeDefined();
      });
    });
  });
});

describe('FEATURE: partial built-in UI locale overrides', () => {
  let en: NatTableUiIntl | undefined;

  beforeEach(() => {
    configure(
      provideNatTableUiLocales({
        en: {
          pageSize: {
            groupAriaLabel: 'Invoices per page',
            accessibilityLabels: {
              pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} invoices`
            }
          }
        }
      })
    );
    en = uiLocale(TestBed.inject(NAT_TABLE_UI_INTL), 'en');
  });

  describe('GIVEN: keeps the overridden group aria label', () => {
    describe('WHEN: keeps the overridden group aria label', () => {
      it('THEN: it keeps the overridden group aria label', () => {
        expect(en?.pageSize?.groupAriaLabel).toBe('Invoices per page');
      });
    });
  });

  describe('GIVEN: keeps the overridden option text', () => {
    describe('WHEN: keeps the overridden option text', () => {
      it('THEN: it keeps the overridden option text', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionText?.(pageSizeContext)).toBe('25 invoices');
      });
    });
  });

  describe('GIVEN: preserves the nested default option aria label', () => {
    describe('WHEN: preserves the nested default option aria label', () => {
      it('THEN: it preserves the nested default option aria label', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionAriaLabel?.(pageSizeContext)).toBe('25 rows per page');
      });
    });
  });
});

describe('FEATURE: custom locale ids through overrides', () => {
  beforeEach(() => {
    configure(
      provideNatTableLocales({ qa: { accessibilityText: { emptyState: 'QA empty state' } } }),
      provideNatTableUiLocales({ qa: { search: { label: 'QA search' } } }),
      provideNatTableUtilsLocales({ qa: { renderMetrics: { panel: { ariaLabel: 'QA render panel' } } } })
    );
  });

  describe('GIVEN: adds the custom table locale', () => {
    describe('WHEN: adds the custom table locale', () => {
      it('THEN: it adds the custom table locale', () => {
        expect(tableAccess(TestBed.inject(NAT_TABLE_INTL), 'qa')?.emptyState).toBe('QA empty state');
      });
    });
  });

  describe('GIVEN: adds the custom UI locale', () => {
    describe('WHEN: adds the custom UI locale', () => {
      it('THEN: it adds the custom UI locale', () => {
        expect(uiLocale(TestBed.inject(NAT_TABLE_UI_INTL), 'qa')?.search?.label).toBe('QA search');
      });
    });
  });

  describe('GIVEN: adds the custom utils locale', () => {
    describe('WHEN: adds the custom utils locale', () => {
      it('THEN: it adds the custom utils locale', () => {
        expect(utilsMetrics(TestBed.inject(NAT_TABLE_UTILS_INTL), 'qa')?.panel?.ariaLabel).toBe('QA render panel');
      });
    });
  });
});

describe('FEATURE: parent table locale overrides in nested providers', () => {
  let childInjector: EnvironmentInjector;
  let accessibilityText: NatTableAccessibilityText | undefined;

  beforeEach(() => {
    configure(
      provideNatTableLocales({
        en: {
          accessibilityText: { emptyState: 'Parent empty state', loadingState: 'Parent loading state' }
        }
      })
    );

    childInjector = createEnvironmentInjector(
      [provideNatTableLocales({ en: { accessibilityText: { description: 'Child table description' } } })],
      TestBed.inject(EnvironmentInjector)
    );

    accessibilityText = tableAccess(childInjector.get(NAT_TABLE_INTL), 'en');
  });

  afterEach(() => {
    childInjector.destroy();
  });

  describe('GIVEN: keeps the parent empty and loading state', () => {
    describe('WHEN: keeps the parent empty and loading state', () => {
      it('THEN: it keeps the parent empty and loading state', () => {
        expect(accessibilityText?.emptyState).toBe('Parent empty state');
        expect(accessibilityText?.loadingState).toBe('Parent loading state');
      });
    });
  });

  describe('GIVEN: keeps the built-in error state and child description', () => {
    describe('WHEN: keeps the built-in error state and child description', () => {
      it('THEN: it keeps the built-in error state and child description', () => {
        expect(accessibilityText?.errorState).toBe('Rows could not be loaded.');
        expect(accessibilityText?.description).toBe('Child table description');
      });
    });
  });

  describe('GIVEN: keeps the built-in keyboard instructions', () => {
    describe('WHEN: keeps the built-in keyboard instructions', () => {
      it('THEN: it keeps the built-in keyboard instructions', () => {
        expect(accessibilityText?.keyboardInstructions).toContain('Use arrow keys');
      });
    });
  });
});

describe('FEATURE: parent UI locale overrides in nested providers', () => {
  let childInjector: EnvironmentInjector;
  let en: NatTableUiIntl | undefined;

  beforeEach(() => {
    configure(provideNatTableUiLocales({ en: { pageSize: { groupAriaLabel: 'Parent page size' } } }));

    childInjector = createEnvironmentInjector(
      [provideNatTableUiLocales({ en: { search: { label: 'Child search' } } })],
      TestBed.inject(EnvironmentInjector)
    );

    en = uiLocale(childInjector.get(NAT_TABLE_UI_INTL), 'en');
  });

  afterEach(() => {
    childInjector.destroy();
  });

  describe('GIVEN: keeps the parent page-size group aria label', () => {
    describe('WHEN: keeps the parent page-size group aria label', () => {
      it('THEN: it keeps the parent page-size group aria label', () => {
        expect(en?.pageSize?.groupAriaLabel).toBe('Parent page size');
      });
    });
  });

  describe('GIVEN: keeps the child search label', () => {
    describe('WHEN: keeps the child search label', () => {
      it('THEN: it keeps the child search label', () => {
        expect(en?.search?.label).toBe('Child search');
      });
    });
  });

  describe('GIVEN: preserves the nested default page-size option aria label', () => {
    describe('WHEN: preserves the nested default page-size option aria label', () => {
      it('THEN: it preserves the nested default page-size option aria label', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionAriaLabel?.(pageSizeContext)).toBe('25 rows per page');
      });
    });
  });
});

describe('FEATURE: parent utils locale overrides in nested providers', () => {
  let childInjector: EnvironmentInjector;
  let renderMetrics: NatTableRenderMetricsIntl | undefined;

  beforeEach(() => {
    configure(provideNatTableUtilsLocales({ en: { renderMetrics: { panel: { ariaLabel: 'Parent render panel' } } } }));

    childInjector = createEnvironmentInjector(
      [provideNatTableUtilsLocales({ en: { renderMetrics: { column: { header: 'Child render column' } } } })],
      TestBed.inject(EnvironmentInjector)
    );

    renderMetrics = utilsMetrics(childInjector.get(NAT_TABLE_UTILS_INTL), 'en');
  });

  afterEach(() => {
    childInjector.destroy();
  });

  describe('GIVEN: keeps the parent panel aria label', () => {
    describe('WHEN: keeps the parent panel aria label', () => {
      it('THEN: it keeps the parent panel aria label', () => {
        expect(renderMetrics?.panel?.ariaLabel).toBe('Parent render panel');
      });
    });
  });

  describe('GIVEN: keeps the child column header', () => {
    describe('WHEN: keeps the child column header', () => {
      it('THEN: it keeps the child column header', () => {
        expect(renderMetrics?.column?.header).toBe('Child render column');
      });
    });
  });

  describe('GIVEN: preserves the nested default column unit suffix', () => {
    describe('WHEN: preserves the nested default column unit suffix', () => {
      it('THEN: it preserves the nested default column unit suffix', () => {
        expect(renderMetrics?.column?.unitSuffix).toBe(' ms');
      });
    });
  });
});
