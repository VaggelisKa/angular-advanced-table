import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  flexRenderComponent,
  type ColumnDef,
  type Row,
  type RowData,
  type Table,
} from '@tanstack/angular-table';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isSingleSelectHeader()) {
      <!-- Select-all only makes sense in multi-select mode. In single mode the
           toggle-all handler is a no-op (or selects all then collapses to one),
           so render the plain column label instead of a dead checkbox. -->
      {{ resolvedColumnLabel() }}
    } @else {
      <input
        type="checkbox"
        class="nat-selection-checkbox"
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [attr.aria-label]="resolvedAriaLabel()"
        (change)="onChange($event)"
        (click)="$event.stopPropagation()"
      />
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .nat-selection-checkbox {
      inline-size: var(--nat-table-selection-size, 18px);
      block-size: var(--nat-table-selection-size, 18px);
      cursor: pointer;
      accent-color: var(--nat-table-selection-accent, var(--accent, currentColor));
    }
  `,
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
    if (this.mode() !== 'all') {
      return false;
    }

    const table = this.table();

    return table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
  }

  protected isSingleSelectHeader(): boolean {
    return this.mode() === 'all' && this.table().options.enableMultiRowSelection === false;
  }

  protected resolvedColumnLabel(): string {
    const explicit = this.label().trim();

    if (explicit) {
      return explicit;
    }

    return this.tableUiIntl().selection?.columnLabel ?? '';
  }

  protected resolvedAriaLabel(): string {
    const explicit = this.ariaLabel().trim();

    if (explicit) {
      return explicit;
    }

    const labels = this.selectionLabels();

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

  private selectionLabels(): NatTableAccessibilitySelectionLabels {
    return this.tableUiIntl().selection?.accessibilityLabels ?? {};
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

/** Options for {@link withNatTableSelectionColumn}. */
export interface NatTableSelectionColumnOptions<TData extends RowData = RowData> {
  /** Column id. Defaults to `__natSelect`. */
  columnId?: string;
  /** Accessible label for the column. Defaults to the locale `selection.columnLabel`. */
  label?: string;
  /** Column width in pixels. Defaults to 48. */
  size?: number;
  /** Whether the column may be pinned. Defaults to true (pin it left via state). */
  enablePinning?: boolean;
  /** `aria-label` override for the select-all checkbox. Defaults to the locale label. */
  selectAllAriaLabel?: string;
  /** `aria-label` override for a per-row checkbox. Defaults to the locale formatter. */
  selectRowAriaLabel?: (row: Row<TData>) => string;
}

const SELECTION_COLUMN_ID = '__natSelect';

/**
 * Prepends a leading selection column with a select-all header checkbox and a
 * per-row checkbox. Pair with `<nat-table [enableRowSelection]="true">`.
 *
 * Follows the same `(columns) => columns` shape as
 * `withNatTableHeaderActions(...)` so it composes with the other helpers.
 * Generated English copy lives in `ng-advanced-table-locales`; pass explicit
 * label options only to override the active locale.
 */
export function withNatTableSelectionColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: NatTableSelectionColumnOptions<TData> = {},
): ColumnDef<TData, unknown>[] {
  const columnId = options.columnId ?? SELECTION_COLUMN_ID;

  const selectionColumn: ColumnDef<TData, unknown> = {
    id: columnId,
    size: options.size ?? 48,
    minSize: 44,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableGlobalFilter: false,
    enablePinning: options.enablePinning ?? true,
    meta: options.label !== undefined ? { label: options.label } : {},
    header: (context) =>
      flexRenderComponent(NatTableSelectionCheckbox, {
        inputs: {
          mode: 'all',
          table: context.table as Table<RowData>,
          ariaLabel: options.selectAllAriaLabel ?? '',
          label: options.label ?? '',
        },
      }),
    cell: (context) =>
      flexRenderComponent(NatTableSelectionCheckbox, {
        inputs: {
          mode: 'row',
          table: context.table as Table<RowData>,
          row: context.row as Row<RowData>,
          ariaLabel: options.selectRowAriaLabel?.(context.row) ?? '',
        },
      }),
  };

  return [selectionColumn, ...columns];
}
