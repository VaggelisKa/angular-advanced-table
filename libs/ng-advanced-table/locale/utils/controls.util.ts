import {
  mergeColumnVisibilityLabels,
  mergeHeaderActionLabels,
  mergePageSizeLabels,
  mergePagerLabels,
  mergeScrollControlLabels,
  mergeSelectionLabels
} from './controls-labels.util';
import { NAT_EN_CONTROLS_LOCALE_LABELS } from '../common/controls.const';
import type {
  NatTableColumnVisibilityIntl,
  NatTableControlsIntl,
  NatTableControlsIntlConfig,
  NatTableControlsIntlProviderConfig,
  NatTableControlsLocalesMap,
  NatTableHeaderActionsIntl,
  NatTablePageSizeIntl,
  NatTablePagerIntl,
  NatTableScrollControlIntl,
  NatTableSelectionIntl
} from '../common/controls.type';
import { DEFAULT_NUMBER_FORMATTER } from '../common/locale-formatter.const';
import { NAT_EN_LOCALE_ID } from '../common/locale-id.const';

const mergeDefined = <T extends object>(parent: T | undefined, override: T | undefined): T => {
  const merged = {
    ...parent,
    ...override
  };

  return merged as T;
};

const mergeColumnVisibilitySlice = (
  parent: NatTableControlsIntl | undefined,
  override: NatTableControlsIntl
): NatTableColumnVisibilityIntl => ({
  ...mergeDefined(parent?.columnVisibility, override.columnVisibility),
  accessibilityLabels: mergeColumnVisibilityLabels(
    parent?.columnVisibility?.accessibilityLabels,
    override.columnVisibility?.accessibilityLabels
  )
});

const mergePageSizeSlice = (parent: NatTableControlsIntl | undefined, override: NatTableControlsIntl): NatTablePageSizeIntl => ({
  ...mergeDefined(parent?.pageSize, override.pageSize),
  accessibilityLabels: mergePageSizeLabels(parent?.pageSize?.accessibilityLabels, override.pageSize?.accessibilityLabels)
});

const mergePagerSlice = (parent: NatTableControlsIntl | undefined, override: NatTableControlsIntl): NatTablePagerIntl => ({
  ...mergeDefined(parent?.pager, override.pager),
  accessibilityLabels: mergePagerLabels(parent?.pager?.accessibilityLabels, override.pager?.accessibilityLabels)
});

const mergeScrollControlSlice = (
  parent: NatTableControlsIntl | undefined,
  override: NatTableControlsIntl
): NatTableScrollControlIntl => ({
  ...mergeDefined(parent?.scrollControl, override.scrollControl),
  accessibilityLabels: mergeScrollControlLabels(
    parent?.scrollControl?.accessibilityLabels,
    override.scrollControl?.accessibilityLabels
  )
});

const mergeHeaderActionsSlice = (
  parent: NatTableControlsIntl | undefined,
  override: NatTableControlsIntl
): NatTableHeaderActionsIntl => ({
  accessibilityLabels: mergeHeaderActionLabels(parent?.headerActions?.accessibilityLabels, override.headerActions?.accessibilityLabels)
});

const mergeSelectionSlice = (parent: NatTableControlsIntl | undefined, override: NatTableControlsIntl): NatTableSelectionIntl => ({
  ...mergeDefined(parent?.selection, override.selection),
  accessibilityLabels: mergeSelectionLabels(parent?.selection?.accessibilityLabels, override.selection?.accessibilityLabels)
});

/** Merges companion components locale dictionaries, with override values taking precedence. */
const mergeNatTableControlsIntl = (
  parent: NatTableControlsIntl | undefined,
  override: NatTableControlsIntl
): NatTableControlsIntl => ({
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

const mergeNatTableControlsLocaleIntl = (parent?: NatTableControlsIntl, override?: NatTableControlsIntl): NatTableControlsIntl =>
  mergeNatTableControlsIntl(parent, override ?? {});

const mergeLocaleMaps = (
  parentLocales: NatTableControlsLocalesMap,
  overrideLocales: NatTableControlsLocalesMap
): NatTableControlsLocalesMap => {
  const merged: NatTableControlsLocalesMap = {};

  for (const [localeId, labels] of Object.entries(parentLocales)) {
    merged[localeId] = mergeNatTableControlsLocaleIntl(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrideLocales)) {
    merged[localeId] = mergeNatTableControlsLocaleIntl(merged[localeId], labels);
  }

  return merged;
};

const isControlsIntlConfig = (config: NatTableControlsIntlProviderConfig): config is NatTableControlsIntlConfig => 'locales' in config;

const normalizeControlsIntlProviderConfig = (config: NatTableControlsIntlProviderConfig): NatTableControlsIntlConfig => {
  if (isControlsIntlConfig(config)) return config;

  return {
    locales: {
      [NAT_EN_LOCALE_ID]: config
    }
  };
};

/** Merges a parent components intl config with a provider override, field by field. */
export const mergeNatTableControlsIntlConfig = (
  parent: NatTableControlsIntlConfig,
  override: NatTableControlsIntlProviderConfig
): NatTableControlsIntlConfig => {
  const overrideConfig = normalizeControlsIntlProviderConfig(override);

  return {
    locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
  };
};

/** Resolves a companion components locale dictionary, falling back to built-in English defaults. */
export const resolveNatTableControlsIntl = (intl: NatTableControlsIntlConfig, locale: string): NatTableControlsIntl => {
  const englishIntl = intl.locales?.[NAT_EN_LOCALE_ID] ?? NAT_EN_CONTROLS_LOCALE_LABELS;
  const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_EN_LOCALE_ID ? {} : null);

  return selectedIntl ? mergeNatTableControlsIntl(englishIntl, selectedIntl) : mergeNatTableControlsIntl(englishIntl, {});
};
