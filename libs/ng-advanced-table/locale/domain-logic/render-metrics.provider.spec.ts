import { provideZonelessChangeDetection } from '@angular/core';
import type { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  NAT_TABLE_RENDER_METRICS_INTL,
  injectNatTableRenderMetricsIntl,
  provideNatTableRenderMetricsIntl,
  provideNatTableRenderMetricsLocales
} from './render-metrics.provider';
import { NAT_EN_LOCALE_ID } from '../common/locale-id.const';
import { NAT_EN_RENDER_METRICS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';
import type { NatTableRenderMetricsWidgetsIntl } from '../common/render-metrics.type';
import { expectDefined } from '../test-helpers/locale-copy.helper';
import { resolveNatTableRenderMetricsIntl } from '../utils/render-metrics.util';

const configure = (...providers: Provider[]): void => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection(), ...providers]
  });
};

// The render-metrics merge writes every known key, so absent formatters come back as explicit undefined; toEqual ignores those.
const englishWidgets = expectDefined(NAT_EN_RENDER_METRICS_LOCALE_LABELS.renderMetrics, 'English render-metrics copy');

const resolveWidgets = (localeId: string): NatTableRenderMetricsWidgetsIntl =>
  expectDefined(resolveNatTableRenderMetricsIntl(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL), localeId).renderMetrics, localeId);

describe('FEATURE: render-metrics locale providers', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('GIVEN: provideNatTableRenderMetricsLocales() with no configuration', () => {
    beforeEach(() => {
      configure(provideNatTableRenderMetricsLocales());
    });

    describe('WHEN: injecting the render-metrics intl token', () => {
      it.each(Object.keys(NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES))('THEN: it registers the built-in locale %s', (localeId) => {
        expect(TestBed.inject(NAT_TABLE_RENDER_METRICS_INTL).locales?.[localeId]).toBeDefined();
      });
    });
  });

  describe('GIVEN: a dictionary registered under a custom locale id', () => {
    beforeEach(() => {
      configure(provideNatTableRenderMetricsLocales({ qa: { renderMetrics: { panel: { ariaLabel: 'QA render sample' } } } }));
    });

    describe('WHEN: resolving the custom id', () => {
      it('THEN: it uses the registered copy', () => {
        expect(resolveWidgets('qa').panel?.ariaLabel).toBe('QA render sample');
      });
    });

    describe('WHEN: resolving English', () => {
      it('THEN: it leaves the built-in English copy untouched', () => {
        expect(resolveWidgets(NAT_EN_LOCALE_ID).panel).toEqual(englishWidgets.panel);
      });
    });
  });

  describe('GIVEN: provideNatTableRenderMetricsIntl() with a partial override', () => {
    beforeEach(() => {
      configure(provideNatTableRenderMetricsIntl({ renderMetrics: { panel: { ariaLabel: 'Provider render sample' } } }));
    });

    describe('WHEN: resolving English', () => {
      it('THEN: the override wins over the built-in dictionary', () => {
        expect(resolveWidgets(NAT_EN_LOCALE_ID).panel?.ariaLabel).toBe('Provider render sample');
      });

      it('THEN: fields the override leaves out keep the built-in copy', () => {
        expect(resolveWidgets(NAT_EN_LOCALE_ID).column).toEqual(englishWidgets.column);
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
        configure(provideNatTableRenderMetricsLocales());

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
