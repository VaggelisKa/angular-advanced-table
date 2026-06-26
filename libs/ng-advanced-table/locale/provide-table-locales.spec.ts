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
  describe('GIVEN: table locale providers are configured', () => {
    describe('WHEN: registers every built-in table locale with no configuration', () => {
      it('THEN: it makes each built-in table locale available', () => {
        configure(provideNatTableLocales());

        const tableIntl = TestBed.inject(NAT_TABLE_INTL);

        for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_LOCALES)) {
          expect(tableIntl.locales?.[localeId]).toBeDefined();
        }
      });
    });
  });

  describe('GIVEN: table locale providers are configured with built-in English table copy', () => {
    describe('WHEN: uses platform primary modifier shortcuts in the built-in English column reorder instructions', () => {
      it('THEN: it keeps English reorder instructions platform-aware', () => {
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

  describe('GIVEN: companion locale providers are configured with companion UI locale ids', () => {
    describe('WHEN: registering each built-in companion UI locale', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_UI_LOCALES))('THEN: it makes the companion UI locale %s available', (localeId) => {
        expect(uiLocale(uiIntl, localeId)).toBeDefined();
      });
    });
  });

  describe('GIVEN: companion locale providers are configured with companion utils locale ids', () => {
    describe('WHEN: registering each built-in companion utils locale', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_UTILS_LOCALES))('THEN: it makes the companion utils locale %s available', (localeId) => {
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

  describe('GIVEN: a partial built-in UI locale override is configured with a group label override', () => {
    describe('WHEN: keeps the overridden group aria label', () => {
      it('THEN: it preserves the supplied page-size group label', () => {
        expect(en?.pageSize?.groupAriaLabel).toBe('Invoices per page');
      });
    });
  });

  describe('GIVEN: a partial built-in UI locale override is configured with a page-size option text override', () => {
    describe('WHEN: keeps the overridden option text', () => {
      it('THEN: it uses the supplied page-size option text formatter', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionText?.(pageSizeContext)).toBe('25 invoices');
      });
    });
  });

  describe('GIVEN: a partial built-in UI locale override is configured with nested default UI copy', () => {
    describe('WHEN: preserves the nested default option aria label', () => {
      it('THEN: it keeps the default page-size aria label formatter', () => {
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

  describe('GIVEN: custom table, UI, and utils locale ids are configured with custom table locale definitions', () => {
    describe('WHEN: adds the custom table locale', () => {
      it('THEN: it makes the custom table locale available', () => {
        expect(tableAccess(TestBed.inject(NAT_TABLE_INTL), 'qa')?.emptyState).toBe('QA empty state');
      });
    });
  });

  describe('GIVEN: custom table, UI, and utils locale ids are configured with custom UI locale definitions', () => {
    describe('WHEN: adds the custom UI locale', () => {
      it('THEN: it makes the custom UI locale available', () => {
        expect(uiLocale(TestBed.inject(NAT_TABLE_UI_INTL), 'qa')?.search?.label).toBe('QA search');
      });
    });
  });

  describe('GIVEN: custom table, UI, and utils locale ids are configured with custom utils locale definitions', () => {
    describe('WHEN: adds the custom utils locale', () => {
      it('THEN: it makes the custom utils locale available', () => {
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

  describe('GIVEN: a nested table locale provider overrides its parent with parent table locale state copy', () => {
    describe('WHEN: keeps the parent empty and loading state', () => {
      it('THEN: it preserves parent table state labels', () => {
        expect(accessibilityText?.emptyState).toBe('Parent empty state');
        expect(accessibilityText?.loadingState).toBe('Parent loading state');
      });
    });
  });

  describe('GIVEN: a nested table locale provider overrides its parent with child table locale overrides', () => {
    describe('WHEN: keeps the built-in error state and child description', () => {
      it('THEN: it merges built-in and child table labels', () => {
        expect(accessibilityText?.errorState).toBe('Rows could not be loaded.');
        expect(accessibilityText?.description).toBe('Child table description');
      });
    });
  });

  describe('GIVEN: a nested table locale provider overrides its parent with nested table keyboard copy', () => {
    describe('WHEN: keeps the built-in keyboard instructions', () => {
      it('THEN: it preserves inherited keyboard guidance', () => {
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

  describe('GIVEN: a nested UI locale provider overrides its parent with parent UI locale copy', () => {
    describe('WHEN: keeps the parent page-size group aria label', () => {
      it('THEN: it preserves the parent page-size group label', () => {
        expect(en?.pageSize?.groupAriaLabel).toBe('Parent page size');
      });
    });
  });

  describe('GIVEN: a nested UI locale provider overrides its parent with child UI locale overrides', () => {
    describe('WHEN: keeps the child search label', () => {
      it('THEN: it uses the child search label override', () => {
        expect(en?.search?.label).toBe('Child search');
      });
    });
  });

  describe('GIVEN: a nested UI locale provider overrides its parent with nested default page-size copy', () => {
    describe('WHEN: preserves the nested default page-size option aria label', () => {
      it('THEN: it keeps the default page-size option aria label', () => {
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

  describe('GIVEN: a nested utils locale provider overrides its parent with parent utils locale copy', () => {
    describe('WHEN: keeps the parent panel aria label', () => {
      it('THEN: it preserves the parent render panel label', () => {
        expect(renderMetrics?.panel?.ariaLabel).toBe('Parent render panel');
      });
    });
  });

  describe('GIVEN: a nested utils locale provider overrides its parent with child utils locale overrides', () => {
    describe('WHEN: keeps the child column header', () => {
      it('THEN: it uses the child render column header', () => {
        expect(renderMetrics?.column?.header).toBe('Child render column');
      });
    });
  });

  describe('GIVEN: a nested utils locale provider overrides its parent with nested default utils copy', () => {
    describe('WHEN: preserves the nested default column unit suffix', () => {
      it('THEN: it keeps the default render-metric unit suffix', () => {
        expect(renderMetrics?.column?.unitSuffix).toBe(' ms');
      });
    });
  });
});
