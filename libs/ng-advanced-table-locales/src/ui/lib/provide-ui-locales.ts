/* eslint-disable max-lines */
import { InjectionToken, Optional, SkipSelf } from '@angular/core';
import type { Provider } from '@angular/core';

import { NAT_TABLE_BUILT_IN_UI_LOCALES } from './ui-built-in-locales';
import { NAT_TABLE_UI_ENGLISH_INTL, NAT_TABLE_UI_ENGLISH_LOCALE } from './ui-en';
import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityScrollControlLabels,
  NatTableAccessibilitySelectionLabels,
  NatTableColumnVisibilityIntl,
  NatTableHeaderActionsIntl,
  NatTablePageSizeIntl,
  NatTablePagerIntl,
  NatTableScrollControlIntl,
  NatTableSelectionIntl,
  NatTableUiIntl,
  NatTableUiIntlConfig,
  NatTableUiIntlProviderConfig,
  NatTableUiLocaleLabels,
  NatTableUiLocaleLabelsMap,
  NatTableUiNumberFormatter
} from './ui-types';

const DEFAULT_NUMBER_FORMATTER: NatTableUiNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in locale defaults used when no UI locale provider is configured. */
export const NAT_TABLE_UI_DEFAULT_INTL: NatTableUiIntlConfig = {
  locales: NAT_TABLE_BUILT_IN_UI_LOCALES
};

/** Injection token backing `provideNatTableUiLocales(...)`. */
export const NAT_TABLE_UI_INTL = new InjectionToken<NatTableUiIntlConfig>('NAT_TABLE_UI_INTL', {
  providedIn: 'root',
  factory: (): NatTableUiIntlConfig => NAT_TABLE_UI_DEFAULT_INTL
});

const mergeDefined = <T extends object>(parent: T | undefined, override: T | undefined): T => {
  const merged = {
    ...parent,
    ...override
  };

  return merged as T;
};

/** Merges the visible column-visibility labels, override values winning. */
const mergeColumnVisibilityText = (
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels
): Partial<NatTableAccessibilityColumnVisibilityLabels> => ({
  heading: override?.heading ?? parent?.heading,
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel
});

/** Merges the column-visibility formatter callbacks, override values winning. */
const mergeColumnVisibilityFormatters = (
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels
): Partial<NatTableAccessibilityColumnVisibilityLabels> => ({
  visibilitySummary: override?.visibilitySummary ?? parent?.visibilitySummary,
  toggleColumnAriaLabel: override?.toggleColumnAriaLabel ?? parent?.toggleColumnAriaLabel,
  columnState: override?.columnState ?? parent?.columnState
});

/** Merges column visibility labels and formatters field by field. */
export const mergeColumnVisibilityLabels = (
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels
): NatTableAccessibilityColumnVisibilityLabels => ({
  ...mergeColumnVisibilityText(parent, override),
  ...mergeColumnVisibilityFormatters(parent, override)
});

/** Merges page-size labels and formatters field by field. */
export const mergePageSizeLabels = (
  parent?: NatTableAccessibilityPageSizeLabels,
  override?: NatTableAccessibilityPageSizeLabels
): NatTableAccessibilityPageSizeLabels => ({
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  pageSizeOptionText: override?.pageSizeOptionText ?? parent?.pageSizeOptionText,
  pageSizeOptionAriaLabel: override?.pageSizeOptionAriaLabel ?? parent?.pageSizeOptionAriaLabel
});

/** Merges the pager button labels, override values winning. */
const mergePagerButtonLabels = (
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels
): Partial<NatTableAccessibilityPagerLabels> => ({
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  previousPageAriaLabel: override?.previousPageAriaLabel ?? parent?.previousPageAriaLabel
});

/** Merges the remaining pager labels and indicators, override values winning. */
const mergePagerIndicatorLabels = (
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels
): Partial<NatTableAccessibilityPagerLabels> => ({
  nextPageAriaLabel: override?.nextPageAriaLabel ?? parent?.nextPageAriaLabel,
  pageIndicator: override?.pageIndicator ?? parent?.pageIndicator
});

