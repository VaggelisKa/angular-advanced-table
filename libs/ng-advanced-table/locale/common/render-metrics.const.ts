import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import { NAT_EN_LOCALE_ID } from './locale-id.const';
import type {
  NatTableRenderMetricsIntl,
  NatTableRenderMetricsLocalesMap,
  RowRenderFilterOption,
  RowRenderTone
} from './render-metrics.type';

export const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'All rows', description: 'Show every measured row' },
  { value: 'fast', label: 'Fast', description: 'Rows that rendered quickly' },
  { value: 'watch', label: 'Watch', description: 'Rows worth watching' },
  { value: 'slow', label: 'Slow', description: 'Rows that rendered slowly' }
];

const getRenderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Fast';
    case 'watch':
      return 'Watch';
    case 'slow':
      return 'Slow';
    case 'idle':
      return 'Idle';
  }
};

/** Built-in English labels shipped with `ng-advanced-table/locale`. */
export const NAT_EN_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Render speed',
      groupAriaLabel: 'Row render speed',
      idleCaption: 'Captures the latest row paint time for the current page.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} visible ${rowCountValue === 1 ? 'row' : 'rows'} sampled`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Row render sample',
      toneLabel: getRenderToneLabel,
      idleSummary: 'idle',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${rowCountValue === 1 ? 'row' : 'rows'} sampled`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Render',
      pendingLabel: 'Pending',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

/**
 * Render-metrics locale registry shipped by `ng-advanced-table/locale`.
 *
 * Importing `provideNatTableRenderMetricsLocales()` registers every locale in this object.
 */
export const NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES: NatTableRenderMetricsLocalesMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_RENDER_METRICS_LOCALE_LABELS
};
