import { InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import type { NatTableAccessibilityText } from './table.types';

/** Formats numbers used in generated table accessibility copy. */
export type NatTableNumberFormatter = (value: number, options?: Intl.NumberFormatOptions) => string;

/**
 * App or feature-level defaults for generated `<nat-table>` accessibility copy.
 *
 * Component inputs still take precedence over these defaults.
 */
export interface NatTableIntl {
  /** Default accessibility copy and announcement formatters for every table in scope. */
  accessibilityText?: NatTableAccessibilityText;
  /** Number formatter used for `...Text` fields passed to generated copy formatters. */
  formatNumber?: NatTableNumberFormatter;
}

const DEFAULT_NUMBER_FORMATTER: NatTableNumberFormatter = (value, options) =>
  new Intl.NumberFormat(undefined, options).format(value);

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_DEFAULT_INTL: NatTableIntl = {
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

/** Injection token backing `provideNatTableIntl(...)`. */
export const NAT_TABLE_INTL = new InjectionToken<NatTableIntl>('NAT_TABLE_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_DEFAULT_INTL,
});

/**
 * Provides default table labels, announcement formatters, and number formatting.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export function provideNatTableIntl(intl: NatTableIntl): Provider[] {
  return [
    {
      provide: NAT_TABLE_INTL,
      deps: [[new Optional(), new SkipSelf(), NAT_TABLE_INTL]],
      useFactory: (parent: NatTableIntl | null) =>
        mergeNatTableIntl(parent ?? NAT_TABLE_DEFAULT_INTL, intl),
    },
  ];
}

export function mergeNatTableIntl(parent: NatTableIntl, override: NatTableIntl): NatTableIntl {
  return {
    accessibilityText: mergeNatTableAccessibilityText(
      parent.accessibilityText,
      override.accessibilityText,
    ),
    formatNumber: override.formatNumber ?? parent.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

export function mergeNatTableAccessibilityText(
  parent?: NatTableAccessibilityText,
  override?: NatTableAccessibilityText,
): NatTableAccessibilityText {
  return {
    description: override?.description ?? parent?.description,
    keyboardInstructions: override?.keyboardInstructions ?? parent?.keyboardInstructions,
    emptyState: override?.emptyState ?? parent?.emptyState,
    reorderKeyboardInstructions:
      override?.reorderKeyboardInstructions ?? parent?.reorderKeyboardInstructions,
    tableSummary: override?.tableSummary ?? parent?.tableSummary,
    sortingChange: override?.sortingChange ?? parent?.sortingChange,
    filteringChange: override?.filteringChange ?? parent?.filteringChange,
    columnVisibilityChange: override?.columnVisibilityChange ?? parent?.columnVisibilityChange,
    pageSizeChange: override?.pageSizeChange ?? parent?.pageSizeChange,
    pageChange: override?.pageChange ?? parent?.pageChange,
    columnReorder: override?.columnReorder ?? parent?.columnReorder,
  };
}

export function formatNatTableIntlNumber(
  intl: NatTableIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options);
}
