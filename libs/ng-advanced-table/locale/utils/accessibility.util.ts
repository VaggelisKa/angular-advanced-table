import { NAT_EN_LOCALE_LABELS } from '../common/accessibility.const';
import type {
  NatTableAccessibilityText,
  NatTableIntl,
  NatTableIntlConfig,
  NatTableIntlProviderConfig,
  NatTableLocalesMap,
  NatTableNumberFormatter
} from '../common/accessibility.type';
import { NAT_EN_LOCALE_ID } from '../common/locale-id.const';

const DEFAULT_NUMBER_FORMATTER: NatTableNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

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

const mergeNatTableIntl = (parent?: NatTableIntl, override?: NatTableIntl): NatTableIntl => ({
  accessibilityText: mergeNatTableAccessibilityText(parent?.accessibilityText, override?.accessibilityText),
  formatNumber: override?.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});

const mergeLocaleMaps = (parentLocales: NatTableLocalesMap, overrideLocales: NatTableLocalesMap): NatTableLocalesMap => {
  const merged: NatTableLocalesMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableIntl(merged[localeId], labels);
  }

  return merged;
};

const isIntlConfig = (config: NatTableIntlProviderConfig): config is NatTableIntlConfig => 'locales' in config;

const normalizeIntlProviderConfig = (config: NatTableIntlProviderConfig): NatTableIntlConfig => {
  if (isIntlConfig(config)) return config;

  return {
    locales: {
      [NAT_EN_LOCALE_ID]: config
    }
  };
};

/** Merges a parent intl config with a provider override, field by field. */
export const mergeNatTableIntlConfig = (parent: NatTableIntlConfig, override: NatTableIntlProviderConfig): NatTableIntlConfig => {
  const overrideConfig = normalizeIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
  };
};

/** Formats generated table accessibility numbers through the configured locale formatter. */
export const formatNatTableNumber = (intl: NatTableIntl, value: number, options?: Intl.NumberFormatOptions, locale?: string): string =>
  (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);

/** Resolves a locale dictionary, falling back to built-in English defaults. */
export const resolveNatTableIntl = (intl: NatTableIntlConfig, locale: string): NatTableIntl => {
  const englishIntl = intl.locales?.[NAT_EN_LOCALE_ID] ?? NAT_EN_LOCALE_LABELS;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_EN_LOCALE_ID ? {} : null);

  return selectedIntl ? mergeNatTableIntl(englishIntl, selectedIntl) : mergeNatTableIntl(englishIntl, {});
};
