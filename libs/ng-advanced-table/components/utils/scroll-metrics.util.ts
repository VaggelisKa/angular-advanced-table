import type { NatTableAccessibilityScrollControlPositionContext, NatTableControlsNumberFormatter } from 'ng-advanced-table/locale';

import { formatNatTableAccessibilityNumber } from './accessibility-number.util';

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

/** Builds the horizontal scroll-position context passed to generated label formatters. */
export const buildScrollPositionContext = (
  scrollLeft: number,
  maxScrollLeft: number,
  formatNumber: NatTableControlsNumberFormatter | undefined,
  localeId: string
): NatTableAccessibilityScrollControlPositionContext => {
  const percentage = maxScrollLeft ? Math.round((scrollLeft / maxScrollLeft) * 100) : 0;

  return {
    scrollLeftValue: scrollLeft,
    scrollLeftText: formatNatTableAccessibilityNumber(scrollLeft, formatNumber, undefined, localeId),
    maxScrollLeftValue: maxScrollLeft,
    maxScrollLeftText: formatNatTableAccessibilityNumber(maxScrollLeft, formatNumber, undefined, localeId),
    percentageValue: percentage,
    percentageText: formatNatTableAccessibilityNumber(percentage, formatNumber, undefined, localeId)
  };
};
