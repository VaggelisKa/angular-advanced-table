import { InjectionToken, Optional, SkipSelf, type Provider } from '@angular/core';

import type {
  NatTableAccessibilityColumnVisibilityLabels,
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityPagerLabels,
  NatTableAccessibilityPageSizeLabels,
  NatTableAccessibilityScrollControlLabels,
} from './table-ui.types';

/** Formats numbers used in generated companion-control labels. */
export type NatTableUiNumberFormatter = (
  value: number,
  options?: Intl.NumberFormatOptions,
) => string;

export interface NatTableSearchIntl {
  /** Visible label for the global search field. */
  label?: string;
  /** Placeholder for the global search field. */
  placeholder?: string;
}

export interface NatTableColumnVisibilityIntl {
  /** Visible heading above the column visibility chips. */
  label?: string;
  /** Group label for the column visibility chip set. */
  ariaLabel?: string;
  /** Generated labels and summaries for the column visibility control. */
  accessibilityLabels?: NatTableAccessibilityColumnVisibilityLabels;
}

export interface NatTablePageSizeIntl {
  /** Group label for the page-size chip set. */
  ariaLabel?: string;
  /** Generated labels for page-size options. */
  accessibilityLabels?: NatTableAccessibilityPageSizeLabels;
}

export interface NatTablePagerIntl {
  /** Group label for pager controls. */
  ariaLabel?: string;
  /** Generated pager button and indicator labels. */
  accessibilityLabels?: NatTableAccessibilityPagerLabels;
}

export interface NatTableScrollControlIntl {
  /** Group label for horizontal scroll controls. */
  ariaLabel?: string;
  /** Generated scroll button, slider, and position labels. */
  accessibilityLabels?: NatTableAccessibilityScrollControlLabels;
}

export interface NatTableHeaderActionsIntl {
  /** Generated sort, menu, and pin labels for header action controls. */
  accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
}

/**
 * App or feature-level defaults for generated `ng-advanced-table-ui` copy.
 *
 * Component inputs and helper options still take precedence over these defaults.
 */
export interface NatTableUiIntl {
  search?: NatTableSearchIntl;
  columnVisibility?: NatTableColumnVisibilityIntl;
  pageSize?: NatTablePageSizeIntl;
  pager?: NatTablePagerIntl;
  scrollControl?: NatTableScrollControlIntl;
  headerActions?: NatTableHeaderActionsIntl;
  /** Number formatter used for `...Text` fields passed to generated label formatters. */
  formatNumber?: NatTableUiNumberFormatter;
}

const DEFAULT_NUMBER_FORMATTER: NatTableUiNumberFormatter = (value, options) =>
  new Intl.NumberFormat(undefined, options).format(value);

/** Built-in locale defaults used when no provider is configured. */
export const NAT_TABLE_UI_DEFAULT_INTL: NatTableUiIntl = {
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

/** Injection token backing `provideNatTableUiIntl(...)`. */
export const NAT_TABLE_UI_INTL = new InjectionToken<NatTableUiIntl>('NAT_TABLE_UI_INTL', {
  providedIn: 'root',
  factory: () => NAT_TABLE_UI_DEFAULT_INTL,
});

/**
 * Provides default labels and number formatting for optional table UI controls.
 *
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag.
 */
export function provideNatTableUiIntl(intl: NatTableUiIntl): Provider[] {
  return [
    {
      provide: NAT_TABLE_UI_INTL,
      deps: [[new Optional(), new SkipSelf(), NAT_TABLE_UI_INTL]],
      useFactory: (parent: NatTableUiIntl | null) =>
        mergeNatTableUiIntl(parent ?? NAT_TABLE_UI_DEFAULT_INTL, intl),
    },
  ];
}

export function mergeNatTableUiIntl(
  parent: NatTableUiIntl,
  override: NatTableUiIntl,
): NatTableUiIntl {
  return {
    search: mergeDefined(parent.search, override.search),
    columnVisibility: {
      ...mergeDefined(parent.columnVisibility, override.columnVisibility),
      accessibilityLabels: mergeColumnVisibilityLabels(
        parent.columnVisibility?.accessibilityLabels,
        override.columnVisibility?.accessibilityLabels,
      ),
    },
    pageSize: {
      ...mergeDefined(parent.pageSize, override.pageSize),
      accessibilityLabels: mergePageSizeLabels(
        parent.pageSize?.accessibilityLabels,
        override.pageSize?.accessibilityLabels,
      ),
    },
    pager: {
      ...mergeDefined(parent.pager, override.pager),
      accessibilityLabels: mergePagerLabels(
        parent.pager?.accessibilityLabels,
        override.pager?.accessibilityLabels,
      ),
    },
    scrollControl: {
      ...mergeDefined(parent.scrollControl, override.scrollControl),
      accessibilityLabels: mergeScrollControlLabels(
        parent.scrollControl?.accessibilityLabels,
        override.scrollControl?.accessibilityLabels,
      ),
    },
    headerActions: {
      accessibilityLabels: mergeHeaderActionLabels(
        parent.headerActions?.accessibilityLabels,
        override.headerActions?.accessibilityLabels,
      ),
    },
    formatNumber: override.formatNumber ?? parent.formatNumber ?? DEFAULT_NUMBER_FORMATTER,
  };
}

export function formatNatTableUiNumber(
  intl: NatTableUiIntl,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options);
}

