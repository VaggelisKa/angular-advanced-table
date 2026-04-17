import {
  flexRenderComponent,
  type ColumnDef,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';

import { resolveNatTableColumnLabel } from '../../shared/table-ui.helpers';
import { NatTableHeaderActions, type NatTableHeaderRenderContent } from './table-header-actions';

export function withNatTableHeaderActions<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
): ColumnDef<TData, unknown>[] {
  return columns.map((column) => wrapColumnHeader(column));
}

function wrapColumnHeader<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): ColumnDef<TData, unknown> {
  const nextColumn = {
    ...column,
  } as ColumnDef<TData, unknown> & {
    columns?: ColumnDef<TData, unknown>[];
  };

  if (nextColumn.columns) {
    nextColumn.columns = nextColumn.columns.map((child: ColumnDef<TData, unknown>) =>
      wrapColumnHeader(child),
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
