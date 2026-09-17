import { NAT_DA_RENDER_METRICS_LOCALE_LABELS } from './locale-da-render-metrics.const';
import { NAT_FI_RENDER_METRICS_LOCALE_LABELS } from './locale-fi-render-metrics.const';
import {
  NAT_DA_LOCALE_ID,
  NAT_EN_LOCALE_ID,
  NAT_FI_LOCALE_ID,
  NAT_NB_LOCALE_ID,
  NAT_NO_LOCALE_ID,
  NAT_SV_LOCALE_ID
} from './locale-id.const';
import { NAT_NB_RENDER_METRICS_LOCALE_LABELS } from './locale-nb-render-metrics.const';
import { NAT_SV_RENDER_METRICS_LOCALE_LABELS } from './locale-sv-render-metrics.const';
import { NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES } from './render-metrics.const';
import type {
  NatTableRenderMetricsColumnIntl,
  NatTableRenderMetricsDurationContext,
  NatTableRenderMetricsLocalesMap,
  NatTableRenderMetricsNumberFormatter,
  NatTableRenderMetricsRowCountContext,
  RowRenderTone
} from './render-metrics.type';

const expectDefined = <TValue>(value: TValue | undefined, label: string): TValue => {
  if (value === undefined) {
    throw new Error(`${label} must be defined.`);
  }

  return value;
};

const isNonEmptyText = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0;

const producesText = <TContext>(formatter: ((context: TContext) => string) | undefined, context: TContext): boolean =>
  typeof formatter === 'function' && isNonEmptyText(formatter(context));

const formatsNumber = (formatter: NatTableRenderMetricsNumberFormatter | undefined, localeId: string): boolean =>
  typeof formatter === 'function' && isNonEmptyText(formatter(1234.5, { maximumFractionDigits: 1 }, localeId));

/* Every dictionary the entry point ships: the English default plus the opt-in
   translations a consumer registers through the locale providers. */
const SHIPPED_RENDER_METRICS_LOCALES: NatTableRenderMetricsLocalesMap = {
  ...NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES,
  [NAT_DA_LOCALE_ID]: NAT_DA_RENDER_METRICS_LOCALE_LABELS,
  [NAT_FI_LOCALE_ID]: NAT_FI_RENDER_METRICS_LOCALE_LABELS,
  [NAT_NB_LOCALE_ID]: NAT_NB_RENDER_METRICS_LOCALE_LABELS,
  [NAT_NO_LOCALE_ID]: NAT_NB_RENDER_METRICS_LOCALE_LABELS,
  [NAT_SV_LOCALE_ID]: NAT_SV_RENDER_METRICS_LOCALE_LABELS
};

const localeIds = Object.keys(SHIPPED_RENDER_METRICS_LOCALES);
const EXPECTED_FILTER_VALUES = ['all', 'fast', 'watch', 'slow'];
const RENDER_TONES: readonly (RowRenderTone | 'idle')[] = ['idle', 'fast', 'watch', 'slow'];

const sampledRowsContext: NatTableRenderMetricsRowCountContext = {
  rowCountValue: 3,
  rowCountText: '3'
};

// Nordic plurals inflect the modifier along with the noun, so a single sampled
// row is a distinct phrase rather than the plural minus a suffix.
const singleSampledRowContext: NatTableRenderMetricsRowCountContext = {
  rowCountValue: 1,
  rowCountText: '1'
};

const durationContext: NatTableRenderMetricsDurationContext = {
  durationMsValue: 12.3,
  durationMsText: '12.3'
};

const hasDurationCopy = (column: NatTableRenderMetricsColumnIntl): boolean => {
  const hasDurationFormatter = typeof column.duration === 'function';
  const hasUnitSuffix = typeof column.unitSuffix === 'string' && column.unitSuffix.trim().length > 0;

  return hasDurationFormatter || hasUnitSuffix;
};

const durationFormatterValid = (column: NatTableRenderMetricsColumnIntl): boolean =>
  typeof column.duration !== 'function' || isNonEmptyText(column.duration(durationContext));

