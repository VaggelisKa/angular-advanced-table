import { InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import type { NatTableAccessibilityText } from './table.types';

/** Formats numbers used in generated table accessibility copy. */
export type NatTableNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
) => string;

/**
 * Locale-specific defaults for generated `<nat-table>` accessibility copy.
 */
export interface NatTableIntl {
  /** Default accessibility copy and announcement formatters for every table in scope. */
  accessibilityText?: NatTableAccessibilityText;
  /** Number formatter used for `...Text` fields passed to generated copy formatters. */
  formatNumber?: NatTableNumberFormatter;
}

export interface NatTableIntlConfig {
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableIntl>;
}

export type NatTableIntlProviderConfig = NatTableIntl | NatTableIntlConfig;

export const NAT_TABLE_ENGLISH_LOCALE = 'en';

const DEFAULT_NUMBER_FORMATTER: NatTableNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in English locale defaults used when no locale provider is configured. */
export const NAT_TABLE_ENGLISH_INTL: NatTableIntl = {
  accessibilityText: {
    keyboardInstructions:
      'Use arrow keys to move between cells. Use Tab to move into controls within a cell.',
    emptyState: 'No rows match the current view.',
    reorderKeyboardInstructions:
      'Press Alt+Shift+Left Arrow or Alt+Shift+Right Arrow to reorder columns within their current pinned region.',
    tableSummary: ({
      filterState,
      pageCountText,
      pageText,
      paginationState,
      totalRowsValue,
      totalRowsText,
      visibleColumnsValue,
      visibleColumnsText,
      visibleRowsValue,
      visibleRowsText,
    }) => {
      let summary =
        visibleRowsValue === 0
          ? `No rows are currently shown. ${visibleColumnsText} visible ${pluralize(
              'column',
              visibleColumnsValue,
            )}.`
          : filterState === 'filtered' && totalRowsValue !== visibleRowsValue
            ? `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize(
                'row',
                totalRowsValue,
              )} across ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`
            : `Showing ${visibleRowsText} ${pluralize(
                'row',
                visibleRowsValue,
              )} across ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;

      if (paginationState === 'enabled') {
        summary += ` Page ${pageText} of ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState }) =>
      columnLabel ? `Sorted by ${columnLabel} ${sortState}.` : 'Sorting cleared.',
    filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
      if (visibleRowsValue === 0) {
        return query ? `No rows match "${query}".` : 'No rows match the current filters.';
      }

      if (query) {
        return `Showing ${visibleRowsText} matching ${pluralize('row', visibleRowsValue)} for "${query}".`;
      }

      if (filterState === 'column') {
        return `Showing ${visibleRowsText} filtered ${pluralize('row', visibleRowsValue)}.`;
      }

      return `Showing all ${visibleRowsText} ${pluralize('row', visibleRowsValue)}.`;
    },
    columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `${column.label} column ${
          column.visibilityState === 'visible' ? 'shown' : 'hidden'
        }. ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      }

      return `${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Showing ${pageSizeText} ${pluralize(
        'row',
        pageSizeValue,
      )} per page. Page ${pageText} of ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize(
        'row',
        visibleRowsValue,
      )} shown.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Moved ${label} column to position ${positionText} of ${totalText} in the ${describeColumnZone(
        zone,
      )} region.`,
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_DEFAULT_INTL: NatTableIntlConfig = {
  locales: {
    [NAT_TABLE_ENGLISH_LOCALE]: NAT_TABLE_ENGLISH_INTL,
  },
};

/** Injection token backing `provideNatTableIntl(...)`. */
export const NAT_TABLE_INTL = new InjectionToken<NatTableIntlConfig>('NAT_TABLE_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_DEFAULT_INTL,
});

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
  const nextLocales: Record<string, NatTableIntl> = {
    ...(parent.locales ?? {}),
  };

  for (const [locale, localeIntl] of Object.entries(overrideConfig.locales ?? {})) {
    nextLocales[locale] = mergeNatTableLocaleIntl(nextLocales[locale], localeIntl);
  }

  return {
    locales: nextLocales,
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

function mergeNatTableLocaleIntl(parent?: NatTableIntl, override?: NatTableIntl): NatTableIntl {
  return {
    accessibilityText: mergeNatTableAccessibilityText(
      parent?.accessibilityText,
      override?.accessibilityText,
    ),
    formatNumber: override?.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

function pluralize(label: string, count: number): string {
  return count === 1 ? label : `${label}s`;
}

function describeColumnZone(zone: 'left' | 'center' | 'right'): string {
  if (zone === 'left') {
    return 'left pinned';
  }

  if (zone === 'right') {
    return 'right pinned';
  }

  return 'unpinned';
}