export function mergeColumnVisibilityLabels(
  parent?: NatTableAccessibilityColumnVisibilityLabels,
  override?: NatTableAccessibilityColumnVisibilityLabels,
): NatTableAccessibilityColumnVisibilityLabels {
  return {
    heading: override?.heading ?? parent?.heading,
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    visibilitySummary: override?.visibilitySummary ?? parent?.visibilitySummary,
    toggleColumnAriaLabel: override?.toggleColumnAriaLabel ?? parent?.toggleColumnAriaLabel,
    columnState: override?.columnState ?? parent?.columnState,
  };
}

export function mergePageSizeLabels(
  parent?: NatTableAccessibilityPageSizeLabels,
  override?: NatTableAccessibilityPageSizeLabels,
): NatTableAccessibilityPageSizeLabels {
  return {
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    pageSizeOptionText: override?.pageSizeOptionText ?? parent?.pageSizeOptionText,
    pageSizeOptionAriaLabel: override?.pageSizeOptionAriaLabel ?? parent?.pageSizeOptionAriaLabel,
  };
}

export function mergePagerLabels(
  parent?: NatTableAccessibilityPagerLabels,
  override?: NatTableAccessibilityPagerLabels,
): NatTableAccessibilityPagerLabels {
  return {
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    previousPageAriaLabel: override?.previousPageAriaLabel ?? parent?.previousPageAriaLabel,
    nextPageAriaLabel: override?.nextPageAriaLabel ?? parent?.nextPageAriaLabel,
    pageIndicator: override?.pageIndicator ?? parent?.pageIndicator,
  };
}

export function mergeScrollControlLabels(
  parent?: NatTableAccessibilityScrollControlLabels,
  override?: NatTableAccessibilityScrollControlLabels,
): NatTableAccessibilityScrollControlLabels {
  return {
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    scrollLeftAriaLabel: override?.scrollLeftAriaLabel ?? parent?.scrollLeftAriaLabel,
    scrollRightAriaLabel: override?.scrollRightAriaLabel ?? parent?.scrollRightAriaLabel,
    scrollPositionAriaLabel: override?.scrollPositionAriaLabel ?? parent?.scrollPositionAriaLabel,
    scrollPositionText: override?.scrollPositionText ?? parent?.scrollPositionText,
  };
}

export function mergeHeaderActionLabels(
  parent?: NatTableAccessibilityHeaderActionLabels,
  override?: NatTableAccessibilityHeaderActionLabels,
): NatTableAccessibilityHeaderActionLabels {
  return {
    sortButton: override?.sortButton ?? parent?.sortButton,
    menuButton: override?.menuButton ?? parent?.menuButton,
    menu: override?.menu ?? parent?.menu,
    pinButton: override?.pinButton ?? parent?.pinButton,
    pinButtonText: override?.pinButtonText ?? parent?.pinButtonText,
  };
}

function mergeDefined<T extends object>(parent?: T, override?: T): T | undefined {
  if (!parent && !override) {
    return undefined;
  }

  const result: Record<string, unknown> = { ...(parent as Record<string, unknown> | undefined) };

  if (override) {
    for (const [key, value] of Object.entries(override)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result as T;
}
