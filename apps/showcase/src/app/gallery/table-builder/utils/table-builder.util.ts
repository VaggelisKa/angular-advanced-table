import type { NatTableUserState } from 'ng-advanced-table';

import type { TableBuilderFlagKey, TableBuilderFlags } from '../common/table-builder.type';

const DEFAULT_COLUMN_ORDER = ['name', 'category', 'status', 'owner', 'value'] as const;

const DEFAULT_COLUMN_VISIBILITY = {
  name: true,
  category: true,
  status: true,
  owner: true,
  value: true
} as const;

export const buildSeedState = (flags: TableBuilderFlags): Partial<NatTableUserState> => ({
  columnVisibility: { ...DEFAULT_COLUMN_VISIBILITY },
  ...(flags.withPagination ? { pagination: { pageIndex: 0, pageSize: 3 } } : {}),
  ...(flags.withSorting ? { sorting: [{ id: 'name', desc: false }] } : {}),
  ...(flags.withColumnPinning ? { columnPinning: { left: ['name'], right: [] } } : {}),
  ...(flags.withColumnReorder ? { columnOrder: [...DEFAULT_COLUMN_ORDER] } : {}),
  ...(flags.withColumnResizing ? { columnSizing: {} } : {}),
  ...(flags.withRowSelection ? { rowSelection: {} } : {})
});

const buildColumnLayoutState = (flags: TableBuilderFlags, currentState: Partial<NatTableUserState>): Partial<NatTableUserState> => ({
  ...(flags.withColumnPinning && currentState.columnPinning ? { columnPinning: currentState.columnPinning } : {}),
  ...(flags.withColumnReorder && currentState.columnOrder ? { columnOrder: currentState.columnOrder } : {})
});

const buildDataFilterState = (flags: TableBuilderFlags, currentState: Partial<NatTableUserState>): Partial<NatTableUserState> => ({
  ...(flags.withGlobalFilter ? { globalFilter: currentState.globalFilter ?? '' } : {}),
  ...(flags.withSorting ? { sorting: currentState.sorting ?? [{ id: 'name', desc: false }] } : {}),
  ...(flags.withColumnResizing ? { columnSizing: currentState.columnSizing ?? {} } : {}),
  ...(flags.withRowSelection ? { rowSelection: currentState.rowSelection ?? {} } : {})
});

export const buildStateObject = (flags: TableBuilderFlags, currentState: Partial<NatTableUserState>): Partial<NatTableUserState> => ({
  ...buildDataFilterState(flags, currentState),
  ...(flags.showColumnVisibility ? { columnVisibility: currentState.columnVisibility ?? { ...DEFAULT_COLUMN_VISIBILITY } } : {}),
  ...(flags.withPagination ? { pagination: currentState.pagination ?? { pageIndex: 0, pageSize: 3 } } : {}),
  ...buildColumnLayoutState(flags, currentState)
});

export const formatStateLiteral = (stateObj: Partial<NatTableUserState>): string =>
  JSON.stringify(stateObj, null, 4)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'")
    .split('\n')
    .map((line, index) => (index === 0 ? line : `    ${line}`))
    .join('\n');

export const omitColumnOrder = (state: Partial<NatTableUserState>): Partial<NatTableUserState> => {
  const next = { ...state };

  delete next.columnOrder;

  return next;
};

const omitSorting = (state: Partial<NatTableUserState>): Partial<NatTableUserState> => {
  const next = { ...state };

  delete next.sorting;

  return next;
};

const omitColumnSizing = (state: Partial<NatTableUserState>): Partial<NatTableUserState> => {
  const next = { ...state };

  delete next.columnSizing;

  return next;
};

const omitRowSelection = (state: Partial<NatTableUserState>): Partial<NatTableUserState> => {
  const next = { ...state };

  delete next.rowSelection;

  return next;
};

const seedToggleState = (state: Partial<NatTableUserState>, key: TableBuilderFlagKey): Partial<NatTableUserState> => {
  if (key === 'withColumnPinning') {
    return { ...state, columnPinning: { left: ['name'], right: [] } };
  }

  if (key === 'withColumnReorder') {
    return { ...state, columnOrder: [...DEFAULT_COLUMN_ORDER] };
  }

  if (key === 'withSorting') {
    return { ...state, sorting: [{ id: 'name', desc: false }] };
  }

  if (key === 'withColumnResizing') {
    return { ...state, columnSizing: {} };
  }

  if (key === 'withRowSelection') {
    return { ...state, rowSelection: {} };
  }

  return state;
};

const clearToggleState = (state: Partial<NatTableUserState>, key: TableBuilderFlagKey): Partial<NatTableUserState> => {
  if (key === 'withColumnPinning') {
    return { ...state, columnPinning: { left: [], right: [] } };
  }

  if (key === 'withColumnReorder') {
    return omitColumnOrder(state);
  }

  if (key === 'withSorting') {
    return omitSorting(state);
  }

  if (key === 'withColumnResizing') {
    return omitColumnSizing(state);
  }

  if (key === 'withRowSelection') {
    return omitRowSelection(state);
  }

  return state;
};

// Seed or clear the tableState slice that a toggled feature owns (pinning/reorder/
// sorting/resizing/row-selection); other keys leave the state untouched.
export const reconcileToggleState = (
  state: Partial<NatTableUserState>,
  key: TableBuilderFlagKey,
  next: boolean
): Partial<NatTableUserState> => (next ? seedToggleState(state, key) : clearToggleState(state, key));
