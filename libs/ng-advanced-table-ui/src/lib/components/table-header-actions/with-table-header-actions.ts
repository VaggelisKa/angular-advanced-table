import {
  flexRenderComponent,
  type ColumnDef,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';

import { resolveNatTableColumnLabel } from '../../shared/table-ui.helpers';
import type { NatTableColumnMeta } from '../../shared/table-ui.types';
import {
  getNatTableHeaderActionsColumnState,
  isNatTableHeaderActionsWrapped,
  mergeNatTableHeaderActionsOptions,
  NAT_TABLE_HEADER_ACTIONS_STATE_KEY,
  resolveNatTableHeaderActionsColumnOptions,
  resolveNatTableHeaderActionsSourceHeader,
  shouldSkipNatTableHeaderActions,
  type NatTableHeaderActionsColumnState,
} from './header-actions.helpers';
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
 *
 * Calling the helper more than once on the same column definitions is safe:
 * already wrapped columns are left unchanged. Set `columnDef.meta.headerActions`
 * to `false` to opt a column out, or pass an object to override helper-level
 * options for that column only.
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
  if (isNatTableHeaderActionsWrapped(column) || shouldSkipNatTableHeaderActions(column)) {
    return column;
  }

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

  const columnId = resolveColumnId(nextColumn);
  const columnOptions = resolveNatTableHeaderActionsColumnOptions(nextColumn);
  const mergedOptions = mergeNatTableHeaderActionsOptions(options, columnOptions);
  const sourceHeader = resolveNatTableHeaderActionsSourceHeader(
    nextColumn,
    resolveNatTableColumnLabel(nextColumn, columnId),
  );
  const headerActionsState: NatTableHeaderActionsColumnState = {
    sourceHeader,
  };

  return {
    ...nextColumn,
    meta: {
      ...nextColumn.meta,
      [NAT_TABLE_HEADER_ACTIONS_STATE_KEY]: headerActionsState,
    } as NatTableColumnMeta<TData>,
    header: (context: HeaderContext<TData, unknown>) => {
      const label = resolveNatTableColumnLabel(context.column.columnDef, context.column.id);
      const content = getNatTableHeaderActionsColumnState(context.column.columnDef)?.sourceHeader ??
        sourceHeader;

      return flexRenderComponent(NatTableHeaderActions, {
        inputs: {
          context: context as HeaderContext<RowData, unknown>,
          content: content as NatTableHeaderRenderContent,
          label,
          accessibilityLabels: mergedOptions.accessibilityLabels,
          sortIndicator: mergedOptions.sortIndicator,
        },
      });
    },
  } as ColumnDef<TData, unknown>;
}

function resolveColumnId<TData extends RowData>(column: ColumnDef<TData, unknown>): string {
  if (column.id) {
    return column.id;
  }

  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : 'column';
}
