import { NAT_TABLE_ENGLISH_INTL } from 'ng-advanced-table';
import { NAT_TABLE_UI_ENGLISH_INTL } from 'ng-advanced-table-ui';
import { NAT_TABLE_UTILS_ENGLISH_INTL } from 'ng-advanced-table-utils';

import type { NatTableLocaleLabels } from './types';

/** Locale id for the built-in English locale. */
export const NAT_EN_LOCALE_ID = 'en';

/** Built-in English labels shipped with the table packages. */
export const NAT_EN_LOCALE_LABELS: NatTableLocaleLabels = {
  accessibilityText: NAT_TABLE_ENGLISH_INTL.accessibilityText,
  search: NAT_TABLE_UI_ENGLISH_INTL.search,
  columnVisibility: NAT_TABLE_UI_ENGLISH_INTL.columnVisibility,
  pageSize: NAT_TABLE_UI_ENGLISH_INTL.pageSize,
  pager: NAT_TABLE_UI_ENGLISH_INTL.pager,
  scrollControl: NAT_TABLE_UI_ENGLISH_INTL.scrollControl,
  headerActions: NAT_TABLE_UI_ENGLISH_INTL.headerActions,
  renderMetrics: NAT_TABLE_UTILS_ENGLISH_INTL.renderMetrics,
  formatNumber: NAT_TABLE_ENGLISH_INTL.formatNumber,
};
