/** Default locale-aware number formatter shared by every locale domain. */
export const DEFAULT_NUMBER_FORMATTER = (value: number, options?: Intl.NumberFormatOptions, locale?: string): string =>
  new Intl.NumberFormat(locale, options).format(value);