/** Merges pager labels and formatters field by field. */
export const mergePagerLabels = (
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels
): NatTableAccessibilityPagerLabels => ({
  ...mergePagerButtonLabels(parent, override),
  ...mergePagerIndicatorLabels(parent, override)
});

/** Merges the scroll-control button labels, override values winning. */
const mergeScrollControlButtonLabels = (
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels
): Partial<NatTableAccessibilityScrollControlLabels> => ({
  groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
  scrollLeftAriaLabel: override?.scrollLeftAriaLabel ?? parent?.scrollLeftAriaLabel,
  scrollRightAriaLabel: override?.scrollRightAriaLabel ?? parent?.scrollRightAriaLabel
});

/** Merges the scroll-position labels and formatters, override values winning. */
const mergeScrollControlPositionLabels = (
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels
): Partial<NatTableAccessibilityScrollControlLabels> => ({
  scrollPositionAriaLabel: override?.scrollPositionAriaLabel ?? parent?.scrollPositionAriaLabel,
  scrollPositionText: override?.scrollPositionText ?? parent?.scrollPositionText
});

/** Merges horizontal scroll-control labels and formatters field by field. */
export const mergeScrollControlLabels = (
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels
): NatTableAccessibilityScrollControlLabels => ({
  ...mergeScrollControlButtonLabels(parent, override),
  ...mergeScrollControlPositionLabels(parent, override)
});

/** Merges selection-column labels and formatters field by field. */
export const mergeSelectionLabels = (
  parent?: NatTableAccessibilitySelectionLabels,
  override?: NatTableAccessibilitySelectionLabels
): NatTableAccessibilitySelectionLabels => ({
  selectAllAriaLabel: override?.selectAllAriaLabel ?? parent?.selectAllAriaLabel,
  selectRowAriaLabel: override?.selectRowAriaLabel ?? parent?.selectRowAriaLabel
});

/** Merges the header sort and menu labels, override values winning. */
const mergeHeaderSortAndMenuLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): Partial<NatTableAccessibilityHeaderActionLabels> => ({
  sortButton: override?.sortButton ?? parent?.sortButton,
  menuButton: override?.menuButton ?? parent?.menuButton,
  menuLabel: override?.menuLabel ?? parent?.menuLabel
});

/** Merges the header pin labels, override values winning. */
const mergeHeaderPinLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): Partial<NatTableAccessibilityHeaderActionLabels> => ({
  pinButton: override?.pinButton ?? parent?.pinButton,
  pinButtonText: override?.pinButtonText ?? parent?.pinButtonText
});

/** Merges the header move labels, override values winning. */
const mergeHeaderMoveLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): Partial<NatTableAccessibilityHeaderActionLabels> => ({
  moveButton: override?.moveButton ?? parent?.moveButton,
  moveButtonText: override?.moveButtonText ?? parent?.moveButtonText
});

/** Merges header action labels and formatters field by field. */
export const mergeHeaderActionLabels = (
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels
): NatTableAccessibilityHeaderActionLabels => ({
  ...mergeHeaderSortAndMenuLabels(parent, override),
  ...mergeHeaderPinLabels(parent, override),
  ...mergeHeaderMoveLabels(parent, override)
});

const mergeColumnVisibilitySlice = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTableColumnVisibilityIntl => ({
  ...mergeDefined(parent?.columnVisibility, override.columnVisibility),
  accessibilityLabels: mergeColumnVisibilityLabels(
    parent?.columnVisibility?.accessibilityLabels,
    override.columnVisibility?.accessibilityLabels
  )
});

const mergePageSizeSlice = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTablePageSizeIntl => ({
  ...mergeDefined(parent?.pageSize, override.pageSize),
  accessibilityLabels: mergePageSizeLabels(parent?.pageSize?.accessibilityLabels, override.pageSize?.accessibilityLabels)
});

const mergePagerSlice = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTablePagerIntl => ({
  ...mergeDefined(parent?.pager, override.pager),
  accessibilityLabels: mergePagerLabels(parent?.pager?.accessibilityLabels, override.pager?.accessibilityLabels)
});

const mergeScrollControlSlice = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTableScrollControlIntl => ({
  ...mergeDefined(parent?.scrollControl, override.scrollControl),
  accessibilityLabels: mergeScrollControlLabels(
    parent?.scrollControl?.accessibilityLabels,
    override.scrollControl?.accessibilityLabels
  )
});

