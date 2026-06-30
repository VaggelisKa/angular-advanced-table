/* eslint-disable max-lines */
import { InjectionToken, Optional, SkipSelf, inject } from '@angular/core';
import type { Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_UTILS_LOCALES } from '../common/utils-built-in-locales.const';
import { NAT_TABLE_UTILS_ENGLISH_INTL, NAT_TABLE_UTILS_ENGLISH_LOCALE } from '../common/utils-en.const';
import type {
  NatTableRenderMetricsColumnIntl,
  NatTableRenderMetricsFilterIntl,
  NatTableRenderMetricsIntl,
  NatTableRenderMetricsPanelIntl,
  NatTableUtilsIntl,
  NatTableUtilsIntlConfig,
  NatTableUtilsIntlProviderConfig,
  NatTableUtilsLocaleLabels,
  NatTableUtilsLocaleLabelsMap,
  NatTableUtilsNumberFormatter
} from '../common/utils.type';

const DEFAULT_NUMBER_FORMATTER: NatTableUtilsNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in locale defaults used when no utils locale provider is configured. */
const NAT_TABLE_UTILS_DEFAULT_INTL: NatTableUtilsIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_UTILS_LOCALES
};

/** Injection token backing `provideNatTableUtilsLocales(...)`. */
export const NAT_TABLE_UTILS_INTL = new InjectionToken<NatTableUtilsIntlConfig>('NAT_TABLE_UTILS_INTL', {
  providedIn: 'root',
  factory: (): NatTableUtilsIntlConfig => NAT_TABLE_UTILS_DEFAULT_INTL
});

/** Merges the render-metrics filter text fields, override values winning. */
const mergeRenderMetricsFilterText = (
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl
): Partial<NatTableRenderMetricsFilterIntl> => ({
  heading: override?.heading ?? parent?.heading,
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  idleCaption: override?.idleCaption ?? parent?.idleCaption
});

/** Merges the render-metrics filter callbacks and options, override values winning. */
const mergeRenderMetricsFilterFormatters = (
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl
): Partial<NatTableRenderMetricsFilterIntl> => ({
  rowSampleCaption: override?.rowSampleCaption ?? parent?.rowSampleCaption,
  options: override?.options ?? parent?.options
});

/** Merges render-metrics filter labels and options field by field. */
export const mergeRenderMetricsFilterIntl = (
  parent?: NatTableRenderMetricsFilterIntl,
  override?: NatTableRenderMetricsFilterIntl
): NatTableRenderMetricsFilterIntl => ({
  ...mergeRenderMetricsFilterText(parent, override),
  ...mergeRenderMetricsFilterFormatters(parent, override)
});

/** Merges the render-metrics panel text fields, override values winning. */
const mergeRenderMetricsPanelText = (
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl
): Partial<NatTableRenderMetricsPanelIntl> => ({
  ariaLabel: override?.ariaLabel ?? parent?.ariaLabel,
  toneLabel: override?.toneLabel ?? parent?.toneLabel,
  idleSummary: override?.idleSummary ?? parent?.idleSummary
});

/** Merges the render-metrics panel callbacks, override values winning. */
const mergeRenderMetricsPanelFormatters = (
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl
): Partial<NatTableRenderMetricsPanelIntl> => ({
  rowSampleSummary: override?.rowSampleSummary ?? parent?.rowSampleSummary,
  duration: override?.duration ?? parent?.duration
});

/** Merges render-metrics panel labels and formatters field by field. */
export const mergeRenderMetricsPanelIntl = (
  parent?: NatTableRenderMetricsPanelIntl,
  override?: NatTableRenderMetricsPanelIntl
): NatTableRenderMetricsPanelIntl => ({
  ...mergeRenderMetricsPanelText(parent, override),
  ...mergeRenderMetricsPanelFormatters(parent, override)
});

/** Merges the render-metrics column text fields, override values winning. */
const mergeRenderMetricsColumnText = (
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl
): Partial<NatTableRenderMetricsColumnIntl> => ({
  header: override?.header ?? parent?.header,
  pendingLabel: override?.pendingLabel ?? parent?.pendingLabel
});

/** Merges the render-metrics column suffix and formatters, override values winning. */
const mergeRenderMetricsColumnFormatters = (
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl
): Partial<NatTableRenderMetricsColumnIntl> => ({
  unitSuffix: override?.unitSuffix ?? parent?.unitSuffix,
  duration: override?.duration ?? parent?.duration
});

