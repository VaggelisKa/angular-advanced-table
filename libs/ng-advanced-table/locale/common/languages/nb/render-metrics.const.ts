import { measuredRows, measuredVisibleRows, renderToneLabel } from './text.const';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption } from '../../render-metrics.type';

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alle rader', description: 'Vis alle målte rader' },
  { value: 'fast', label: 'Rask', description: 'Rader som ble gjengitt raskt' },
  { value: 'watch', label: 'Følg med', description: 'Rader som er verdt å følge med på' },
  { value: 'slow', label: 'Treg', description: 'Rader som ble gjengitt tregt' }
];

/** Built-in Norwegian Bokmål render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Gjengivelseshastighet',
      groupAriaLabel: 'Radenes gjengivelseshastighet',
      idleCaption: 'Viser den siste opptegningstiden for rader på gjeldende side.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: FILTER_OPTIONS
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
