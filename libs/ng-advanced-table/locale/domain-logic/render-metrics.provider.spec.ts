import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  NAT_TABLE_RENDER_METRICS_INTL,
  injectNatTableRenderMetricsIntl,
  provideNatTableRenderMetricsIntl,
  provideNatTableRenderMetricsLocales
} from './render-metrics.provider';
import { NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';
import type {
  NatTableRenderMetricsColumnIntl,
  NatTableRenderMetricsFilterIntl,
  NatTableRenderMetricsIntlConfig,
  NatTableRenderMetricsPanelIntl,
  NatTableRenderMetricsWidgetsIntl
} from '../common/render-metrics.type';
import { resolveNatTableRenderMetricsIntl } from '../utils/render-metrics.util';

const NAT_TABLE_RENDER_METRICS_DEFAULT_INTL: NatTableRenderMetricsIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES
};

const widgetsOf = (intl: NatTableRenderMetricsIntlConfig, localeId: string): NatTableRenderMetricsWidgetsIntl | undefined =>
  intl.locales?.[localeId]?.renderMetrics;

describe('FEATURE: render-metrics locale widgets slice', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('GIVEN: render-metrics locale dictionaries are available', () => {
    describe('WHEN: ships a widgets slice in every built-in render-metrics locale', () => {
      const localeIds = Object.keys(NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES);

      it('THEN: it registers a render-metrics slice for each built-in locale', () => {
        expect(localeIds.length).toBeGreaterThan(0);

        for (const localeId of localeIds) {
          const renderMetrics = NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES[localeId].renderMetrics;

          expect(renderMetrics, `${localeId}: renderMetrics`).toBeDefined();
        }
      });
    });
  });

  describe('GIVEN: render-metrics locale dictionaries are available with provided render-metrics slices', () => {
    describe('WHEN: resolving each built-in locale through provideNatTableRenderMetricsLocales()', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES))(
        'THEN: it preserves render-metrics labels for %s after provider registration',
        (localeId) => {
          TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), provideNatTableRenderMetricsLocales()]
          });

          const intl = TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL);

          expect(widgetsOf(intl, localeId)?.panel?.ariaLabel, `${localeId}: panel.ariaLabel`).toBeTruthy();
        }
      );
    });
  });

  describe('GIVEN: render-metrics locale dictionaries are available with an unknown render-metrics locale id', () => {
    describe('WHEN: falls back to English render-metrics copy for unknown locales', () => {
      const resolved = resolveNatTableRenderMetricsIntl(NAT_TABLE_RENDER_METRICS_DEFAULT_INTL, 'zz');

      it('THEN: it returns the English render-metrics fallback', () => {
        expect(resolved.renderMetrics?.panel?.ariaLabel).toBe('Row render sample');
      });
    });
  });

  describe('GIVEN: render-metrics locale dictionaries are available with a custom render-metrics dictionary', () => {
    describe('WHEN: lets a locale dictionary override English render-metrics copy', () => {
      it('THEN: it uses the locale-specific panel label', () => {
        TestBed.configureTestingModule({
          providers: [
            provideZonelessChangeDetection(),
            provideNatTableRenderMetricsLocales({
              da: {
                renderMetrics: {
                  panel: { ariaLabel: 'Rækkegengivelsesprøve' }
                }
              }
            })
          ]
        });

        const resolved = resolveNatTableRenderMetricsIntl(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL), 'da');

        expect(resolved.renderMetrics?.panel?.ariaLabel).toBe('Rækkegengivelsesprøve');
      });
    });
  });

  describe('GIVEN: render-metrics locale dictionaries are available with render-metrics intl overrides', () => {
    describe('WHEN: lets provideNatTableRenderMetricsIntl overrides win over the built-in dictionary', () => {
      it('THEN: it uses provider overrides before built-in copy', () => {
        TestBed.configureTestingModule({
          providers: [
            provideZonelessChangeDetection(),
            provideNatTableRenderMetricsIntl({
              renderMetrics: {
                panel: { ariaLabel: 'Provider render sample' }
              }
            })
          ]
        });

        const resolved = resolveNatTableRenderMetricsIntl(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL), 'en');

        expect(resolved.renderMetrics?.panel?.ariaLabel).toBe('Provider render sample');
      });
    });
  });
});

