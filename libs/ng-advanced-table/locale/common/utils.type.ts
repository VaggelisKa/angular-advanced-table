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
  readonly rowCountValue: number;
  /** Provider-formatted text for `rowCountValue`. */
  readonly rowCountText: string;
};

/** Context passed to duration label formatters. */
export type NatTableRenderMetricsDurationContext = {
  /** Duration in milliseconds. */
  readonly durationMsValue: number;
  /** Provider-formatted text for `durationMsValue`. */
  readonly durationMsText: string;
};

/** Labels used by render-metrics filters. */
export type NatTableRenderMetricsFilterIntl = {
  /** Visible label for the filter control. */
  readonly heading?: string;
  /** Group label for the filter chips. */
  readonly groupAriaLabel?: string;
  /** Caption shown before measurements are recorded. */
  readonly idleCaption?: string;
  /** Caption shown when a measurement is available. */
  readonly rowSampleCaption?: (context: NatTableRenderMetricsRowCountContext) => string;
  /** Filter chip labels and descriptions. */
  readonly options?: readonly RowRenderFilterOption[];
};

/** Labels used by render-metrics panels. */
export type NatTableRenderMetricsPanelIntl = {
  /** Label applied to the KPI panel. */
  readonly ariaLabel?: string;
  /** Visible label for the current tone. */
  readonly toneLabel?: (tone: RowRenderTone | 'idle') => string;
  /** Summary shown before measurements are recorded. */
  readonly idleSummary?: string;
  /** Summary shown when a measurement is available. */
  readonly rowSampleSummary?: (context: NatTableRenderMetricsRowCountContext) => string;
  /** Visible duration text. */
  readonly duration?: (context: NatTableRenderMetricsDurationContext) => string;
};

/** Defaults used by render-metrics columns. */
export type NatTableRenderMetricsColumnIntl = {
  /** Static header label. */
  readonly header?: string;
  /** Cell label when no metric has been recorded yet. */
  readonly pendingLabel?: string;
  /** Suffix appended to measurement values when `duration` is omitted. */
  readonly unitSuffix?: string;
  /** Visible cell duration text. */
  readonly duration?: (context: NatTableRenderMetricsDurationContext) => string;
};

/** App or feature-level defaults for render-metrics helper copy. */
export type NatTableRenderMetricsIntl = {
  readonly filter?: NatTableRenderMetricsFilterIntl;
  readonly panel?: NatTableRenderMetricsPanelIntl;
  readonly column?: NatTableRenderMetricsColumnIntl;
};

/** Locale-specific defaults for `ng-advanced-table/render-metrics`. */
export type NatTableUtilsIntl = {
  readonly renderMetrics?: NatTableRenderMetricsIntl;
  /** Number formatter used for row counts and durations. */
  readonly formatNumber?: NatTableUtilsNumberFormatter;
};

export type NatTableUtilsIntlConfig = {
  /** Locale dictionaries keyed by locale id. */
  readonly locales?: Record<string, NatTableUtilsIntl>;
};

export type NatTableUtilsIntlProviderConfig = NatTableUtilsIntl | NatTableUtilsIntlConfig;

/** Utils locale dictionaries keyed by locale id. */
export type NatTableUtilsLocaleLabelsMap = Record<string, NatTableUtilsIntl>;

/** Alias for the utils locale label shape. */
export type NatTableUtilsLocaleLabels = NatTableUtilsIntl;
