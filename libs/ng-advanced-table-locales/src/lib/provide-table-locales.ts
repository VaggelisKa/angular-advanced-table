import { InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_LOCALES } from './built-in-locales';
import {
  NAT_TABLE_ENGLISH_INTL,
  NAT_TABLE_ENGLISH_LOCALE,
} from './en';
import type {
  NatTableAccessibilityText,
  NatTableIntl,
  NatTableIntlConfig,
  NatTableIntlProviderConfig,
  NatTableLocaleLabels,
  NatTableLocaleLabelsMap,
  NatTableNumberFormatter,
} from './types';

const DEFAULT_NUMBER_FORMATTER: NatTableNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_DEFAULT_INTL: NatTableIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_LOCALES,
};

/** Injection token backing `provideNatTableLocales(...)`. */
export const NAT_TABLE_INTL = new InjectionToken<NatTableIntlConfig>('NAT_TABLE_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_DEFAULT_INTL,
});

/**
 * Registers every table locale shipped by `ng-advanced-table-locales`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated table labels. Instance-specific copy such as table names,
 * captions, descriptions, and column labels should stay on component inputs or
 * column definitions.
 */
export function provideNatTableLocales(overrides: NatTableLocaleLabelsMap = {}): Provider[] {
  return provideNatTableIntl({ locales: overrides });
}

/**
 * Provides default table labels, announcement formatters, and number formatting.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export function provideNatTableIntl(intl: NatTableIntlProviderConfig): Provider[] {
  return [
    {
      provide: NAT_TABLE_INTL,
      deps: [[new Optional(), new SkipSelf(), NAT_TABLE_INTL]],
      useFactory: (parent: NatTableIntlConfig | null) =>
        mergeNatTableIntlConfig(parent ?? NAT_TABLE_DEFAULT_INTL, intl),
    },
  ];
}

export function mergeNatTableIntl(parent: NatTableIntl, override: NatTableIntl): NatTableIntl {
  return {
    accessibilityText: mergeNatTableAccessibilityText(
      parent.accessibilityText,
      override.accessibilityText,
    ),
    formatNumber: override.formatNumber ?? parent.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

export function mergeNatTableAccessibilityText(
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText,
): NatTableAccessibilityText {
  return {
    description: override?.description ?? parent?.description,
    keyboardInstructions: override?.keyboardInstructions ?? parent?.keyboardInstructions,
    emptyState: override?.emptyState ?? parent?.emptyState,
    reorderKeyboardInstructions:
      override?.reorderKeyboardInstructions ?? parent?.reorderKeyboardInstructions,
    tableSummary: override?.tableSummary ?? parent?.tableSummary,
    sortingChange: override?.sortingChange ?? parent?.sortingChange,
    filteringChange: override?.filteringChange ?? parent?.filteringChange,
    columnVisibilityChange: override?.columnVisibilityChange ?? parent?.columnVisibilityChange,
    pageSizeChange: override?.pageSizeChange ?? parent?.pageSizeChange,
    pageChange: override?.pageChange ?? parent?.pageChange,
    columnReorder: override?.columnReorder ?? parent?.columnReorder,
  };
}

export function formatNatTableIntlNumber(
  intl: NatTableIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
}

export function resolveNatTableIntl(intl: NatTableIntlConfig, locale: string): NatTableIntl {
  const englishIntl = intl.locales?.[NAT_TABLE_ENGLISH_LOCALE] ?? NAT_TABLE_ENGLISH_INTL;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_TABLE_ENGLISH_LOCALE ? {} : null);

  return selectedIntl
    ? mergeNatTableLocaleIntl(englishIntl, selectedIntl)
    : mergeNatTableLocaleIntl(englishIntl, {});
}

function mergeNatTableIntlConfig(
  parent: NatTableIntlConfig,
  override: NatTableIntlProviderConfig,
): NatTableIntlConfig {
  const overrideConfig = normalizeIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {}),
  };
}

function normalizeIntlProviderConfig(config: NatTableIntlProviderConfig): NatTableIntlConfig {
  if (isIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [NAT_TABLE_ENGLISH_LOCALE]: config,
    },
  };
}

function isIntlConfig(config: NatTableIntlProviderConfig): config is NatTableIntlConfig {
  return 'locales' in config;
}

function mergeLocaleMaps(
  parentLocales: NatTableLocaleLabelsMap,
  overrideLocales: NatTableLocaleLabelsMap,
): NatTableLocaleLabelsMap {
  const merged: NatTableLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableLocaleIntl(merged[localeId], labels);
  }

  return merged;
}

function mergeNatTableLocaleIntl(
  parent?: NatTableLocaleLabels,
  override?: NatTableLocaleLabels,
): NatTableLocaleLabels {
  return {
    accessibilityText: mergeNatTableAccessibilityText(
      parent?.accessibilityText,
      override?.accessibilityText,
    ),
    formatNumber: override?.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}