describe('FEATURE: English render-metrics copy', () => {
  const english = NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES['en'].renderMetrics;
  const singleRowContext = { rowCountValue: 1, rowCountText: '1' };
  const manyRowsContext = { rowCountValue: 12, rowCountText: '12' };
  const durationContext = { durationMsValue: 8, durationMsText: '8' };

  describe('GIVEN: filter copy', () => {
    let filter: NatTableRenderMetricsFilterIntl | undefined;

    beforeEach(() => {
      filter = english?.filter;
    });

    describe('WHEN: locks the filter heading', () => {
      it('THEN: it keeps the filter heading stable', () => {
        expect(filter?.heading).toBe('Render speed');
      });
    });

    describe('WHEN: locks the singular row-sample caption', () => {
      it('THEN: it keeps singular caption copy stable', () => {
        expect(filter?.rowSampleCaption?.(singleRowContext)).toBe('1 visible row sampled');
      });
    });

    describe('WHEN: locks the plural row-sample caption', () => {
      it('THEN: it keeps plural caption copy stable', () => {
        expect(filter?.rowSampleCaption?.(manyRowsContext)).toBe('12 visible rows sampled');
      });
    });
  });

  describe('GIVEN: panel copy', () => {
    let panel: NatTableRenderMetricsPanelIntl | undefined;

    beforeEach(() => {
      panel = english?.panel;
    });

    describe('WHEN: locks the panel aria label', () => {
      it('THEN: it keeps the panel aria label stable', () => {
        expect(panel?.ariaLabel).toBe('Row render sample');
      });
    });

    describe('WHEN: locks the slow tone label', () => {
      it('THEN: it keeps the slow tone copy stable', () => {
        expect(panel?.toneLabel?.('slow')).toBe('Slow');
      });
    });

    describe('WHEN: locks the idle tone label', () => {
      it('THEN: it keeps the idle tone copy stable', () => {
        expect(panel?.toneLabel?.('idle')).toBe('Idle');
      });
    });

    describe('WHEN: locks the row-sample summary', () => {
      it('THEN: it keeps the singular summary copy stable', () => {
        expect(panel?.rowSampleSummary?.(singleRowContext)).toBe('1 row sampled');
      });
    });

    describe('WHEN: locks the duration text', () => {
      it('THEN: it keeps duration copy stable', () => {
        expect(panel?.duration?.(durationContext)).toBe('8 ms');
      });
    });
  });

  describe('GIVEN: column defaults', () => {
    let column: NatTableRenderMetricsColumnIntl | undefined;

    beforeEach(() => {
      column = english?.column;
    });

    describe('WHEN: locks the column header', () => {
      it('THEN: it keeps the column header copy stable', () => {
        expect(column?.header).toBe('Render');
      });
    });

    describe('WHEN: locks the pending label', () => {
      it('THEN: it keeps the pending label copy stable', () => {
        expect(column?.pendingLabel).toBe('Pending');
      });
    });

    describe('WHEN: locks the unit suffix', () => {
      it('THEN: it keeps the unit suffix copy stable', () => {
        expect(column?.unitSuffix).toBe(' ms');
      });
    });
  });
});

describe('FEATURE: injectNatTableRenderMetricsIntl', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('GIVEN: render-metrics defaults are read inside an Angular injection context', () => {
    describe('WHEN: resolving the helper through the active injector', () => {
      it('THEN: it returns the configured render-metrics token value', () => {
        TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection(), provideNatTableRenderMetricsLocales()]
        });

        const fromHelper = TestBed.runInInjectionContext(() => injectNatTableRenderMetricsIntl());

        expect(fromHelper).toBe(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL));
      });
    });
  });

  describe('GIVEN: render-metrics defaults are read outside any Angular injection context', () => {
    describe('WHEN: resolving the helper without an injector', () => {
      it('THEN: it falls back to the built-in render-metrics defaults', () => {
        expect(injectNatTableRenderMetricsIntl().locales).toBe(NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES);
      });
    });
  });
});
