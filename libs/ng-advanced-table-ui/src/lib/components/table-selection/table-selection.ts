import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  flexRenderComponent,
  type ColumnDef,
  type Row,
  type RowData,
  type Table,
} from '@tanstack/angular-table';

/**
 * Accessible selection checkbox rendered by {@link withNatTableSelectionColumn}.
 *
 * In `'all'` mode it reflects and toggles the whole current row model (with an
 * indeterminate state for partial selection); in `'row'` mode it reflects and
 * toggles a single row.
 */
@Component({
  selector: 'nat-table-selection-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="checkbox"
      class="nat-selection-checkbox"
      [checked]="checked()"
      [indeterminate]="indeterminate()"
      [attr.aria-label]="ariaLabel()"
      (change)="onChange($event)"
      (click)="$event.stopPropagation()"
    />
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
  readonly mode = input.required<'row' | 'all'>();
  readonly table = input.required<Table<TData>>();
  readonly row = input<Row<TData>>();
  readonly ariaLabel = input('');

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

  protected onChange(event: Event): void {
    const handler =
      this.mode() === 'all'
        ? this.table().getToggleAllRowsSelectedHandler()
        : this.row()?.getToggleSelectedHandler();

    handler?.(event);
  }
}

/** Options for {@link withNatTableSelectionColumn}. */
export interface NatTableSelectionColumnOptions<TData extends RowData = RowData> {
  /** Column id. Defaults to `__natSelect`. */
  columnId?: string;
  /** Accessible label for the column. Defaults to `'Selection'`. */
  label?: string;
  /** Column width in pixels. Defaults to 48. */
  size?: number;
  /** Whether the column may be pinned. Defaults to true (pin it left via state). */
  enablePinning?: boolean;
  /** `aria-label` for the select-all checkbox. Defaults to `'Select all rows'`. */
  selectAllAriaLabel?: string;
  /** `aria-label` for a per-row checkbox. Defaults to ``Select row ${row.id}``. */
  selectRowAriaLabel?: (row: Row<TData>) => string;
}

const SELECTION_COLUMN_ID = '__natSelect';

/**
 * Prepends a leading selection column with a select-all header checkbox and a
 * per-row checkbox. Pair with `<nat-table [enableRowSelection]="true">`.
 *
 * Follows the same `(columns) => columns` shape as
 * `withNatTableHeaderActions(...)` so it composes with the other helpers.
 */
export function withNatTableSelectionColumn<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: NatTableSelectionColumnOptions<TData> = {},
): ColumnDef<TData, unknown>[] {
  const columnId = options.columnId ?? SELECTION_COLUMN_ID;
  const label = options.label ?? 'Selection';
  const selectAllAriaLabel = options.selectAllAriaLabel ?? 'Select all rows';
  const selectRowAriaLabel =
    options.selectRowAriaLabel ?? ((row: Row<TData>) => `Select row ${row.id}`);

  const selectionColumn: ColumnDef<TData, unknown> = {
    id: columnId,
    size: options.size ?? 48,
    minSize: 44,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enableGlobalFilter: false,
    enablePinning: options.enablePinning ?? true,
    meta: { label },
    header: (context) =>
      // Select-all only makes sense in multi-select mode. In single mode the
      // toggle-all handler is a no-op (or selects all then collapses to one), so
      // render the plain column label instead of a dead checkbox.
      context.table.options.enableMultiRowSelection === false
        ? label
        : flexRenderComponent(NatTableSelectionCheckbox, {
            inputs: {
              mode: 'all',
              table: context.table as Table<RowData>,
              ariaLabel: selectAllAriaLabel,
            },
          }),
    cell: (context) =>
      flexRenderComponent(NatTableSelectionCheckbox, {
        inputs: {
          mode: 'row',
          table: context.table as Table<RowData>,
          row: context.row as Row<RowData>,
          ariaLabel: selectRowAriaLabel(context.row),
        },
      }),
  };

  return [selectionColumn, ...columns];
}
