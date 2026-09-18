import { measuredRows, measuredVisibleRows, renderToneLabel } from './text.const';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption } from '../../render-metrics.type';

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alla rader', description: 'Visa alla mätta rader' },
  { value: 'fast', label: 'Snabb', description: 'Rader som renderades snabbt' },
  { value: 'watch', label: 'Bevaka', description: 'Rader som är värda att bevaka' },
  { value: 'slow', label: 'Långsam', description: 'Rader som renderades långsamt' }
];

/** Built-in Swedish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_SV_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Renderingshastighet',
      groupAriaLabel: 'Radernas renderingshastighet',
      idleCaption: 'Visar den senaste uppritningstiden för rader på den aktuella sidan.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: FILTER_OPTIONS
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
