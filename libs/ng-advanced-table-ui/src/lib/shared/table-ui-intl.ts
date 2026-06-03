import { InjectionToken, Optional, SkipSelf, type Provider, type Signal } from '@angular/core';

import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityScrollControlLabels,
} from './table-ui.types';

/** Formats numbers used in generated companion-control labels. */
export type NatTableUiNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
) => string;

export interface NatTableSearchIntl {
  /** Visible label for the global search field. */
  label?: string;
  /** Placeholder for the global search field. */
  placeholder?: string;
}

export interface NatTableColumnVisibilityIntl {
  /** Visible heading above the column visibility chips. */
  label?: string;
  /** Group label for the column visibility chip set. */
  ariaLabel?: string;
  /** Generated labels and summaries for the column visibility control. */
  accessibilityLabels?: NatTableAccessibilityColumnVisibilityLabels;
}

export interface NatTablePageSizeIntl {
  /** Group label for the page-size chip set. */
  ariaLabel?: string;
  /** Generated labels for page-size options. */
  accessibilityLabels?: NatTableAccessibilityPageSizeLabels;
}

export interface NatTablePagerIntl {
  /** Group label for pager controls. */
  ariaLabel?: string;
  /** Generated pager button and indicator labels. */
  accessibilityLabels?: NatTableAccessibilityPagerLabels;
}

export interface NatTableScrollControlIntl {
  /** Group label for horizontal scroll controls. */
  ariaLabel?: string;
  /** Generated scroll button, slider, and position labels. */
  accessibilityLabels?: NatTableAccessibilityScrollControlLabels;
}

export interface NatTableHeaderActionsIntl {
  /** Generated sort, menu, and pin labels for header action controls. */
  accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
}

/** Locale-specific defaults for generated `ng-advanced-table-ui` copy. */
export interface NatTableUiIntl {
  search?: NatTableSearchIntl;
  columnVisibility?: NatTableColumnVisibilityIntl;
  pageSize?: NatTablePageSizeIntl;
  pager?: NatTablePagerIntl;
  scrollControl?: NatTableScrollControlIntl;
  headerActions?: NatTableHeaderActionsIntl;
  /** Number formatter used for `...Text` fields passed to generated label formatters. */
  formatNumber?: NatTableUiNumberFormatter;
}

export interface NatTableUiIntlConfig {
  /** Locale used when a companion control cannot inherit one from `<nat-table>`. */
  defaultLocale?: string | Signal<string>;
  /** Locale dictionaries keyed by locale id. */
  locales?: Record<string, NatTableUiIntl>;
}

export type NatTableUiIntlProviderConfig = NatTableUiIntl | NatTableUiIntlConfig;

const NAT_TABLE_UI_ENGLISH_LOCALE = 'en';

const DEFAULT_NUMBER_FORMATTER: NatTableUiNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in English locale defaults used when no provider is configured. */
export const NAT_TABLE_UI_ENGLISH_INTL: NatTableUiIntl = {
  search: {
    label: 'Search rows',
    placeholder: 'Search rows',
  },
  columnVisibility: {
    label: 'Columns',
    ariaLabel: 'Column visibility',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} visible`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction }) =>
        `${toggleAction === 'hide' ? 'Hide' : 'Show'} ${columnLabel} column`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Shown' : 'Hidden'),
    },
  },
  pageSize: {
    ariaLabel: 'Rows per page',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} / page`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `Show ${pageSizeText} rows per page`,
    },
  },
  pager: {
    ariaLabel: 'Table pagination',
    accessibilityLabels: {
      previousPageAriaLabel: 'Previous page',
      nextPageAriaLabel: 'Next page',
      pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} / ${pageCountText}`,
    },
  },
  scrollControl: {
    ariaLabel: 'Table horizontal scroll',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Scroll table left',
      scrollRightAriaLabel: 'Scroll table right',
      scrollPositionAriaLabel: 'Horizontal scroll position',
      scrollPositionText: ({ percentageText }) => `${percentageText}% scrolled`,
    },
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label }) => `Change sorting for ${label}`,
      menuButton: ({ label }) => `Open column actions for ${label}`,
      menuLabel: ({ label }) => `Column pinning options for ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) =>
        `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${label} column ${
          toggleAction === 'unpin' ? 'from' : 'to'
        } the ${pinSide}`,
      pinButtonText: ({ pinSide }) => (pinSide === 'left' ? 'Pin left' : 'Pin right'),
    },
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_UI_DEFAULT_INTL: NatTableUiIntlConfig = {
  defaultLocale: NAT_TABLE_UI_ENGLISH_LOCALE,
  locales: {
    [NAT_TABLE_UI_ENGLISH_LOCALE]: NAT_TABLE_UI_ENGLISH_INTL,
  },
};

/** Injection token backing `provideNatTableUiIntl(...)`. */
export const NAT_TABLE_UI_INTL = new InjectionToken<NatTableUiIntlConfig>('NAT_TABLE_UI_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_UI_DEFAULT_INTL,
});

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
    formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

export function formatNatTableUiNumber(
  intl: NatTableUiIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
}

export function readNatTableUiDefaultLocale(intl: NatTableUiIntlConfig): string {
  const defaultLocale = intl.defaultLocale;

  if (typeof defaultLocale === 'function') {
    return defaultLocale();
  }

  return defaultLocale ?? NAT_TABLE_UI_ENGLISH_LOCALE;
}

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
  const parentDefaultLocale = readNatTableUiDefaultLocale(parent);
  const overrideConfig = normalizeUiIntlProviderConfig(override, parentDefaultLocale);
  const nextDefaultLocale = overrideConfig.defaultLocale ?? parent.defaultLocale;
  const nextLocales: Record<string, NatTableUiIntl> = {
    ...(parent.locales ?? {}),
  };

  for (const [locale, localeIntl] of Object.entries(overrideConfig.locales ?? {})) {
    nextLocales[locale] = mergeNatTableUiIntl(nextLocales[locale], localeIntl);
  }

  return {
    defaultLocale: nextDefaultLocale ?? NAT_TABLE_UI_ENGLISH_LOCALE,
    locales: nextLocales,
  };
}

function normalizeUiIntlProviderConfig(
  config: NatTableUiIntlProviderConfig,
  defaultLocale: string,
): NatTableUiIntlConfig {
  if (isUiIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [defaultLocale]: config,
    },
  };
}

function isUiIntlConfig(config: NatTableUiIntlProviderConfig): config is NatTableUiIntlConfig {
  return 'defaultLocale' in config || 'locales' in config;
}

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

function mergeDefined<T extends object>(parent?: T, override?: T): T | undefined {
  if (!parent && !override) {
    return undefined;
  }

  const result: Record<string, unknown> = { ...(parent as Record<string, unknown> | undefined) };

  if (override) {
    for (const [key, value] of Object.entries(override)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result as T;
}
