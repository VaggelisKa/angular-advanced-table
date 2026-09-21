import { EnvironmentInjector, createEnvironmentInjector, provideZonelessChangeDetection } from '@angular/core';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NAT_TABLE_INTL, provideNatTableLocales } from './accessibility.provider';
import { NAT_TABLE_CONTROLS_INTL, provideNatTableControlsLocales } from './controls.provider';
import { NAT_TABLE_RENDER_METRICS_INTL, provideNatTableRenderMetricsLocales } from './render-metrics.provider';
import { NAT_EN_LOCALE_LABELS, NAT_TABLE_BUILT_IN_LOCALES } from '../common/accessibility.const';
import type { NatTableAccessibilityText, NatTableIntlConfig } from '../common/accessibility.type';
import { NAT_EN_CONTROLS_LOCALE_LABELS } from '../common/controls.const';
import type { NatTableAccessibilityPageSizeLabels, NatTableControlsIntl, NatTableControlsIntlConfig } from '../common/controls.type';
import { NAT_EN_RENDER_METRICS_LOCALE_LABELS } from '../common/render-metrics.const';
import type { NatTableRenderMetricsIntlConfig, NatTableRenderMetricsWidgetsIntl } from '../common/render-metrics.type';
import { pageSizeContext } from '../test-helpers/controls-contexts.helper';

const configure = (...providers: Provider[]): void => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ...providers]
  });
};

const tableAccess = (intl: NatTableIntlConfig, localeId: string): NatTableAccessibilityText | undefined =>
  intl.locales?.[localeId]?.accessibilityText;

const controlsLocale = (intl: NatTableControlsIntlConfig, localeId: string): NatTableControlsIntl | undefined =>
  intl.locales?.[localeId];

const pageSizeLabels = (controls?: NatTableControlsIntl): NatTableAccessibilityPageSizeLabels | undefined =>
  controls?.pageSize?.accessibilityLabels;

const renderMetricsWidgets = (intl: NatTableRenderMetricsIntlConfig, localeId: string): NatTableRenderMetricsWidgetsIntl | undefined =>
  intl.locales?.[localeId]?.renderMetrics;

const englishText = NAT_EN_LOCALE_LABELS.accessibilityText;
const englishPageSizeAriaLabel =
  NAT_EN_CONTROLS_LOCALE_LABELS.pageSize?.accessibilityLabels?.pageSizeOptionAriaLabel?.(pageSizeContext);

afterEach(() => {
  TestBed.resetTestingModule();
});

describe('FEATURE: provideNatTableLocales', () => {
  describe('GIVEN: table locale providers are configured', () => {
    describe('WHEN: registers every built-in table locale with no configuration', () => {
      configure(provideNatTableLocales());
      it('THEN: it makes each built-in table locale available', () => {
        const tableIntl = TestBed.inject(NAT_TABLE_INTL);

        for (const localeId of Object.keys(NAT_TABLE_BUILT_IN_LOCALES)) {
          expect(tableIntl.locales?.[localeId]).toBeDefined();
        }
      });
    });
  });
});

describe('FEATURE: partial built-in components locale overrides', () => {
  let en: NatTableControlsIntl | undefined;

  beforeEach(() => {
    configure(
      provideNatTableControlsLocales({
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
    en = controlsLocale(TestBed.inject(NAT_TABLE_CONTROLS_INTL), 'en');
  });

  describe('GIVEN: a partial built-in components locale override is configured with a group label override', () => {
    describe('WHEN: keeps the overridden group aria label', () => {
      it('THEN: it preserves the supplied page-size group label', () => {
        expect(en?.pageSize?.groupAriaLabel).toBe('Invoices per page');
      });
    });
  });

  describe('GIVEN: a partial built-in components locale override is configured with a page-size option text override', () => {
    describe('WHEN: keeps the overridden option text', () => {
      it('THEN: it uses the supplied page-size option text formatter', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionText?.(pageSizeContext)).toBe('25 invoices');
      });
    });
  });

  describe('GIVEN: a partial built-in components locale override is configured with nested default components copy', () => {
    describe('WHEN: preserves the nested default option aria label', () => {
      it('THEN: it keeps the default page-size aria label formatter', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionAriaLabel?.(pageSizeContext)).toBe(englishPageSizeAriaLabel);
      });
    });
  });
});

