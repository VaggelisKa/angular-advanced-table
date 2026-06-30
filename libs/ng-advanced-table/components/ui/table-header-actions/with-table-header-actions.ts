import { flexRenderComponent } from '@tanstack/angular-table';
import type { ColumnDef, HeaderContext, RowData } from '@tanstack/angular-table';

import type { NatTableAccessibilityHeaderActionLabels } from 'ng-advanced-table/locale';

import { NatTableHeaderActions } from './table-header-actions';
import type { NatTableHeaderActionsOptions, NatTableHeaderRenderContent } from '../../common/header-actions.type';
import { resolveNatTableColumnLabel } from '../../utils/column-label.util';

const NAT_TABLE_HEADER_ACTIONS_CONTENT = Symbol('NatTableHeaderActionsContent');

type NatTableHeaderActionsRenderer<TData extends RowData> = ((context: HeaderContext<TData, unknown>) => unknown) & {
  [NAT_TABLE_HEADER_ACTIONS_CONTENT]?: NatTableHeaderRenderContent;
};

const resolveColumnId = <TData extends RowData>(column: ColumnDef<TData, unknown>): string => {
  if (column.id) {
    return column.id;
  }

  const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : 'column';
};

const isNatTableHeaderActionsRenderer = <TData extends RowData>(
  header: ColumnDef<TData, unknown>['header']
): header is NatTableHeaderActionsRenderer<TData> =>
  typeof header === 'function' && NAT_TABLE_HEADER_ACTIONS_CONTENT in (header as NatTableHeaderActionsRenderer<TData>);

const resolveOriginalHeader = <TData extends RowData>(column: ColumnDef<TData, unknown>): NatTableHeaderRenderContent => {
  const header = column.header;

  if (isNatTableHeaderActionsRenderer(header)) {
    return header[NAT_TABLE_HEADER_ACTIONS_CONTENT];
  }

  return header as NatTableHeaderRenderContent;
};

const mergeAccessibilityLabels = (
  globalLabels: NatTableAccessibilityHeaderActionLabels | undefined,
  columnLabels: NatTableAccessibilityHeaderActionLabels | undefined
): NatTableAccessibilityHeaderActionLabels | undefined => {
  if (!globalLabels) {
    return columnLabels;
  }

  if (!columnLabels) {
    return globalLabels;
  }

  return {
    ...globalLabels,
    ...columnLabels
  };
};

const resolveBooleanOption = (columnValue: boolean | undefined, helperValue: boolean | undefined, fallback: boolean): boolean =>
  columnValue ?? helperValue ?? fallback;

const resolveHeaderActionsOptions = <TData extends RowData>(
  column: ColumnDef<TData, unknown>,
  options: NatTableHeaderActionsOptions
): false | NatTableHeaderActionsOptions => {
  const columnOptions = column.meta?.headerActions;

  if (columnOptions === false) {
    return false;
  }

  return {
    sortIndicator: columnOptions?.sortIndicator ?? options.sortIndicator,
    locale: options.locale,
    enableColumnPinActions: resolveBooleanOption(columnOptions?.enableColumnPinActions, options.enableColumnPinActions, true),
    enableColumnReorderActions: resolveBooleanOption(
      columnOptions?.enableColumnReorderActions,
      options.enableColumnReorderActions,
      false
    ),
    accessibilityLabels: mergeAccessibilityLabels(options.accessibilityLabels, columnOptions?.accessibilityLabels)
  };
};

const resolveTableLocale = <TData extends RowData>(context: HeaderContext<TData, unknown>): string | undefined => {
  const tableMeta = context.table.options.meta as { readonly natTableLocaleId?: unknown } | undefined;

  return typeof tableMeta?.natTableLocaleId === 'string' ? tableMeta.natTableLocaleId : undefined;
};

const resolveHeaderActionLabel = <TData extends RowData>(
  context: HeaderContext<TData, unknown>,
  content: NatTableHeaderRenderContent,
  fallbackId: string
): string => {
  const label = resolveNatTableColumnLabel(context.column.columnDef, context.column.id);

  if (label !== context.column.id || typeof content !== 'string') {
    return label;
  }

  const columnDef: ColumnDef<TData, unknown> = {
    ...context.column.columnDef,
    header: content
  };

  return resolveNatTableColumnLabel(columnDef, fallbackId);
};

const flexRenderOriginalHeader = <TData extends RowData>(
  content: NatTableHeaderRenderContent,
  context: HeaderContext<TData, unknown>
): unknown => {
  if (typeof content !== 'function') {
    return content;
  }

  return content(context as HeaderContext<RowData, unknown>);
};

const wrapColumnHeader = <TData extends RowData>(
  column: ColumnDef<TData, unknown>,
  options: NatTableHeaderActionsOptions
): ColumnDef<TData, unknown> => {
  const nextColumn: ColumnDef<TData, unknown> & {
    columns?: ColumnDef<TData, unknown>[];
  } = {
    ...column
  };

  if (nextColumn.columns) {
    nextColumn.columns = nextColumn.columns.map((child: ColumnDef<TData, unknown>) => wrapColumnHeader(child, options));
  }

  const fallbackId = resolveColumnId(nextColumn);
  const originalHeader = resolveOriginalHeader(nextColumn);
  const fallbackContent = originalHeader ?? resolveNatTableColumnLabel(nextColumn, fallbackId);

  if (nextColumn.meta?.headerActions === false) {
    const optedOutColumn = {
      ...nextColumn,
      header: fallbackContent
    };

    return optedOutColumn as ColumnDef<TData, unknown>;
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
        enableColumnPinActions: actionOptions.enableColumnPinActions,
        enableColumnReorderActions: actionOptions.enableColumnReorderActions
      }
    });
  }) as NatTableHeaderActionsRenderer<TData>;

  header[NAT_TABLE_HEADER_ACTIONS_CONTENT] = fallbackContent;

  const wrappedColumn = {
    ...nextColumn,
    header
  };

  return wrappedColumn as ColumnDef<TData, unknown>;
};

/**
 * Wraps column headers with the shared sort and column action UI from
 * `ng-advanced-table/components`.
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
 * object to override `sortIndicator`, `enableColumnPinActions`,
 * `enableColumnReorderActions`, or `accessibilityLabels` for that column.
 */
export const withNatTableHeaderActions = <TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  options: NatTableHeaderActionsOptions = {}
): ColumnDef<TData, unknown>[] => columns.map((column) => wrapColumnHeader(column, options));