const mergeHeaderActionsSlice = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTableHeaderActionsIntl => ({
  accessibilityLabels: mergeHeaderActionLabels(parent?.headerActions?.accessibilityLabels, override.headerActions?.accessibilityLabels)
});

const mergeSelectionSlice = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTableSelectionIntl => ({
  ...mergeDefined(parent?.selection, override.selection),
  accessibilityLabels: mergeSelectionLabels(parent?.selection?.accessibilityLabels, override.selection?.accessibilityLabels)
});

/** Merges companion UI locale dictionaries, with override values taking precedence. */
export const mergeNatTableUiIntl = (parent: NatTableUiIntl | undefined, override: NatTableUiIntl): NatTableUiIntl => ({
  search: mergeDefined(parent?.search, override.search),
  columnVisibility: mergeColumnVisibilitySlice(parent, override),
  pageSize: mergePageSizeSlice(parent, override),
  pager: mergePagerSlice(parent, override),
  scrollControl: mergeScrollControlSlice(parent, override),
  headerActions: mergeHeaderActionsSlice(parent, override),
  toolbar: mergeDefined(parent?.toolbar, override.toolbar),
  selection: mergeSelectionSlice(parent, override),
  formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});

const mergeNatTableUiLocaleIntl = (parent?: NatTableUiLocaleLabels, override?: NatTableUiLocaleLabels): NatTableUiLocaleLabels =>
  mergeNatTableUiIntl(parent, override ?? {});

const mergeLocaleMaps = (
  parentLocales: NatTableUiLocaleLabelsMap,
  overrideLocales: NatTableUiLocaleLabelsMap
): NatTableUiLocaleLabelsMap => {
  const merged: NatTableUiLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableUiLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableUiLocaleIntl(merged[localeId], labels);
  }

  return merged;
};

const isUiIntlConfig = (config: NatTableUiIntlProviderConfig): config is NatTableUiIntlConfig => 'locales' in config;

const normalizeUiIntlProviderConfig = (config: NatTableUiIntlProviderConfig): NatTableUiIntlConfig => {
  if (isUiIntlConfig(config)) {
    return config;
  }

  return {
    locales: {
      [NAT_TABLE_UI_ENGLISH_LOCALE]: config
    }
  };
};

const mergeNatTableUiIntlConfig = (parent: NatTableUiIntlConfig, override: NatTableUiIntlProviderConfig): NatTableUiIntlConfig => {
  const overrideConfig = normalizeUiIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
  };
};

/**
 * Provides default labels and number formatting for optional table UI controls.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export const provideNatTableUiIntl = (intl: NatTableUiIntlProviderConfig): Provider[] => [
  {
    provide: NAT_TABLE_UI_INTL,
    deps: [[new Optional(), new SkipSelf(), NAT_TABLE_UI_INTL]],
    useFactory: (parent: NatTableUiIntlConfig | null) => mergeNatTableUiIntlConfig(parent ?? NAT_TABLE_UI_DEFAULT_INTL, intl)
  }
];

/**
 * Registers every companion UI locale shipped by `ng-advanced-table-locales`.
 *
 * Call this only when using `ng-advanced-table-ui`.
 */
export const provideNatTableUiLocales = (overrides: NatTableUiLocaleLabelsMap = {}): Provider[] =>
  provideNatTableUiIntl({ locales: overrides });

/** Formats generated companion UI numbers through the configured locale formatter. */
export const formatNatTableUiNumber = (
  intl: NatTableUiIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);

/** Resolves a companion UI locale dictionary, falling back to built-in English defaults. */
export const resolveNatTableUiIntl = (intl: NatTableUiIntlConfig, locale: string): NatTableUiIntl => {
  const englishIntl = intl.locales?.[NAT_TABLE_UI_ENGLISH_LOCALE] ?? NAT_TABLE_UI_ENGLISH_INTL;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_TABLE_UI_ENGLISH_LOCALE ? {} : null);

  return selectedIntl ? mergeNatTableUiIntl(englishIntl, selectedIntl) : mergeNatTableUiIntl(englishIntl, {});
};
