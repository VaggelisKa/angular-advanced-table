import { EnvironmentInjector, InjectionToken, createEnvironmentInjector, inject, provideZonelessChangeDetection } from '@angular/core';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NAT_TABLE_INTL, provideNatTableIntl } from './accessibility.provider';
import { NAT_TABLE_CONTROLS_INTL, provideNatTableControlsIntl } from './controls.provider';
import { NAT_TABLE_RENDER_METRICS_INTL, provideNatTableRenderMetricsIntl } from './render-metrics.provider';
import type { NatTableAccessibilityText, NatTableIntlConfig } from '../common/accessibility.type';
import type { NatTableControlsIntl, NatTableControlsIntlConfig } from '../common/controls.type';
import type { NatTableRenderMetricsIntlConfig, NatTableRenderMetricsWidgetsIntl } from '../common/render-metrics.type';

type RuntimeLocaleCopy = {
  readonly tableEmptyState: string;
  readonly controlsSortPrefix: string;
  readonly renderMetricsPanelLabel: string;
};

const RUNTIME_LOCALE_COPY = new InjectionToken<RuntimeLocaleCopy>('RUNTIME_LOCALE_COPY');
const runtimeLocaleCopy: RuntimeLocaleCopy = {
  tableEmptyState: 'Translated empty state',
  controlsSortPrefix: 'Translate sort',
  renderMetricsPanelLabel: 'Translated render panel'
};

const configure = (...providers: Provider[]): void => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ...providers]
  });
};

const tableAccess = (intl: NatTableIntlConfig, localeId: string): NatTableAccessibilityText | undefined =>
  intl.locales?.[localeId]?.accessibilityText;

const controlsLocale = (intl: NatTableControlsIntlConfig, localeId: string): NatTableControlsIntl | undefined =>
  intl.locales?.[localeId];

const renderMetricsWidgets = (intl: NatTableRenderMetricsIntlConfig, localeId: string): NatTableRenderMetricsWidgetsIntl | undefined =>
  intl.locales?.[localeId]?.renderMetrics;

const expectDefined = <T>(value: T | undefined, label: string): T => {
  if (value === undefined) {
    throw new Error(`Expected ${label} to be defined.`);
  }

  return value;
};

afterEach(() => {
  TestBed.resetTestingModule();
});

describe('FEATURE: injectable locale provider factories', () => {
  describe('GIVEN: a table intl factory provider with injectable runtime copy', () => {
    beforeEach(() => {
      configure(
        { provide: RUNTIME_LOCALE_COPY, useValue: runtimeLocaleCopy },
        provideNatTableIntl(() => {
          const copy = inject(RUNTIME_LOCALE_COPY);

          return {
            accessibilityText: {
              emptyState: copy.tableEmptyState
            }
          };
        })
      );
    });

    describe('WHEN: resolving the table intl token', () => {
      it('THEN: it uses the injected copy and preserves built-in fallback labels', () => {
        const accessibilityText = tableAccess(TestBed.inject(NAT_TABLE_INTL), 'en');

        expect(accessibilityText?.emptyState).toBe('Translated empty state');
        expect(accessibilityText?.keyboardInstructions).toContain('Use arrow keys');
      });
    });
  });

  describe('GIVEN: a nested controls intl factory provider with injectable runtime copy', () => {
    let childInjector: EnvironmentInjector;
    let en: NatTableControlsIntl | undefined;

    beforeEach(() => {
      configure(
        { provide: RUNTIME_LOCALE_COPY, useValue: runtimeLocaleCopy },
        provideNatTableControlsIntl({ toolbar: { toolbarLabel: 'Parent toolbar' } })
      );

      childInjector = createEnvironmentInjector(
        [
          provideNatTableControlsIntl(() => {
            const copy = inject(RUNTIME_LOCALE_COPY);

            return {
              headerActions: {
                accessibilityLabels: {
                  sortButton: ({ label }): string => `${copy.controlsSortPrefix} ${label}`
                }
              }
            };
          })
        ],
        TestBed.inject(EnvironmentInjector)
      );

      en = controlsLocale(childInjector.get(NAT_TABLE_CONTROLS_INTL), 'en');
    });

    afterEach(() => {
      childInjector.destroy();
    });

    describe('WHEN: resolving the nested controls intl token', () => {
      it('THEN: it uses injected formatter copy and preserves parent toolbar labels', () => {
        const controls = expectDefined(en, 'controls locale');
        const labels = expectDefined(controls.headerActions?.accessibilityLabels, 'header action labels');
        const sortButton = expectDefined(labels.sortButton, 'sort button formatter');

        expect(sortButton({ label: 'Price', sortState: 'none', sortPriority: null, sortCount: 0 })).toBe('Translate sort Price');
        expect(controls.toolbar?.toolbarLabel).toBe('Parent toolbar');
      });
    });
  });

  describe('GIVEN: a nested render-metrics intl factory provider with injectable runtime copy', () => {
    let childInjector: EnvironmentInjector;
    let renderMetrics: NatTableRenderMetricsWidgetsIntl | undefined;

    beforeEach(() => {
      configure(
        { provide: RUNTIME_LOCALE_COPY, useValue: runtimeLocaleCopy },
        provideNatTableRenderMetricsIntl({ renderMetrics: { column: { header: 'Parent render column' } } })
      );

      childInjector = createEnvironmentInjector(
        [
          provideNatTableRenderMetricsIntl(() => {
            const copy = inject(RUNTIME_LOCALE_COPY);

            return {
              renderMetrics: {
                panel: {
                  ariaLabel: copy.renderMetricsPanelLabel
                }
              }
            };
          })
        ],
        TestBed.inject(EnvironmentInjector)
      );

      renderMetrics = renderMetricsWidgets(childInjector.get(NAT_TABLE_RENDER_METRICS_INTL), 'en');
    });

    afterEach(() => {
      childInjector.destroy();
    });

    describe('WHEN: resolving the nested render-metrics intl token', () => {
      it('THEN: it uses injected panel copy and preserves parent column labels', () => {
        const widgets = expectDefined(renderMetrics, 'render-metrics widgets');
        const panel = expectDefined(widgets.panel, 'render-metrics panel labels');
        const column = expectDefined(widgets.column, 'render-metrics column labels');

        expect(panel.ariaLabel).toBe('Translated render panel');
        expect(column.header).toBe('Parent render column');
      });
    });
  });
});
