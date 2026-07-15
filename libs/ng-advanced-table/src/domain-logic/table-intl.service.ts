import { Injectable, computed, inject } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_INTL,
  formatNatTableNumber,
  mergeNatTableAccessibilityText,
  resolveNatTableIntl
} from 'ng-advanced-table/locale';

import { NatTableService } from './table.service';

/**
 * Leaf intl service: resolves the active locale, the merged intl config, and
 * the accessibility-text overlay for a per-table instance.
 *
 * Injects only `NatTableService` (surface config) and `NAT_TABLE_INTL` (the
 * locale catalog) — never the store, never the table — so it stays a leaf
 * with no cycle risk.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable (providers: [NatTableIntlService]), not root.
@Injectable()
export class NatTableIntlService<TData extends RowData = RowData> {
  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly tableIntlConfig = inject(NAT_TABLE_INTL);

  /** Resolved locale id (from the surface or the built-in English default). */
  public readonly localeId = computed(() => this.natTableService.locale() ?? NAT_EN_LOCALE_ID);
  private readonly tableIntl = computed(() => resolveNatTableIntl(this.tableIntlConfig, this.localeId()));
  /** Accessibility text: the resolved locale's defaults overlaid by surface overrides. */
  public readonly resolvedAccessibilityText = computed(() =>
    mergeNatTableAccessibilityText(this.tableIntl().accessibilityText, this.natTableService.accessibilityText())
  );

  /**
   * Format a number for screen-reader readout using the resolved locale.
   */
  public formatAccessibilityNumber(value: number): string {
    return formatNatTableNumber(this.tableIntl(), value, undefined, this.localeId());
  }
}
