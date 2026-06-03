import { inject, InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import type { RowRenderFilterOption, RowRenderTone } from './types';

/** Formats numbers used in render-metrics labels and values. */
export type NatTableUtilsNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
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

/** App or feature-level defaults for `ng-advanced-table-utils`. */
export interface NatTableUtilsIntl {
  renderMetrics?: NatTableRenderMetricsIntl;
  /** Number formatter used for row counts and durations. */
  formatNumber?: NatTableUtilsNumberFormatter;
}

const DEFAULT_NUMBER_FORMATTER: NatTableUtilsNumberFormatter = (value, options) =>
  new Intl.NumberFormat(undefined, options).format(value);

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_UTILS_DEFAULT_INTL: NatTableUtilsIntl = {
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

/** Injection token backing `provideNatTableUtilsIntl(...)`. */
export const NAT_TABLE_UTILS_INTL = new InjectionToken<NatTableUtilsIntl>('NAT_TABLE_UTILS_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_UTILS_DEFAULT_INTL,
});

/**
 * Provides default labels and number formatting for optional utility helpers.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export function provideNatTableUtilsIntl(intl: NatTableUtilsIntl): Provider[] {
  return [
    {
      provide: NAT_TABLE_UTILS_INTL,
      deps: [[new Optional(), new SkipSelf(), NAT_TABLE_UTILS_INTL]],
      useFactory: (parent: NatTableUtilsIntl | null) =>
        mergeNatTableUtilsIntl(parent ?? NAT_TABLE_UTILS_DEFAULT_INTL, intl),
    },
  ];
}

export function mergeNatTableUtilsIntl(
  parent: NatTableUtilsIntl,
  override: NatTableUtilsIntl,
): NatTableUtilsIntl {
  return {
    renderMetrics: {
      filter: mergeRenderMetricsFilterIntl(
        parent.renderMetrics?.filter,
        override.renderMetrics?.filter,
      ),
      panel: mergeRenderMetricsPanelIntl(
        parent.renderMetrics?.panel,
        override.renderMetrics?.panel,
      ),
      column: mergeRenderMetricsColumnIntl(
        parent.renderMetrics?.column,
        override.renderMetrics?.column,
      ),
    },
    formatNumber: override.formatNumber ?? parent.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
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
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options);
}

export function injectNatTableUtilsIntl(): NatTableUtilsIntl {
  try {
    return inject(NAT_TABLE_UTILS_INTL);
  } catch (error) {
    if (!isMissingInjectionContextError(error)) {
      throw error;
    }

    return NAT_TABLE_UTILS_DEFAULT_INTL;
  }
}

function isMissingInjectionContextError(error: unknown): error is Error & { code?: number } {
  return (
    error instanceof Error &&
    (Math.abs((error as { code?: number }).code ?? 0) === 203 || error.message.includes('NG0203'))
  );
}
