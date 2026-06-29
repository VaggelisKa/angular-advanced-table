import type { NatTableControlsNumberFormatter } from 'ng-advanced-table/locale';

export const formatNatTableAccessibilityNumber = (
  value: number,
  formatter?: NatTableControlsNumberFormatter,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string =>
  (
    formatter ??
    ((numberValue, numberOptions, numberLocale): string => new Intl.NumberFormat(numberLocale, numberOptions).format(numberValue))
  )(value, options, locale);
