import { Component, inject, input } from '@angular/core';
import type { Row, RowData, Table } from '@tanstack/angular-table';

import type { NatTableAccessibilitySelectionLabels } from '../../shared/table-ui.types';
import {
  NAT_TABLE_UI_ENGLISH_LOCALE,
  NAT_TABLE_UI_INTL,
  resolveNatTableUiIntl,
} from '../../shared/table-ui-intl';

/**
 * Accessible selection checkbox rendered by {@link withNatTableSelectionColumn}.
 *
 * In `'all'` mode it reflects and toggles the whole current row model (with an
 * indeterminate state for partial selection); in `'row'` mode it reflects and
 * toggles a single row. Generated labels resolve from the active UI locale
 * unless explicit overrides are provided.
 */
@Component({
  selector: 'nat-table-selection-checkbox',
  templateUrl: './table-selection.html',
  styleUrl: './table-selection.css',
})
export class NatTableSelectionCheckbox<TData extends RowData = RowData> {
  private readonly tableUiIntlConfig = inject(NAT_TABLE_UI_INTL);
  readonly mode = input.required<'row' | 'all'>();
  readonly table = input.required<Table<TData>>();
  readonly row = input<Row<TData>>();
  /** Explicit `aria-label` override; falls back to the active UI locale. */
  readonly ariaLabel = input('');
  /** Explicit column label override; falls back to the active UI locale. */
  readonly label = input('');

  protected checked(): boolean {
    return this.mode() === 'all'
      ? this.table().getIsAllRowsSelected()
      : (this.row()?.getIsSelected() ?? false);
  }

  protected indeterminate(): boolean {
    if (this.mode() !== 'all') return false;

    const table = this.table();

    return table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
  }

  protected isSingleSelectHeader(): boolean {
    return this.mode() === 'all' && this.table().options.enableMultiRowSelection === false;
  }

  protected resolvedColumnLabel(): string {
    const explicit = this.label().trim();

    if (explicit) return explicit;

    return this.tableUiIntl().selection?.columnLabel ?? '';
  }

  protected resolvedAriaLabel(): string {
    const explicit = this.ariaLabel().trim();

    if (explicit) return explicit;

    const labels: NatTableAccessibilitySelectionLabels =
      this.tableUiIntl().selection?.accessibilityLabels ?? {};

    if (this.mode() === 'all') {
      return labels.selectAllAriaLabel ?? '';
    }

    return labels.selectRowAriaLabel?.({ rowId: this.row()?.id ?? '' }) ?? '';
  }

  protected onChange(event: Event): void {
    const handler =
      this.mode() === 'all'
        ? this.table().getToggleAllRowsSelectedHandler()
        : this.row()?.getToggleSelectedHandler();

    handler?.(event);
  }

  private tableUiIntl() {
    return resolveNatTableUiIntl(this.tableUiIntlConfig, this.localeId());
  }

  private localeId(): string {
    const tableMeta = this.table().options.meta as { natTableLocaleId?: unknown } | undefined;

    return typeof tableMeta?.natTableLocaleId === 'string'
      ? tableMeta.natTableLocaleId
      : NAT_TABLE_UI_ENGLISH_LOCALE;
  }
}
