import { InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_UI_LOCALES } from './ui-built-in-locales';
import { NAT_TABLE_UI_ENGLISH_INTL, NAT_TABLE_UI_ENGLISH_LOCALE } from './ui-en';
import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityScrollControlLabels,
  NatTableAccessibilitySelectionLabels,
  NatTableUiIntl,
  NatTableUiIntlConfig,
  NatTableUiIntlProviderConfig,
  NatTableUiLocaleLabels,
  NatTableUiLocaleLabelsMap,
  NatTableUiNumberFormatter,
} from './ui-types';

const DEFAULT_NUMBER_FORMATTER: NatTableUiNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in locale defaults used when no UI locale provider is configured. */
export const NAT_TABLE_UI_DEFAULT_INTL: NatTableUiIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_UI_LOCALES,
};

/** Injection token backing `provideNatTableUiLocales(...)`. */
export const NAT_TABLE_UI_INTL = new InjectionToken<NatTableUiIntlConfig>('NAT_TABLE_UI_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_UI_DEFAULT_INTL,
});

/**
 * Registers every companion UI locale shipped by `ng-advanced-table-locales`.
 *
 * Call this only when using `ng-advanced-table-ui`.
 */
export function provideNatTableUiLocales(overrides: NatTableUiLocaleLabelsMap = {}): Provider[] {
  return provideNatTableUiIntl({ locales: overrides });
}

/**
 * Provides default labels and number formatting for optional table UI controls.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export function provideNatTableUiIntl(intl: NatTableUiIntlProviderConfig): Provider[] {
  return [
    {
      provide: NAT_TABLE_UI_INTL,
      deps: [[new Optional(), new SkipSelf(), NAT_TABLE_UI_INTL]],
      useFactory: (parent: NatTableUiIntlConfig | null) =>
        mergeNatTableUiIntlConfig(parent ?? NAT_TABLE_UI_DEFAULT_INTL, intl),
    },
  ];
}

/** Merges companion UI locale dictionaries, with override values taking precedence. */
export function mergeNatTableUiIntl(
  parent: NatTableUiIntl | undefined,
  override: NatTableUiIntl,
): NatTableUiIntl {
  return {
    search: mergeDefined(parent?.search, override.search),
    columnVisibility: {
      ...mergeDefined(parent?.columnVisibility, override.columnVisibility),
      accessibilityLabels: mergeColumnVisibilityLabels(
        parent?.columnVisibility?.accessibilityLabels,
        override.columnVisibility?.accessibilityLabels,
      ),
    },
    pageSize: {
      ...mergeDefined(parent?.pageSize, override.pageSize),
      accessibilityLabels: mergePageSizeLabels(
        parent?.pageSize?.accessibilityLabels,
        override.pageSize?.accessibilityLabels,
      ),
    },
    pager: {
      ...mergeDefined(parent?.pager, override.pager),
      accessibilityLabels: mergePagerLabels(
        parent?.pager?.accessibilityLabels,
        override.pager?.accessibilityLabels,
      ),
    },
    scrollControl: {
      ...mergeDefined(parent?.scrollControl, override.scrollControl),
      accessibilityLabels: mergeScrollControlLabels(
        parent?.scrollControl?.accessibilityLabels,
        override.scrollControl?.accessibilityLabels,
      ),
    },
    headerActions: {
      accessibilityLabels: mergeHeaderActionLabels(
        parent?.headerActions?.accessibilityLabels,
        override.headerActions?.accessibilityLabels,
      ),
    },
    toolbar: mergeDefined(parent?.toolbar, override.toolbar),
    selection: {
      ...mergeDefined(parent?.selection, override.selection),
      accessibilityLabels: mergeSelectionLabels(
        parent?.selection?.accessibilityLabels,
        override.selection?.accessibilityLabels,
      ),
    },
    formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

/** Formats generated companion UI numbers through the configured locale formatter. */
export function formatNatTableUiNumber(
  intl: NatTableUiIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
}

/** Resolves a companion UI locale dictionary, falling back to built-in English defaults. */
export function resolveNatTableUiIntl(intl: NatTableUiIntlConfig, locale: string): NatTableUiIntl {
  const englishIntl = intl.locales?.[NAT_TABLE_UI_ENGLISH_LOCALE] ?? NAT_TABLE_UI_ENGLISH_INTL;
  const selectedIntl =
    intl.locales?.[locale] ?? (locale === NAT_TABLE_UI_ENGLISH_LOCALE ? {} : null);

  return selectedIntl
    ? mergeNatTableUiIntl(englishIntl, selectedIntl)
    : mergeNatTableUiIntl(englishIntl, {});
}

function mergeNatTableUiIntlConfig(
  parent: NatTableUiIntlConfig,
  override: NatTableUiIntlProviderConfig,
): NatTableUiIntlConfig {
  const overrideConfig = normalizeUiIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {}),
  };
}

