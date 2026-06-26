/** Formats numbers used in render-metrics labels and values. */
export type NatTableUtilsNumberFormatter = (value: number, options?: Intl.NumberFormatOptions, locale?: string) => string;

export type RowRenderTone = 'fast' | 'watch' | 'slow';

export type RowRenderFilterOption = {
  readonly value: RowRenderTone | 'all';
  readonly label: string;
  readonly description: string;
};

/** Context passed to row-count label formatters. */
export type NatTableRenderMetricsRowCountContext = {
  /** Numeric row count. */
  rowCountValue: number;
  /** Provider-formatted text for `rowCountValue`. */
  rowCountText: string;
};

/** Context passed to duration label formatters. */
export type NatTableRenderMetricsDurationContext = {
  /** Duration in milliseconds. */
  durationMsValue: number;
  /** Provider-formatted text for `durationMsValue`. */
  durationMsText: string;
};

/** Labels used by render-metrics filters. */
export type NatTableRenderMetricsFilterIntl = {
  /** Visible label for the filter control. */
  heading?: string;
  /** Group label for the filter chips. */
  groupAriaLabel?: string;
  /** Caption shown before measurements are recorded. */
  idleCaption?: string;
  /** Caption shown when a measurement is available. */
  rowSampleCaption?: (context: NatTableRenderMetricsRowCountContext) => string;
  /** Filter chip labels and descriptions. */
  options?: readonly RowRenderFilterOption[];
};

/** Labels used by render-metrics panels. */
export type NatTableRenderMetricsPanelIntl = {
  /** Label applied to the KPI panel. */
  ariaLabel?: string;
  /** Visible label for the current tone. */
  toneLabel?: (tone: RowRenderTone | 'idle') => string;
  /** Summary shown before measurements are recorded. */
  idleSummary?: string;
  /** Summary shown when a measurement is available. */
  rowSampleSummary?: (context: NatTableRenderMetricsRowCountContext) => string;
  /** Visible duration text. */
  duration?: (context: NatTableRenderMetricsDurationContext) => string;
};

/** Defaults used by render-metrics columns. */
export type NatTableRenderMetricsColumnIntl = {
  /** Static header label. */
  header?: string;
  /** Cell label when no metric has been recorded yet. */
  pendingLabel?: string;
  /** Suffix appended to measurement values when `duration` is omitted. */
  unitSuffix?: string;
  /** Visible cell duration text. */
  duration?: (context: NatTableRenderMetricsDurationContext) => string;
};

/** App or feature-level defaults for render-metrics helper copy. */
export type NatTableRenderMetricsIntl = {
  filter?: NatTableRenderMetricsFilterIntl;
  panel?: NatTableRenderMetricsPanelIntl;
  column?: NatTableRenderMetricsColumnIntl;
};

/** Locale-specific defaults for `ng-advanced-table/utils`. */
export type NatTableUtilsIntl = {
  renderMetrics?: NatTableRenderMetricsIntl;
  /** Number formatter used for row counts and durations. */
  formatNumber?: NatTableUtilsNumberFormatter;
};

export type NatTableUtilsIntlConfig = {
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableUtilsIntl>;
};

export type NatTableUtilsIntlProviderConfig = NatTableUtilsIntl | NatTableUtilsIntlConfig;

/** Utils locale dictionaries keyed by locale id. */
export type NatTableUtilsLocaleLabelsMap = Record<string, NatTableUtilsIntl>;

/** Alias for the utils locale label shape. */
export type NatTableUtilsLocaleLabels = NatTableUtilsIntl;
