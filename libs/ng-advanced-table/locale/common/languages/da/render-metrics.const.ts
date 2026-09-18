import { measuredRows, measuredVisibleRows, renderToneLabel } from './text.const';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption } from '../../render-metrics.type';

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alle rækker', description: 'Vis alle målte rækker' },
  { value: 'fast', label: 'Hurtig', description: 'Rækker, der blev gengivet hurtigt' },
  { value: 'watch', label: 'Hold øje', description: 'Rækker, der er værd at holde øje med' },
  { value: 'slow', label: 'Langsom', description: 'Rækker, der blev gengivet langsomt' }
];

/** Built-in Danish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_DA_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Gengivelseshastighed',
      groupAriaLabel: 'Rækkers gengivelseshastighed',
      idleCaption: 'Viser den seneste optegningstid for rækker på den aktuelle side.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Måling af rækkegengivelse',
      toneLabel: renderToneLabel,
      idleSummary: 'inaktiv',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Gengivelse',
      pendingLabel: 'Afventer',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
