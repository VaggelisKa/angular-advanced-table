import { flexRenderComponent } from '@tanstack/angular-table';
import type { ColumnDef, Row, RowData, Table } from '@tanstack/angular-table';

import { SELECTION_COLUMN_ID } from './common/selection-tokens.const';
import type { NatTableSelectionColumnOptions } from './common/selection-tokens.type';
import { NatTableSelectionCheckbox } from './table-selection';

/**
 * Prepends a leading selection column with a select-all header checkbox and a
 * per-row checkbox. Pair with `<nat-table [enableRowSelection]="true">`.
 *
 * Follows the same `(columns) => columns` shape as
 * `withNatTableHeaderActions(...)` so it composes with the other helpers.
 * Generated English copy lives in `ng-advanced-table-locales`; pass explicit
 * label options only to override the active locale.
 */
export const withNatTableSelectionColumn = <TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: NatTableSelectionColumnOptions<TData> = {},
): ColumnDef<TData, unknown>[] => {
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
};
