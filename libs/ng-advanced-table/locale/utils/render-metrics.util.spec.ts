import { formatNatTableRenderMetricsNumber, resolveNatTableRenderMetricsIntl } from './render-metrics.util';
import { NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from '../common/render-metrics.const';

describe('FEATURE: render-metrics intl merge', () => {
  describe('GIVEN: a config without the requested locale', () => {
    describe('WHEN: resolving an unknown locale id', () => {
      const resolved = resolveNatTableRenderMetricsIntl({ locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES }, 'zz');

      it('THEN: it falls back to built-in English render-metrics copy', () => {
        expect(resolved.renderMetrics?.column?.header).toBe('Render');
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
