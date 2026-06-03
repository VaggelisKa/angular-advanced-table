import { inject, InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import { RENDER_FILTER_OPTIONS, type RowRenderFilterOption, type RowRenderTone } from './types';

/** Formats numbers used in render-metrics labels and values. */
export type NatTableUtilsNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
) => string;

/** Context passed to row-count label formatters. */
export interface NatTableRenderMetricsRowCountContext {
  /** Numeric row count. */
  rowCountValue: number;
  /** Provider-formatted text for `rowCountValue`. */
  rowCountText: string;
}

/** Context passed to duration label formatters. */
export interface NatTableRenderMetricsDurationContext {
  /** Duration in milliseconds. */
  durationMsValue: number;
  /** Provider-formatted text for `durationMsValue`. */
  durationMsText: string;
}

/** Labels used by `<nat-render-metrics-filter>`. */
export interface NatTableRenderMetricsFilterIntl {
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
}

/** Labels used by `<nat-render-metrics-panel>`. */
export interface NatTableRenderMetricsPanelIntl {
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
}

/** Defaults used by `withRenderMetricsColumn(...)`. */
export interface NatTableRenderMetricsColumnIntl {
  /** Static header label. */
  header?: string;
  /** Cell label when no metric has been recorded yet. */
  pendingLabel?: string;
  /** Suffix appended to measurement values when `duration` is omitted. */
  unitSuffix?: string;
  /** Visible cell duration text. */
  duration?: (context: NatTableRenderMetricsDurationContext) => string;
}

/** App or feature-level defaults for render-metrics helper copy. */
export interface NatTableRenderMetricsIntl {
  filter?: NatTableRenderMetricsFilterIntl;
  panel?: NatTableRenderMetricsPanelIntl;
  column?: NatTableRenderMetricsColumnIntl;
}

/** Locale-specific defaults for `ng-advanced-table-utils`. */
export interface NatTableUtilsIntl {
  renderMetrics?: NatTableRenderMetricsIntl;
  /** Number formatter used for row counts and durations. */
  formatNumber?: NatTableUtilsNumberFormatter;
}

export interface NatTableUtilsIntlConfig {
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableUtilsIntl>;
}

export type NatTableUtilsIntlProviderConfig = NatTableUtilsIntl | NatTableUtilsIntlConfig;

export const NAT_TABLE_UTILS_ENGLISH_LOCALE = 'en';

