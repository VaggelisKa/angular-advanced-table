import { InjectionToken, Optional, SkipSelf } from '@angular/core';
import type { Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_LOCALES } from './built-in-locales';
import { NAT_TABLE_ENGLISH_INTL, NAT_TABLE_ENGLISH_LOCALE } from './en';
import type {
  NatTableAccessibilityText,
  NatTableIntl,
  NatTableIntlConfig,
  NatTableIntlProviderConfig,
  NatTableLocaleLabels,
  NatTableLocaleLabelsMap,
  NatTableNumberFormatter
} from './types';

const DEFAULT_NUMBER_FORMATTER: NatTableNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_DEFAULT_INTL: NatTableIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_LOCALES
};

/** Injection token backing `provideNatTableLocales(...)`. */
export const NAT_TABLE_INTL = new InjectionToken<NatTableIntlConfig>('NAT_TABLE_INTL', {
  providedIn: 'root',
  factory: (): NatTableIntlConfig => NAT_TABLE_DEFAULT_INTL
});

/** Merges the description and keyboard instruction text, override values winning. */
const mergeAccessibilityInstructions = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): Partial<NatTableAccessibilityText> => ({
  description: override?.description ?? parent?.description,
  keyboardInstructions: override?.keyboardInstructions ?? parent?.keyboardInstructions
});

/** Merges the body state messages, override values winning. */
const mergeAccessibilityStateText = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): Partial<NatTableAccessibilityText> => ({
  emptyState: override?.emptyState ?? parent?.emptyState,
  loadingState: override?.loadingState ?? parent?.loadingState,
  errorState: override?.errorState ?? parent?.errorState
});

/** Merges the reorder and resize instruction text, override values winning. */
const mergeAccessibilityGestureText = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): Partial<NatTableAccessibilityText> => ({
  reorderKeyboardInstructions: override?.reorderKeyboardInstructions ?? parent?.reorderKeyboardInstructions,
  resizeKeyboardInstructions: override?.resizeKeyboardInstructions ?? parent?.resizeKeyboardInstructions
});

/** Merges the summary and sort/filter announcement formatters, override values winning. */
const mergeAccessibilitySummaryAnnouncers = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): Partial<NatTableAccessibilityText> => ({
  tableSummary: override?.tableSummary ?? parent?.tableSummary,
  sortingChange: override?.sortingChange ?? parent?.sortingChange,
  filteringChange: override?.filteringChange ?? parent?.filteringChange
});

/** Merges the visibility and pagination announcement formatters, override values winning. */
const mergeAccessibilityPaginationAnnouncers = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): Partial<NatTableAccessibilityText> => ({
  columnVisibilityChange: override?.columnVisibilityChange ?? parent?.columnVisibilityChange,
  pageSizeChange: override?.pageSizeChange ?? parent?.pageSizeChange,
  pageChange: override?.pageChange ?? parent?.pageChange
});

/** Merges the column and selection announcement formatters, override values winning. */
const mergeAccessibilityColumnAnnouncers = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): Partial<NatTableAccessibilityText> => ({
  columnReorder: override?.columnReorder ?? parent?.columnReorder,
  columnResize: override?.columnResize ?? parent?.columnResize,
  selectionChange: override?.selectionChange ?? parent?.selectionChange
});

/** Merges table accessibility copy and formatter callbacks field by field. */
export const mergeNatTableAccessibilityText = (
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText
): NatTableAccessibilityText => ({
  ...mergeAccessibilityInstructions(parent, override),
  ...mergeAccessibilityStateText(parent, override),
  ...mergeAccessibilityGestureText(parent, override),
  ...mergeAccessibilitySummaryAnnouncers(parent, override),
  ...mergeAccessibilityPaginationAnnouncers(parent, override),
  ...mergeAccessibilityColumnAnnouncers(parent, override)
});

/** Merges table locale dictionaries, with override values taking precedence. */
export const mergeNatTableIntl = (parent: NatTableIntl, override: NatTableIntl): NatTableIntl => ({
  accessibilityText: mergeNatTableAccessibilityText(parent.accessibilityText, override.accessibilityText),
  formatNumber: override.formatNumber ?? parent.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});

const mergeNatTableLocaleIntl = (parent?: NatTableLocaleLabels, override?: NatTableLocaleLabels): NatTableLocaleLabels => ({
  accessibilityText: mergeNatTableAccessibilityText(parent?.accessibilityText, override?.accessibilityText),
  formatNumber: override?.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});

const mergeLocaleMaps = (
  parentLocales: NatTableLocaleLabelsMap,
  overrideLocales: NatTableLocaleLabelsMap
): NatTableLocaleLabelsMap => {
  const merged: NatTableLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableLocaleIntl(merged[localeId], labels);
  }

  return merged;
};

const isIntlConfig = (config: NatTableIntlProviderConfig): config is NatTableIntlConfig => 'locales' in config;

const normalizeIntlProviderConfig = (config: NatTableIntlProviderConfig): NatTableIntlConfig => {
  if (isIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [NAT_TABLE_ENGLISH_LOCALE]: config
    }
  };
};

const mergeNatTableIntlConfig = (parent: NatTableIntlConfig, override: NatTableIntlProviderConfig): NatTableIntlConfig => {
  const overrideConfig = normalizeIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
  };
};

/**
 * Provides default table labels, announcement formatters, and number formatting.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export const provideNatTableIntl = (intl: NatTableIntlProviderConfig): Provider[] => [
  {
    provide: NAT_TABLE_INTL,
    deps: [[new Optional(), new SkipSelf(), NAT_TABLE_INTL]],
    useFactory: (parent: NatTableIntlConfig | null) => mergeNatTableIntlConfig(parent ?? NAT_TABLE_DEFAULT_INTL, intl)
  }
];

/**
 * Registers every table locale shipped by `ng-advanced-table-locales`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated table labels. Instance-specific copy such as table names,
 * captions, descriptions, and column labels should stay on component inputs or
 * column definitions.
 */
export const provideNatTableLocales = (overrides: NatTableLocaleLabelsMap = {}): Provider[] =>
  provideNatTableIntl({ locales: overrides });

/** Formats generated table accessibility numbers through the configured locale formatter. */
export const formatNatTableIntlNumber = (
  intl: NatTableIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);

/** Resolves a locale dictionary, falling back to built-in English defaults. */
export const resolveNatTableIntl = (intl: NatTableIntlConfig, locale: string): NatTableIntl => {
  const englishIntl = intl.locales?.[NAT_TABLE_ENGLISH_LOCALE] ?? NAT_TABLE_ENGLISH_INTL;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_TABLE_ENGLISH_LOCALE ? {} : null);

  return selectedIntl ? mergeNatTableLocaleIntl(englishIntl, selectedIntl) : mergeNatTableLocaleIntl(englishIntl, {});
};
