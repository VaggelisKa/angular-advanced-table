import { measuredRows, measuredVisibleRows, renderToneLabel } from './text.const';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption } from '../../render-metrics.type';

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Kaikki rivit', description: 'Näytä kaikki mitatut rivit' },
  { value: 'fast', label: 'Nopea', description: 'Nopeasti renderöityneet rivit' },
  { value: 'watch', label: 'Tarkkaile', description: 'Rivit, joita kannattaa tarkkailla' },
  { value: 'slow', label: 'Hidas', description: 'Hitaasti renderöityneet rivit' }
];

/** Built-in Finnish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Renderöintinopeus',
      groupAriaLabel: 'Rivien renderöintinopeus',
      idleCaption: 'Näyttää nykyisen sivun rivien viimeisimmän piirtoajan.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: FILTER_OPTIONS
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