describe('FEATURE: custom locale ids through overrides', () => {
  beforeEach(() => {
    configure(
      provideNatTableLocales({ qa: { accessibilityText: { emptyState: 'QA empty state' } } }),
      provideNatTableControlsLocales({ qa: { search: { label: 'QA search' } } }),
      provideNatTableRenderMetricsLocales({ qa: { renderMetrics: { panel: { ariaLabel: 'QA render panel' } } } })
    );
  });

  describe('GIVEN: custom table, components, and render-metrics locale ids are configured with custom table locale definitions', () => {
    describe('WHEN: adds the custom table locale', () => {
      it('THEN: it makes the custom table locale available', () => {
        expect(tableAccess(TestBed.inject(NAT_TABLE_INTL), 'qa')?.emptyState).toBe('QA empty state');
      });
    });
  });

  describe('GIVEN: custom table, components, and render-metrics locale ids are configured with custom components locale definitions', () => {
    describe('WHEN: adds the custom components locale', () => {
      it('THEN: it makes the custom components locale available', () => {
        expect(controlsLocale(TestBed.inject(NAT_TABLE_CONTROLS_INTL), 'qa')?.search?.label).toBe('QA search');
      });
    });
  });

  describe('GIVEN: custom table, components, and render-metrics locale ids are configured with custom render-metrics locale definitions', () => {
    describe('WHEN: adds the custom render-metrics locale', () => {
      it('THEN: it makes the custom render-metrics locale available', () => {
        expect(renderMetricsWidgets(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL), 'qa')?.panel?.ariaLabel).toBe('QA render panel');
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
        expect(accessibilityText?.errorState).toBe(englishText?.errorState);
        expect(accessibilityText?.description).toBe('Child table description');
      });
    });
  });

  describe('GIVEN: a nested table locale provider overrides its parent with nested table keyboard copy', () => {
    describe('WHEN: keeps the built-in keyboard instructions', () => {
      it('THEN: it preserves inherited keyboard guidance', () => {
        expect(accessibilityText?.keyboardInstructions).toBe(englishText?.keyboardInstructions);
        expect(accessibilityText?.listKeyboardInstructions).toBe(englishText?.listKeyboardInstructions);
      });
    });
  });
});

describe('FEATURE: parent components locale overrides in nested providers', () => {
  let childInjector: EnvironmentInjector;
  let en: NatTableControlsIntl | undefined;

  beforeEach(() => {
    configure(provideNatTableControlsLocales({ en: { pageSize: { groupAriaLabel: 'Parent page size' } } }));

    childInjector = createEnvironmentInjector(
      [provideNatTableControlsLocales({ en: { search: { label: 'Child search' } } })],
      TestBed.inject(EnvironmentInjector)
    );

    en = controlsLocale(childInjector.get(NAT_TABLE_CONTROLS_INTL), 'en');
  });

  afterEach(() => {
    childInjector.destroy();
  });

  describe('GIVEN: a nested components locale provider overrides its parent with parent components locale copy', () => {
    describe('WHEN: keeps the parent page-size group aria label', () => {
      it('THEN: it preserves the parent page-size group label', () => {
        expect(en?.pageSize?.groupAriaLabel).toBe('Parent page size');
      });
    });
  });

  describe('GIVEN: a nested components locale provider overrides its parent with child components locale overrides', () => {
    describe('WHEN: keeps the child search label', () => {
      it('THEN: it uses the child search label override', () => {
        expect(en?.search?.label).toBe('Child search');
      });
    });
  });

  describe('GIVEN: a nested components locale provider overrides its parent with nested default page-size copy', () => {
    describe('WHEN: preserves the nested default page-size option aria label', () => {
      it('THEN: it keeps the default page-size option aria label', () => {
        expect(pageSizeLabels(en)?.pageSizeOptionAriaLabel?.(pageSizeContext)).toBe(englishPageSizeAriaLabel);
      });
    });
  });
});

describe('FEATURE: parent render-metrics locale overrides in nested providers', () => {
  let childInjector: EnvironmentInjector;
  let renderMetrics: NatTableRenderMetricsWidgetsIntl | undefined;

  beforeEach(() => {
    configure(provideNatTableRenderMetricsLocales({ en: { renderMetrics: { panel: { ariaLabel: 'Parent render panel' } } } }));

    childInjector = createEnvironmentInjector(
      [provideNatTableRenderMetricsLocales({ en: { renderMetrics: { column: { header: 'Child render column' } } } })],
      TestBed.inject(EnvironmentInjector)
    );

    renderMetrics = renderMetricsWidgets(childInjector.get(NAT_TABLE_RENDER_METRICS_INTL), 'en');
  });

  afterEach(() => {
    childInjector.destroy();
  });

  describe('GIVEN: a nested render-metrics locale provider overrides its parent with parent render-metrics locale copy', () => {
    describe('WHEN: keeps the parent panel aria label', () => {
      it('THEN: it preserves the parent render panel label', () => {
        expect(renderMetrics?.panel?.ariaLabel).toBe('Parent render panel');
      });
    });
  });

  describe('GIVEN: a nested render-metrics locale provider overrides its parent with child render-metrics locale overrides', () => {
    describe('WHEN: keeps the child column header', () => {
      it('THEN: it uses the child render column header', () => {
        expect(renderMetrics?.column?.header).toBe('Child render column');
      });
    });
  });

  describe('GIVEN: a nested render-metrics locale provider overrides its parent with nested default render-metrics copy', () => {
    describe('WHEN: preserves the nested default column unit suffix', () => {
      it('THEN: it keeps the default render-metric unit suffix', () => {
        expect(renderMetrics?.column?.unitSuffix).toBe(NAT_EN_RENDER_METRICS_LOCALE_LABELS.renderMetrics?.column?.unitSuffix);
      });
    });
  });
});
