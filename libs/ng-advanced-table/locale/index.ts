export { NAT_TABLE_BUILT_IN_LOCALES } from './common/built-in-locales.const';

export { NAT_EN_LOCALE_ID, NAT_EN_LOCALE_LABELS, NAT_TABLE_ENGLISH_INTL, NAT_TABLE_ENGLISH_LOCALE } from './common/en.const';

export {
  formatNatTableIntlNumber,
  mergeNatTableAccessibilityText,
  NAT_TABLE_INTL,
  provideNatTableIntl,
  provideNatTableLocales,
  resolveNatTableIntl
} from './utils/provide-table-locales';

export type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySummaryContext,
  NatTableAccessibilityText,
  NatTableIntl,
  NatTableIntlConfig,
  NatTableIntlProviderConfig,
  NatTableLocaleLabels,
  NatTableLocaleLabelsMap,
  NatTableNumberFormatter
} from './common/type';

export * from './ui-locale';

export * from './utils-locale';
