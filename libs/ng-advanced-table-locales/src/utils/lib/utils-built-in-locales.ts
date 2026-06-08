import { NAT_EN_LOCALE_ID, NAT_EN_UTILS_LOCALE_LABELS } from './utils-en';
import type { NatTableUtilsLocaleLabelsMap } from './utils-types';

/**
 * Utility locale registry shipped by `ng-advanced-table-locales`.
 *
 * Importing `provideNatTableUtilsLocales()` registers every locale in this object.
 */
export const NAT_TABLE_BUILT_IN_UTILS_LOCALES: NatTableUtilsLocaleLabelsMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_UTILS_LOCALE_LABELS,
};
