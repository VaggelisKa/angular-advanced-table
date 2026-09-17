import { RENDER_METRICS_FILTER_OPTIONS, measuredRows, measuredVisibleRows, renderToneLabel } from './text.const';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';
import type { NatTableRenderMetricsIntl } from '../../render-metrics.type';

/** Built-in Swedish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_SV_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Renderingshastighet',
      groupAriaLabel: 'Radernas renderingshastighet',
      idleCaption: 'Visar den senaste uppritningstiden för rader på den aktuella sidan.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Mätning av radrendering',
      toneLabel: renderToneLabel,
      idleSummary: 'inaktiv',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Rendering',
      pendingLabel: 'Väntar',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
