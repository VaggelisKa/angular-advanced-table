import type { Provider } from '@angular/core';
import { provideNatTableIntl, type NatTableIntl } from 'ng-advanced-table';
import { provideNatTableUiIntl, type NatTableUiIntl } from 'ng-advanced-table-ui';
import { provideNatTableUtilsIntl, type NatTableUtilsIntl } from 'ng-advanced-table-utils';

import { NAT_TABLE_BUILT_IN_LOCALES } from './built-in-locales';
import type { NatTableLocaleLabels, NatTableLocaleLabelsMap } from './types';

/**
 * Registers every locale shipped by `ng-advanced-table-locales`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated labels. Instance-specific copy such as table names, captions,
 * descriptions, and column labels should stay on component inputs or column
 * definitions.
 */
export function provideNatTableLocales(overrides: NatTableLocaleLabelsMap = {}): Provider[] {
  const locales = mergeLocaleMaps(NAT_TABLE_BUILT_IN_LOCALES, overrides);

  return [
    ...provideNatTableIntl({ locales: mapTableLocales(locales) }),
    ...provideNatTableUiIntl({ locales: mapUiLocales(locales) }),
    ...provideNatTableUtilsIntl({ locales: mapUtilsLocales(locales) }),
  ];
}

function mapTableLocales(locales: NatTableLocaleLabelsMap): Record<string, NatTableIntl> {
  const tableLocales: Record<string, NatTableIntl> = {};

  for (const [localeId, labels] of Object.entries(locales)) {
    tableLocales[localeId] = {
      accessibilityText: labels.accessibilityText,
      formatNumber: labels.formatNumber,
    };
  }

  return tableLocales;
}

function mapUiLocales(locales: NatTableLocaleLabelsMap): Record<string, NatTableUiIntl> {
  const uiLocales: Record<string, NatTableUiIntl> = {};

  for (const [localeId, labels] of Object.entries(locales)) {
    uiLocales[localeId] = {
      search: labels.search,
      columnVisibility: labels.columnVisibility,
      pageSize: labels.pageSize,
      pager: labels.pager,
      scrollControl: labels.scrollControl,
      headerActions: labels.headerActions,
      formatNumber: labels.formatNumber,
    };
  }

  return uiLocales;
}

function mapUtilsLocales(locales: NatTableLocaleLabelsMap): Record<string, NatTableUtilsIntl> {
  const utilsLocales: Record<string, NatTableUtilsIntl> = {};

  for (const [localeId, labels] of Object.entries(locales)) {
    utilsLocales[localeId] = {
      renderMetrics: labels.renderMetrics,
      formatNumber: labels.formatNumber,
    };
  }

  return utilsLocales;
}

function mergeLocaleMaps(
  builtInLocales: NatTableLocaleLabelsMap,
  overrides: NatTableLocaleLabelsMap,
): NatTableLocaleLabelsMap {
  const merged: NatTableLocaleLabelsMap = {};

  for (const [localeId, labels] of Object.entries(builtInLocales)) {
    merged[localeId] = mergeLocaleLabels(undefined, labels);
  }

  for (const [localeId, labels] of Object.entries(overrides)) {
    merged[localeId] = mergeLocaleLabels(merged[localeId], labels);
  }

  return merged;
}

function mergeLocaleLabels(
  base: NatTableLocaleLabels | undefined,
  override: NatTableLocaleLabels,
): NatTableLocaleLabels {
  return {
    accessibilityText: mergeSection(base?.accessibilityText, override.accessibilityText),
    search: mergeSection(base?.search, override.search),
    columnVisibility: mergeLabelSection(base?.columnVisibility, override.columnVisibility),
    pageSize: mergeLabelSection(base?.pageSize, override.pageSize),
    pager: mergeLabelSection(base?.pager, override.pager),
    scrollControl: mergeLabelSection(base?.scrollControl, override.scrollControl),
    headerActions: mergeLabelSection(base?.headerActions, override.headerActions),
    renderMetrics: mergeRenderMetrics(base?.renderMetrics, override.renderMetrics),
    formatNumber: override.formatNumber ?? base?.formatNumber,
  };
}

function mergeSection<T extends object>(base: T | undefined, override: T | undefined): T | undefined {
  if (!base && !override) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(override ?? {}),
  } as T;
}

function mergeLabelSection<T extends { accessibilityLabels?: object }>(
  base: T | undefined,
  override: T | undefined,
): T | undefined {
  const section = mergeSection(base, override);

  if (!section) {
    return undefined;
  }

  const accessibilityLabels = mergeSection(base?.accessibilityLabels, override?.accessibilityLabels);

  return {
    ...section,
    ...(accessibilityLabels ? { accessibilityLabels } : {}),
  };
}

function mergeRenderMetrics(
  base: NatTableLocaleLabels['renderMetrics'],
  override: NatTableLocaleLabels['renderMetrics'],
): NatTableLocaleLabels['renderMetrics'] {
  if (!base && !override) {
    return undefined;
  }

  return {
    filter: mergeSection(base?.filter, override?.filter),
    panel: mergeSection(base?.panel, override?.panel),
    column: mergeSection(base?.column, override?.column),
  };
}
