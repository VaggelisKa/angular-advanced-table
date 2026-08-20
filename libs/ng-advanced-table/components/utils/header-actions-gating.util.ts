import type { Column, RowData, SortingState, Table } from '@tanstack/angular-table';

import { stripNatTableSubHeaderSorting } from 'ng-advanced-table';

// Header-control availability follows the surface-enabler + per-column override model:
// a column resolves `columnDef.<flag> ?? surface.<enabler> ?? false`, then AND's TanStack's
// own `getCanSort()`/`getCanPin()` (which contribute the accessor/leaf safety checks).

/**
 * Whether the header sort button should render and be operable for a column.
 * The active sub-header column is never sortable: its forced primary sort is
 * hidden, so a sort button on it would toggle state with no visible effect.
 */
export const canSortColumn = (
  column: Column<RowData, unknown>,
  surfaceSortingEnabled: boolean | undefined,
  enableSortActions: boolean,
  subHeaderColumnId: string | null = null
): boolean =>
  enableSortActions &&
  column.id !== subHeaderColumnId &&
  (column.columnDef.enableSorting ?? surfaceSortingEnabled ?? false) &&
  column.getCanSort();

/** Table-level `canSortColumn` overload reading the surface enabler and sub-header column from the table meta. */
export const canSortHeaderColumn = <TData extends RowData>(
  table: Table<TData>,
  column: Column<RowData, unknown>,
  enableSortActions: boolean
): boolean =>
  canSortColumn(
    column,
    table.options.meta?.natTableSortingEnabled,
    enableSortActions,
    table.options.meta?.natTableSubHeaderColumnId ?? null
  );

/** User-visible sorting for header controls: TanStack state minus the hidden forced sub-header entry. */
export const getVisibleSorting = <TData extends RowData>(table: Table<TData>): SortingState =>
  stripNatTableSubHeaderSorting(table.getState().sorting, table.options.meta?.natTableSubHeaderColumnId ?? null);

/** One-based visible multi-sort priority for a column, or `null` when at most one user sort is active. */
export const getVisibleSortPriority = (sorting: SortingState, columnId: string): number | null => {
  if (sorting.length <= 1) {
    return null;
  }

  const index = sorting.findIndex((sortEntry) => sortEntry.id === columnId);

  return index >= 0 ? index + 1 : null;
};

/** Visible sort direction for a column, or `false` when it is not user-sorted. */
export const getVisibleSortState = (sorting: SortingState, columnId: string): false | 'asc' | 'desc' => {
  const entry = sorting.find((sortEntry) => sortEntry.id === columnId);

  if (!entry) {
    return false;
  }

  return entry.desc ? 'desc' : 'asc';
};

/** Whether the header pin menu should render and be operable for a column. */
export const canPinColumn = (
  column: Column<RowData, unknown>,
  surfacePinningEnabled: boolean | undefined,
  enableColumnPinActions: boolean
): boolean => enableColumnPinActions && (column.columnDef.enablePinning ?? surfacePinningEnabled ?? false) && column.getCanPin();
