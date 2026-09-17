import { RENDER_METRICS_FILTER_OPTIONS, measuredRows, measuredVisibleRows, renderToneLabel } from './text.const';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';
import type { NatTableRenderMetricsIntl } from '../../render-metrics.type';

/** Built-in Norwegian Bokmål render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Gjengivelseshastighet',
      groupAriaLabel: 'Radenes gjengivelseshastighet',
      idleCaption: 'Viser den siste opptegningstiden for rader på gjeldende side.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Måling av radgjengivelse',
      toneLabel: renderToneLabel,
      idleSummary: 'inaktiv',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Gjengivelse',
      pendingLabel: 'Venter',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
