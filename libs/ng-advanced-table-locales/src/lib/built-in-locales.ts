import { NAT_EN_LOCALE_ID, NAT_EN_LOCALE_LABELS } from './en';
import type { NatTableLocaleLabelsMap } from './types';

/**
 * Locale registry shipped by `ng-advanced-table-locales`.
 *
 * Importing `provideNatTableLocales()` registers every locale in this object.
 */
export const NAT_TABLE_BUILT_IN_LOCALES: NatTableLocaleLabelsMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_LOCALE_LABELS,
};