/** Merges render-metrics column labels and formatters field by field. */
export const mergeRenderMetricsColumnIntl = (
  parent?: NatTableRenderMetricsColumnIntl,
  override?: NatTableRenderMetricsColumnIntl
): NatTableRenderMetricsColumnIntl => ({
  ...mergeRenderMetricsColumnText(parent, override),
  ...mergeRenderMetricsColumnFormatters(parent, override)
});

const mergeRenderMetricsIntl = (
  parent: NatTableRenderMetricsIntl | undefined,
  override: NatTableRenderMetricsIntl | undefined
): NatTableRenderMetricsIntl => ({
  filter: mergeRenderMetricsFilterIntl(parent?.filter, override?.filter),
  panel: mergeRenderMetricsPanelIntl(parent?.panel, override?.panel),
  column: mergeRenderMetricsColumnIntl(parent?.column, override?.column)
});

/** Merges utility locale dictionaries, with override values taking precedence. */
const mergeNatTableUtilsIntl = (parent: NatTableUtilsIntl | undefined, override: NatTableUtilsIntl): NatTableUtilsIntl => ({
  renderMetrics: mergeRenderMetricsIntl(parent?.renderMetrics, override.renderMetrics),
  formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});

const mergeNatTableUtilsLocaleIntl = (
  parent?: NatTableUtilsLocaleLabels,
  override?: NatTableUtilsLocaleLabels
): NatTableUtilsLocaleLabels => mergeNatTableUtilsIntl(parent, override ?? {});

const mergeLocaleMaps = (
  parentLocales: NatTableUtilsLocaleLabelsMap,
  overrideLocales: NatTableUtilsLocaleLabelsMap
): NatTableUtilsLocaleLabelsMap => {
  const merged: NatTableUtilsLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableUtilsLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableUtilsLocaleIntl(merged[localeId], labels);
  }

  return merged;
};

const isUtilsIntlConfig = (config: NatTableUtilsIntlProviderConfig): config is NatTableUtilsIntlConfig => 'locales' in config;

const normalizeUtilsIntlProviderConfig = (config: NatTableUtilsIntlProviderConfig): NatTableUtilsIntlConfig => {
  if (isUtilsIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [NAT_TABLE_UTILS_ENGLISH_LOCALE]: config
    }
  };
};

const mergeNatTableUtilsIntlConfig = (
  parent: NatTableUtilsIntlConfig,
  override: NatTableUtilsIntlProviderConfig
): NatTableUtilsIntlConfig => {
  const overrideConfig = normalizeUtilsIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
  };
};

const isMissingInjectionContextError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { readonly code: unknown }).code === -203;

/**
 * Provides default labels and number formatting for optional utility helpers.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export const provideNatTableUtilsIntl = (intl: NatTableUtilsIntlProviderConfig): Provider[] => [
  {
    provide: NAT_TABLE_UTILS_INTL,
    deps: [[new Optional(), new SkipSelf(), NAT_TABLE_UTILS_INTL]],
    useFactory: (parent: NatTableUtilsIntlConfig | null) => mergeNatTableUtilsIntlConfig(parent ?? NAT_TABLE_UTILS_DEFAULT_INTL, intl)
  }
];

/**
 * Registers every utility locale shipped by `ng-advanced-table/locale`.
 *
 * Call this only when using `ng-advanced-table/render-metrics`.
 */
export const provideNatTableUtilsLocales = (overrides: NatTableUtilsLocaleLabelsMap = {}): Provider[] =>
  provideNatTableUtilsIntl({ locales: overrides });

/** Formats generated utility numbers through the configured locale formatter. */
export const formatNatTableUtilsNumber = (
  intl: NatTableUtilsIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);

/**
 * Reads utility locale defaults when called inside Angular injection context.
 *
 * Calls outside injection context fall back to the built-in default config.
 */
export const injectNatTableUtilsIntl = (): NatTableUtilsIntlConfig => {
  try {
    return inject(NAT_TABLE_UTILS_INTL);
  } catch (error) {
    if (!isMissingInjectionContextError(error)) {
      throw error;
    }

    return NAT_TABLE_UTILS_DEFAULT_INTL;
  }
};

/** Resolves a utility locale dictionary, falling back to built-in English defaults. */
export const resolveNatTableUtilsIntl = (intl: NatTableUtilsIntlConfig, locale: string): NatTableUtilsIntl => {
  const englishIntl = intl.locales?.[NAT_TABLE_UTILS_ENGLISH_LOCALE] ?? NAT_TABLE_UTILS_ENGLISH_INTL;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_TABLE_UTILS_ENGLISH_LOCALE ? {} : null);

  return selectedIntl ? mergeNatTableUtilsIntl(englishIntl, selectedIntl) : mergeNatTableUtilsIntl(englishIntl, {});
};
