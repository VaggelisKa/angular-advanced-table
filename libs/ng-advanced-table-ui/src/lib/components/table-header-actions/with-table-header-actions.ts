import {
  flexRenderComponent,
  type ColumnDef,
  type HeaderContext,
  type RowData,
} from '@tanstack/angular-table';

import { resolveNatTableColumnLabel } from '../../shared/table-ui.helpers';
import type { NatTableAccessibilityHeaderActionLabels } from '../../shared/table-ui.types';
import {
  NatTableHeaderActions,
  type NatTableHeaderActionsOptions,
  type NatTableHeaderRenderContent,
} from './table-header-actions';

const NAT_TABLE_HEADER_ACTIONS_CONTENT = Symbol('NatTableHeaderActionsContent');

type NatTableHeaderActionsRenderer<TData extends RowData> = ((
  context: HeaderContext<TData, unknown>,
) => unknown) & {
  [NAT_TABLE_HEADER_ACTIONS_CONTENT]?: NatTableHeaderRenderContent;
};

/**
 * Wraps column headers with the shared sort/pin action UI from
 * `ng-advanced-table-ui`.
 *
 * The helper preserves the original header content, applies the wrapper
 * recursively to grouped columns, and optionally injects custom sort-indicator
 * content through `options.sortIndicator`.
 *
 * Applying the helper repeatedly is safe. Wrapped headers are unwrapped before
 * the next wrapper is installed, so reactive column builders can compose this
 * helper with other column helpers without nesting the generated controls.
 *
 * Set `column.meta.headerActions` to `false` to opt a column out, or provide an
 * object to override `sortIndicator` or `accessibilityLabels` for that column.
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

  const fallbackId = resolveColumnId(nextColumn);
  const originalHeader = resolveOriginalHeader(nextColumn);
  const fallbackContent = originalHeader ?? resolveNatTableColumnLabel(nextColumn, fallbackId);

  if (nextColumn.meta?.headerActions === false) {
    return {
      ...nextColumn,
      header: fallbackContent,
    } as ColumnDef<TData, unknown>;
  }

  const header = ((context: HeaderContext<TData, unknown>) => {
    const actionOptions = resolveHeaderActionsOptions(context.column.columnDef, options);

    if (actionOptions === false) {
      return flexRenderOriginalHeader(fallbackContent, context);
    }

    return flexRenderComponent(NatTableHeaderActions, {
      inputs: {
        context: context as HeaderContext<RowData, unknown>,
        content: fallbackContent as NatTableHeaderRenderContent,
        label: resolveHeaderActionLabel(context, fallbackContent, fallbackId),
        hideLabel: !!context.column.columnDef.meta?.hiddenHeaderLabel?.trim(),
        locale: actionOptions.locale ?? resolveTableLocale(context),
        accessibilityLabels: actionOptions.accessibilityLabels,
        sortIndicator: actionOptions.sortIndicator,
      },
    });
  }) as NatTableHeaderActionsRenderer<TData>;

  header[NAT_TABLE_HEADER_ACTIONS_CONTENT] = fallbackContent;

  return {
    ...nextColumn,
    header,
  } as ColumnDef<TData, unknown>;
}

function resolveOriginalHeader<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): NatTableHeaderRenderContent {
  const header = column.header;

  if (isNatTableHeaderActionsRenderer(header)) {
    return header[NAT_TABLE_HEADER_ACTIONS_CONTENT];
  }

  return header as NatTableHeaderRenderContent;
}

function isNatTableHeaderActionsRenderer<TData extends RowData>(
  header: ColumnDef<TData, unknown>['header'],
): header is NatTableHeaderActionsRenderer<TData> {
  return (
    typeof header === 'function' &&
    NAT_TABLE_HEADER_ACTIONS_CONTENT in (header as NatTableHeaderActionsRenderer<TData>)
  );
}

function resolveHeaderActionsOptions<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
  options: NatTableHeaderActionsOptions,
): false | NatTableHeaderActionsOptions {
  const columnOptions = column.meta?.headerActions;

  if (columnOptions === false) {
    return false;
  }

  return {
    sortIndicator: columnOptions?.sortIndicator ?? options.sortIndicator,
    locale: options.locale,
    accessibilityLabels: mergeAccessibilityLabels(
      options.accessibilityLabels,
      columnOptions?.accessibilityLabels,
    ),
  };
}

function resolveTableLocale<TData extends RowData>(
  context: HeaderContext<TData, unknown>,
): string | undefined {
  const tableMeta = context.table.options.meta as { natTableLocaleId?: unknown } | undefined;

  return typeof tableMeta?.natTableLocaleId === 'string' ? tableMeta.natTableLocaleId : undefined;
}

function mergeAccessibilityLabels(
  globalLabels: NatTableAccessibilityHeaderActionLabels | undefined,
  columnLabels: NatTableAccessibilityHeaderActionLabels | undefined,
): NatTableAccessibilityHeaderActionLabels | undefined {
  if (!globalLabels) {
    return columnLabels;
  }

  if (!columnLabels) {
    return globalLabels;
  }

  return {
    ...globalLabels,
    ...columnLabels,
  };
}

function resolveHeaderActionLabel<TData extends RowData>(
  context: HeaderContext<TData, unknown>,
  content: NatTableHeaderRenderContent,
  fallbackId: string,
): string {
  const label = resolveNatTableColumnLabel(context.column.columnDef, context.column.id);

  if (label !== context.column.id || typeof content !== 'string') {
    return label;
  }

  return resolveNatTableColumnLabel(
    {
      ...context.column.columnDef,
      header: content,
    } as ColumnDef<TData, unknown>,
    fallbackId,
  );
}

function flexRenderOriginalHeader<TData extends RowData>(
  content: NatTableHeaderRenderContent,
  context: HeaderContext<TData, unknown>,
): unknown {
  if (typeof content !== 'function') {
    return content;
  }

  return content(context as HeaderContext<RowData, unknown>);
}

function resolveColumnId<TData extends RowData>(column: ColumnDef<TData, unknown>): string {
  if (column.id) {
    return column.id;
  }

  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : 'column';
}
