import { NAT_EN_LOCALE_ID, NAT_EN_UI_LOCALE_LABELS } from './ui-en.const';
import type { NatTableUiLocaleLabelsMap } from './ui.type';

/**
 * Companion UI locale registry shipped by `ng-advanced-table/locale`.
 *
 * Importing `provideNatTableUiLocales()` registers every locale in this object.
 */
export const NAT_TABLE_BUILT_IN_UI_LOCALES: NatTableUiLocaleLabelsMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_UI_LOCALE_LABELS
};
