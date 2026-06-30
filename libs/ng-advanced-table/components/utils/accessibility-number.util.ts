import type { NatTableControlsNumberFormatter } from 'ng-advanced-table/locale';

const defaultNatTableNumberFormatter: NatTableControlsNumberFormatter = (numberValue, numberOptions, numberLocale): string =>
  new Intl.NumberFormat(numberLocale, numberOptions).format(numberValue);

export const formatNatTableAccessibilityNumber = (
  value: number,
  formatter?: NatTableControlsNumberFormatter,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string => {
  if (formatter) {
    return formatter(value, options, locale);
  }

  return defaultNatTableNumberFormatter(value, options, locale);
};
