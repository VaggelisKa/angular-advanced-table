import { RENDER_METRICS_FILTER_OPTIONS, measuredRows, measuredVisibleRows, renderToneLabel } from './locale-fi-text.const';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import type { NatTableRenderMetricsIntl } from './render-metrics.type';

/** Built-in Finnish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Renderöintinopeus',
      groupAriaLabel: 'Rivien renderöintinopeus',
      idleCaption: 'Näyttää nykyisen sivun rivien viimeisimmän piirtoajan.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Rivien renderöintimittaus',
      toneLabel: renderToneLabel,
      idleSummary: 'ei mittausta',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Renderöinti',
      pendingLabel: 'Odottaa',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
