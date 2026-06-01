import type { ColumnDef, RowData } from '@tanstack/angular-table';

import type {
  NatTableAccessibilityHeaderActionLabels,
  NatTableColumnMeta,
  NatTableHeaderActionsColumnOptions,
} from '../../shared/table-ui.types';
import type {
  NatTableHeaderActionsOptions,
  NatTableHeaderRenderContent,
  NatTableSortIndicatorContent,
} from './table-header-actions';

/** Internal marker stored on wrapped column definitions. */
export const NAT_TABLE_HEADER_ACTIONS_STATE_KEY = 'natTableHeaderActionsState' as const;

export interface NatTableHeaderActionsColumnState {
  /** Header renderer captured before the first wrap. */
  sourceHeader: NatTableHeaderRenderContent;
}

type NatTableColumnMetaWithState<TData extends RowData> = NatTableColumnMeta<TData> & {
  [NAT_TABLE_HEADER_ACTIONS_STATE_KEY]?: NatTableHeaderActionsColumnState;
};

export function getNatTableHeaderActionsColumnState<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): NatTableHeaderActionsColumnState | undefined {
  return (column.meta as NatTableColumnMetaWithState<TData> | undefined)?.[
    NAT_TABLE_HEADER_ACTIONS_STATE_KEY
  ];
}

export function isNatTableHeaderActionsWrapped<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): boolean {
  return getNatTableHeaderActionsColumnState(column) !== undefined;
}

export function shouldSkipNatTableHeaderActions<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): boolean {
  return column.meta?.headerActions === false;
}

export function resolveNatTableHeaderActionsColumnOptions<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): NatTableHeaderActionsColumnOptions | undefined {
  const headerActions = column.meta?.headerActions;

  if (!headerActions || typeof headerActions !== 'object') {
    return undefined;
  }

  return headerActions;
}

export function mergeNatTableHeaderActionsOptions(
  globalOptions: NatTableHeaderActionsOptions,
  columnOptions?: NatTableHeaderActionsColumnOptions,
): NatTableHeaderActionsOptions {
  if (!columnOptions) {
    return globalOptions;
  }

  return {
    sortIndicator: columnOptions.sortIndicator ?? globalOptions.sortIndicator,
    accessibilityLabels: mergeNatTableHeaderActionAccessibilityLabels(
      globalOptions.accessibilityLabels,
      columnOptions.accessibilityLabels,
    ),
  };
}

export function mergeNatTableHeaderActionAccessibilityLabels(
  globalLabels?: NatTableAccessibilityHeaderActionLabels,
  columnLabels?: NatTableAccessibilityHeaderActionLabels,
): NatTableAccessibilityHeaderActionLabels | undefined {
  if (!globalLabels && !columnLabels) {
    return undefined;
  }

  return {
    ...globalLabels,
    ...columnLabels,
  };
}

export function resolveNatTableHeaderActionsSourceHeader<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
  fallbackLabel: string,
): NatTableHeaderRenderContent {
  const wrappedState = getNatTableHeaderActionsColumnState(column);

  if (wrappedState) {
    return wrappedState.sourceHeader;
  }

  return (column.header ?? fallbackLabel) as NatTableHeaderRenderContent;
}

export function resolveNatTableHeaderActionsSortIndicator(
  globalOptions: NatTableHeaderActionsOptions,
  columnOptions?: NatTableHeaderActionsColumnOptions,
): NatTableSortIndicatorContent | undefined {
  return columnOptions?.sortIndicator ?? globalOptions.sortIndicator;
}