describe('FEATURE: built-in render-metrics locale completeness', () => {
  describe('GIVEN: the built-in render-metrics locale registry', () => {
    describe('WHEN: counting the locales it registers without configuration', () => {
      it('THEN: it registers English only, leaving translations opt-in', () => {
        expect(Object.keys(NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES)).toStrictEqual([NAT_EN_LOCALE_ID]);
      });
    });
  });

  describe('GIVEN: every built-in render-metrics locale dictionary', () => {
    describe('WHEN: inspecting the render-metrics filter', () => {
      it.each(localeIds)('THEN: %s ships complete render-metrics filter copy', (localeId) => {
        const renderMetrics = expectDefined(SHIPPED_RENDER_METRICS_LOCALES[localeId].renderMetrics, `${localeId}: renderMetrics`);
        const filter = expectDefined(renderMetrics.filter, `${localeId}: renderMetrics.filter`);
        const options = expectDefined(filter.options, `${localeId}: renderMetrics.filter.options`);

        expect(isNonEmptyText(filter.heading), `${localeId}: filter.heading`).toBe(true);
        expect(isNonEmptyText(filter.groupAriaLabel), `${localeId}: filter.groupAriaLabel`).toBe(true);
        expect(isNonEmptyText(filter.idleCaption), `${localeId}: filter.idleCaption`).toBe(true);
        expect(producesText(filter.rowSampleCaption, sampledRowsContext), `${localeId}: filter.rowSampleCaption`).toBe(true);
        expect(producesText(filter.rowSampleCaption, singleSampledRowContext), `${localeId}: filter.rowSampleCaption (single)`).toBe(
          true
        );
        expect(options.map((option) => option.value)).toStrictEqual(EXPECTED_FILTER_VALUES);
        expect(
          options.every((option) => isNonEmptyText(option.label) && isNonEmptyText(option.description)),
          `${localeId}: filter.options copy`
        ).toBe(true);
      });
    });

    describe('WHEN: inspecting the render-metrics panel', () => {
      it.each(localeIds)('THEN: %s ships complete render-metrics panel copy', (localeId) => {
        const renderMetrics = expectDefined(SHIPPED_RENDER_METRICS_LOCALES[localeId].renderMetrics, `${localeId}: renderMetrics`);
        const panel = expectDefined(renderMetrics.panel, `${localeId}: renderMetrics.panel`);
        const toneLabel = expectDefined(panel.toneLabel, `${localeId}: renderMetrics.panel.toneLabel`);

        expect(isNonEmptyText(panel.ariaLabel), `${localeId}: panel.ariaLabel`).toBe(true);
        expect(
          RENDER_TONES.every((tone) => isNonEmptyText(toneLabel(tone))),
          `${localeId}: panel.toneLabel`
        ).toBe(true);
        expect(isNonEmptyText(panel.idleSummary), `${localeId}: panel.idleSummary`).toBe(true);
        expect(producesText(panel.rowSampleSummary, sampledRowsContext), `${localeId}: panel.rowSampleSummary`).toBe(true);
        expect(producesText(panel.rowSampleSummary, singleSampledRowContext), `${localeId}: panel.rowSampleSummary (single)`).toBe(
          true
        );
        expect(producesText(panel.duration, durationContext), `${localeId}: panel.duration`).toBe(true);
      });
    });

    describe('WHEN: inspecting the render-metrics column', () => {
      it.each(localeIds)('THEN: %s ships complete render-metrics column copy', (localeId) => {
        const renderMetrics = expectDefined(SHIPPED_RENDER_METRICS_LOCALES[localeId].renderMetrics, `${localeId}: renderMetrics`);
        const column = expectDefined(renderMetrics.column, `${localeId}: renderMetrics.column`);

        expect(isNonEmptyText(column.header), `${localeId}: column.header`).toBe(true);
        expect(isNonEmptyText(column.pendingLabel), `${localeId}: column.pendingLabel`).toBe(true);
        expect(hasDurationCopy(column), `${localeId}: column duration or unitSuffix`).toBe(true);
        expect(durationFormatterValid(column), `${localeId}: column.duration output`).toBe(true);
      });
    });

    describe('WHEN: inspecting the number formatter', () => {
      it.each(localeIds)('THEN: %s ships a working number formatter', (localeId) => {
        expect(formatsNumber(SHIPPED_RENDER_METRICS_LOCALES[localeId].formatNumber, localeId), `${localeId}: formatNumber`).toBe(true);
      });
    });
  });
});