function normalizeUiIntlProviderConfig(config: NatTableUiIntlProviderConfig): NatTableUiIntlConfig {
  if (isUiIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [NAT_TABLE_UI_ENGLISH_LOCALE]: config,
    },
  };
}

function isUiIntlConfig(config: NatTableUiIntlProviderConfig): config is NatTableUiIntlConfig {
  return 'locales' in config;
}

function mergeLocaleMaps(
  parentLocales: NatTableUiLocaleLabelsMap,
  overrideLocales: NatTableUiLocaleLabelsMap,
): NatTableUiLocaleLabelsMap {
  const merged: NatTableUiLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableUiLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableUiLocaleIntl(merged[localeId], labels);
  }

  return merged;
}

function mergeNatTableUiLocaleIntl(
  parent?: NatTableUiLocaleLabels,
  override?: NatTableUiLocaleLabels,
): NatTableUiLocaleLabels {
  return mergeNatTableUiIntl(parent, override ?? {});
}

/** Merges column visibility labels and formatters field by field. */
export function mergeColumnVisibilityLabels(
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels,
): NatTableAccessibilityColumnVisibilityLabels {
  return {
    heading: override?.heading ?? parent?.heading,
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    visibilitySummary: override?.visibilitySummary ?? parent?.visibilitySummary,
    toggleColumnAriaLabel: override?.toggleColumnAriaLabel ?? parent?.toggleColumnAriaLabel,
    columnState: override?.columnState ?? parent?.columnState,
  };
}

/** Merges page-size labels and formatters field by field. */
export function mergePageSizeLabels(
  parent?: NatTableAccessibilityPageSizeLabels,
  override?: NatTableAccessibilityPageSizeLabels,
): NatTableAccessibilityPageSizeLabels {
  return {
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    pageSizeOptionText: override?.pageSizeOptionText ?? parent?.pageSizeOptionText,
    pageSizeOptionAriaLabel: override?.pageSizeOptionAriaLabel ?? parent?.pageSizeOptionAriaLabel,
  };
}

/** Merges pager labels and formatters field by field. */
export function mergePagerLabels(
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels,
): NatTableAccessibilityPagerLabels {
  return {
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    previousPageAriaLabel: override?.previousPageAriaLabel ?? parent?.previousPageAriaLabel,
    nextPageAriaLabel: override?.nextPageAriaLabel ?? parent?.nextPageAriaLabel,
    pageIndicator: override?.pageIndicator ?? parent?.pageIndicator,
  };
}

/** Merges horizontal scroll-control labels and formatters field by field. */
export function mergeScrollControlLabels(
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels,
): NatTableAccessibilityScrollControlLabels {
  return {
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    scrollLeftAriaLabel: override?.scrollLeftAriaLabel ?? parent?.scrollLeftAriaLabel,
    scrollRightAriaLabel: override?.scrollRightAriaLabel ?? parent?.scrollRightAriaLabel,
    scrollPositionAriaLabel: override?.scrollPositionAriaLabel ?? parent?.scrollPositionAriaLabel,
    scrollPositionText: override?.scrollPositionText ?? parent?.scrollPositionText,
  };
}

/** Merges selection-column labels and formatters field by field. */
export function mergeSelectionLabels(
  parent?: NatTableAccessibilitySelectionLabels,
  override?: NatTableAccessibilitySelectionLabels,
): NatTableAccessibilitySelectionLabels {
  return {
    selectAllAriaLabel: override?.selectAllAriaLabel ?? parent?.selectAllAriaLabel,
    selectRowAriaLabel: override?.selectRowAriaLabel ?? parent?.selectRowAriaLabel,
  };
}

/** Merges header action labels and formatters field by field. */
export function mergeHeaderActionLabels(
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels,
): NatTableAccessibilityHeaderActionLabels {
  return {
    sortButton: override?.sortButton ?? parent?.sortButton,
    menuButton: override?.menuButton ?? parent?.menuButton,
    menuLabel: override?.menuLabel ?? parent?.menuLabel,
    pinButton: override?.pinButton ?? parent?.pinButton,
    pinButtonText: override?.pinButtonText ?? parent?.pinButtonText,
  };
}

function mergeDefined<T extends object>(parent: T | undefined, override: T | undefined): T {
  return {
    ...(parent ?? {}),
    ...(override ?? {}),
  } as T;
}