const DEFAULT_NUMBER_FORMATTER: NatTableUtilsNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in English locale defaults used when no provider is configured. */
export const NAT_TABLE_UTILS_ENGLISH_INTL: NatTableUtilsIntl = {
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
      toneLabel: (tone) => {
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
      },
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

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_UTILS_DEFAULT_INTL: NatTableUtilsIntlConfig = {
  locales: {
    [NAT_TABLE_UTILS_ENGLISH_LOCALE]: NAT_TABLE_UTILS_ENGLISH_INTL,
  },
};

/** Injection token backing `provideNatTableUtilsIntl(...)`. */
export const NAT_TABLE_UTILS_INTL = new InjectionToken<NatTableUtilsIntlConfig>(
  'NAT_TABLE_UTILS_INTL',
  {
    providedIn: 'root',
    factory: () => NAT_TABLE_UTILS_DEFAULT_INTL,
  },
);

/**
 * Provides default labels and number formatting for optional utility helpers.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export function provideNatTableUtilsIntl(intl: NatTableUtilsIntlProviderConfig): Provider[] {
  return [
    {
      provide: NAT_TABLE_UTILS_INTL,
      deps: [[new Optional(), new SkipSelf(), NAT_TABLE_UTILS_INTL]],
      useFactory: (parent: NatTableUtilsIntlConfig | null) =>
        mergeNatTableUtilsIntlConfig(parent ?? NAT_TABLE_UTILS_DEFAULT_INTL, intl),
    },
  ];
}

export function mergeNatTableUtilsIntl(
  parent: NatTableUtilsIntl | undefined,
  override: NatTableUtilsIntl,
): NatTableUtilsIntl {
  return {
    renderMetrics: {
      filter: mergeRenderMetricsFilterIntl(
        parent?.renderMetrics?.filter,
        override.renderMetrics?.filter,
      ),
      panel: mergeRenderMetricsPanelIntl(
        parent?.renderMetrics?.panel,
        override.renderMetrics?.panel,
      ),
      column: mergeRenderMetricsColumnIntl(
        parent?.renderMetrics?.column,
        override.renderMetrics?.column,
      ),
    },
    formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

export function mergeRenderMetricsFilterIntl(
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl,
): NatTableRenderMetricsFilterIntl {
  return {
    heading: override?.heading ?? parent?.heading,
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    idleCaption: override?.idleCaption ?? parent?.idleCaption,
    rowSampleCaption: override?.rowSampleCaption ?? parent?.rowSampleCaption,
    options: override?.options ?? parent?.options,
  };
}

export function mergeRenderMetricsPanelIntl(
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl,
): NatTableRenderMetricsPanelIntl {
  return {
    ariaLabel: override?.ariaLabel ?? parent?.ariaLabel,
    toneLabel: override?.toneLabel ?? parent?.toneLabel,
    idleSummary: override?.idleSummary ?? parent?.idleSummary,
    rowSampleSummary: override?.rowSampleSummary ?? parent?.rowSampleSummary,
    duration: override?.duration ?? parent?.duration,
  };
}

export function mergeRenderMetricsColumnIntl(
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl,
): NatTableRenderMetricsColumnIntl {
  return {
    header: override?.header ?? parent?.header,
    pendingLabel: override?.pendingLabel ?? parent?.pendingLabel,
    unitSuffix: override?.unitSuffix ?? parent?.unitSuffix,
    duration: override?.duration ?? parent?.duration,
  };
}

export function formatNatTableUtilsNumber(
  intl: NatTableUtilsIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
}

export function injectNatTableUtilsIntl(): NatTableUtilsIntlConfig {
  try {
    return inject(NAT_TABLE_UTILS_INTL);
  } catch (error) {
    if (!isMissingInjectionContextError(error)) {
      throw error;
    }

    return NAT_TABLE_UTILS_DEFAULT_INTL;
  }
}

export function resolveNatTableUtilsIntl(
  intl: NatTableUtilsIntlConfig,
  locale: string,
): NatTableUtilsIntl {
  const englishIntl =
    intl.locales?.[NAT_TABLE_UTILS_ENGLISH_LOCALE] ?? NAT_TABLE_UTILS_ENGLISH_INTL;
  const selectedIntl =
    intl.locales?.[locale] ?? (locale === NAT_TABLE_UTILS_ENGLISH_LOCALE ? {} : null);

  return selectedIntl
    ? mergeNatTableUtilsIntl(englishIntl, selectedIntl)
    : mergeNatTableUtilsIntl(englishIntl, {});
}

function mergeNatTableUtilsIntlConfig(
  parent: NatTableUtilsIntlConfig,
  override: NatTableUtilsIntlProviderConfig,
): NatTableUtilsIntlConfig {
  const overrideConfig = normalizeUtilsIntlProviderConfig(override);
  const nextLocales: Record<string, NatTableUtilsIntl> = {
    ...(parent.locales ?? {}),
  };

  for (const [locale, localeIntl] of Object.entries(overrideConfig.locales ?? {})) {
    nextLocales[locale] = mergeNatTableUtilsIntl(nextLocales[locale], localeIntl);
  }

  return {
    locales: nextLocales,
  };
}

function normalizeUtilsIntlProviderConfig(
  config: NatTableUtilsIntlProviderConfig,
): NatTableUtilsIntlConfig {
  if (isUtilsIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [NAT_TABLE_UTILS_ENGLISH_LOCALE]: config,
    },
  };
}

function isUtilsIntlConfig(
  config: NatTableUtilsIntlProviderConfig,
): config is NatTableUtilsIntlConfig {
  return 'locales' in config;
}

function isMissingInjectionContextError(error: unknown): error is Error & { code?: number } {
  return (
    error instanceof Error &&
    (Math.abs((error as { code?: number }).code ?? 0) === 203 || error.message.includes('NG0203'))
  );
}
