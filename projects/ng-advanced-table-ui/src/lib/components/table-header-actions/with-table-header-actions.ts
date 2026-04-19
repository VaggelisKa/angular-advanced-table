import {
  flexRenderComponent,
  type ColumnDef,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';

import { resolveNatTableColumnLabel } from '../../shared/table-ui.helpers';
import {
  NatTableHeaderActions,
  type NatTableHeaderActionsOptions,
  type NatTableHeaderRenderContent,
} from './table-header-actions';

/**
 * Wraps column headers with the shared sort/pin action UI from
 * `ng-advanced-table-ui`.
 *
 * The helper preserves the original header content, applies the wrapper
 * recursively to grouped columns, and optionally injects custom sort-indicator
 * content through `options.sortIndicator`.
 */
export function withNatTableHeaderActions<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: NatTableHeaderActionsOptions = {},
): ColumnDef<TData, unknown>[] {
  return columns.map((column) => wrapColumnHeader(column, options));
}

function wrapColumnHeader<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
  options: NatTableHeaderActionsOptions,
): ColumnDef<TData, unknown> {
  const nextColumn = {
    ...column,
  } as ColumnDef<TData, unknown> & {
    columns?: ColumnDef<TData, unknown>[];
  };

  if (nextColumn.columns) {
    nextColumn.columns = nextColumn.columns.map((child: ColumnDef<TData, unknown>) =>
      wrapColumnHeader(child, options),
    );
  }

  const label = resolveNatTableColumnLabel(nextColumn, resolveColumnId(nextColumn));
  const originalHeader = nextColumn.header ?? label;

  return {
    ...nextColumn,
    header: (context: HeaderContext<TData, unknown>) =>
      flexRenderComponent(NatTableHeaderActions, {
        inputs: {
          context: context as HeaderContext<RowData, unknown>,
          content: originalHeader as NatTableHeaderRenderContent,
          label,
          sortIndicator: options.sortIndicator,
        },
      }),
  } as ColumnDef<TData, unknown>;
}

function resolveColumnId<TData extends RowData>(column: ColumnDef<TData, unknown>): string {
  if (column.id) {
    return column.id;
  }

  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : 'column';
}
