import { inject, InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_UTILS_LOCALES } from './utils-built-in-locales';
import {
  NAT_TABLE_UTILS_ENGLISH_INTL,
  NAT_TABLE_UTILS_ENGLISH_LOCALE,
} from './utils-en';
import type {
  NatTableRenderMetricsColumnIntl,
  NatTableRenderMetricsFilterIntl,
  NatTableRenderMetricsPanelIntl,
  NatTableUtilsIntl,
  NatTableUtilsIntlConfig,
  NatTableUtilsIntlProviderConfig,
  NatTableUtilsLocaleLabels,
  NatTableUtilsLocaleLabelsMap,
  NatTableUtilsNumberFormatter,
} from './utils-types';

const DEFAULT_NUMBER_FORMATTER: NatTableUtilsNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in locale defaults used when no utils locale provider is configured. */
export const NAT_TABLE_UTILS_DEFAULT_INTL: NatTableUtilsIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_UTILS_LOCALES,
};

/** Injection token backing `provideNatTableUtilsLocales(...)`. */
export const NAT_TABLE_UTILS_INTL = new InjectionToken<NatTableUtilsIntlConfig>(
  'NAT_TABLE_UTILS_INTL',
  {
    providedIn: 'root',
    factory: () => NAT_TABLE_UTILS_DEFAULT_INTL,
  },
);

/**
 * Registers every utility locale shipped by `ng-advanced-table-locales`.
 *
 * Call this only when using `ng-advanced-table-utils`.
 */
export function provideNatTableUtilsLocales(
  overrides: NatTableUtilsLocaleLabelsMap = {},
): Provider[] {
  return provideNatTableUtilsIntl({ locales: overrides });
}

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

/** Merges utility locale dictionaries, with override values taking precedence. */
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

/** Merges render-metrics filter labels and options field by field. */
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

/** Merges render-metrics panel labels and formatters field by field. */
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

/** Merges render-metrics column labels and formatters field by field. */
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

/** Formats generated utility numbers through the configured locale formatter. */
export function formatNatTableUtilsNumber(
  intl: NatTableUtilsIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
}

/**
 * Reads utility locale defaults when called inside Angular injection context.
 *
 * Calls outside injection context fall back to the built-in default config.
 */
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

/** Resolves a utility locale dictionary, falling back to built-in English defaults. */
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

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {}),
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

function mergeLocaleMaps(
  parentLocales: NatTableUtilsLocaleLabelsMap,
  overrideLocales: NatTableUtilsLocaleLabelsMap,
): NatTableUtilsLocaleLabelsMap {
  const merged: NatTableUtilsLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableUtilsLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableUtilsLocaleIntl(merged[localeId], labels);
  }

  return merged;
}

function mergeNatTableUtilsLocaleIntl(
  parent?: NatTableUtilsLocaleLabels,
  override?: NatTableUtilsLocaleLabels,
): NatTableUtilsLocaleLabels {
  return mergeNatTableUtilsIntl(parent, override ?? {});
}

function isMissingInjectionContextError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === -203
  );
}
