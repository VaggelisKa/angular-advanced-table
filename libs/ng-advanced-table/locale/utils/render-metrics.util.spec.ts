import { formatNatTableRenderMetricsNumber, resolveNatTableRenderMetricsIntl } from './render-metrics.util';
import { NAT_EN_RENDER_METRICS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';
import type { NatTableRenderMetricsWidgetsIntl } from '../common/render-metrics.type';
import { expectDefined } from '../test-helpers/locale-copy.helper';
import { SHIPPED_RENDER_METRICS_LOCALES } from '../test-helpers/shipped-locales.helper';

const shippedLocaleIds = Object.keys(SHIPPED_RENDER_METRICS_LOCALES);
// The render-metrics merge writes every known key, so absent formatters come back as explicit undefined; toEqual ignores those.
const englishWidgets = expectDefined(NAT_EN_RENDER_METRICS_LOCALE_LABELS.renderMetrics, 'English render-metrics copy');

const shippedWidgets = (localeId: string): NatTableRenderMetricsWidgetsIntl =>
  expectDefined(SHIPPED_RENDER_METRICS_LOCALES[localeId].renderMetrics, `${localeId}: renderMetrics`);

const resolveShipped = (localeId: string): NatTableRenderMetricsWidgetsIntl =>
  expectDefined(resolveNatTableRenderMetricsIntl({ locales: SHIPPED_RENDER_METRICS_LOCALES }, localeId).renderMetrics, localeId);

describe('FEATURE: render-metrics locale resolution', () => {
  describe('GIVEN: every shipped dictionary registered under its own id', () => {
    describe('WHEN: resolving a registered id', () => {
      it.each(shippedLocaleIds)('THEN: %s resolves to the dictionary registered under it', (localeId) => {
        const expected = shippedWidgets(localeId);
        const resolved = resolveShipped(localeId);

        expect(resolved.filter).toEqual(expected.filter);
        expect(resolved.panel).toEqual(expected.panel);
        expect(resolved.column).toEqual(expected.column);
      });
    });

    describe('WHEN: resolving a region-tagged variant of a registered id', () => {
      it.each(shippedLocaleIds)('THEN: %s-ZZ resolves to the base dictionary', (localeId) => {
        expect(resolveShipped(`${localeId}-ZZ`).panel).toEqual(shippedWidgets(localeId).panel);
      });
    });
  });

  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableRenderMetricsIntl({ locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES }, 'zz');

      it('THEN: it falls back to the registered English copy', () => {
        expect(resolved.renderMetrics).toEqual(englishWidgets);
      });
    });

    describe('WHEN: the registry holds no English entry either', () => {
      const resolved = resolveNatTableRenderMetricsIntl({ locales: {} }, 'zz');

      it('THEN: it falls back to the built-in English copy', () => {
        expect(resolved.renderMetrics).toEqual(englishWidgets);
      });
    });
  });

  describe('GIVEN: a resolved intl with the default number formatter', () => {
    describe('WHEN: formatting a number through the locale formatter', () => {
      const resolved = resolveNatTableRenderMetricsIntl({ locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES }, 'en');

      it('THEN: it applies the configured number format', () => {
        expect(formatNatTableRenderMetricsNumber(resolved, 1234.5, { maximumFractionDigits: 1 }, 'en')).toBe('1,234.5');
      });
    });
  });
});
