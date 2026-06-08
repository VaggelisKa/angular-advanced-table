import type {
  NatTableUtilsLocaleLabels,
  NatTableUtilsNumberFormatter,
  RowRenderFilterOption,
  RowRenderTone,
} from './utils-types';

/** Locale id for the built-in English utils locale. */
export const NAT_EN_LOCALE_ID = 'en';

export const NAT_TABLE_UTILS_ENGLISH_LOCALE = NAT_EN_LOCALE_ID;

export const RENDER_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'All rows', description: 'Show every measured row' },
  { value: 'fast', label: 'Fast', description: 'Rows that rendered quickly' },
  { value: 'watch', label: 'Watch', description: 'Rows worth watching' },
  { value: 'slow', label: 'Slow', description: 'Rows that rendered slowly' },
];

export function getRenderToneLabel(tone: RowRenderTone | 'idle'): string {
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
}

const DEFAULT_NUMBER_FORMATTER: NatTableUtilsNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in English labels shipped with `ng-advanced-table-locales/utils`. */
export const NAT_EN_UTILS_LOCALE_LABELS: NatTableUtilsLocaleLabels = {
  renderMetrics: {
    filter: {
      heading: 'Render speed',
      groupAriaLabel: 'Row render speed',
      idleCaption: 'Captures the latest row paint time for the current page.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) =>
        `${rowCountText} visible ${rowCountValue === 1 ? 'row' : 'rows'} sampled`,
      options: RENDER_FILTER_OPTIONS,
    },
    panel: {
      ariaLabel: 'Row render sample',
      toneLabel: getRenderToneLabel,
      idleSummary: 'idle',
      rowSampleSummary: ({ rowCountValue, rowCountText }) =>
        `${rowCountText} ${rowCountValue === 1 ? 'row' : 'rows'} sampled`,
      duration: ({ durationMsText }) => `${durationMsText} ms`,
    },
    column: {
      header: 'Render',
      pendingLabel: 'Pending',
      unitSuffix: ' ms',
    },
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

export const NAT_TABLE_UTILS_ENGLISH_INTL = NAT_EN_UTILS_LOCALE_LABELS;
