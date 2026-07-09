import type { Column, RowData } from '@tanstack/angular-table';

// Header-control availability follows the surface-enabler + per-column override model:
// a column resolves `columnDef.<flag> ?? surface.<enabler> ?? false`, then AND's TanStack's
// own `getCanSort()`/`getCanPin()` (which contribute the accessor/leaf safety checks).

/** Whether the header sort button should render and be operable for a column. */
export const canSortColumn = (
  column: Column<RowData, unknown>,
  surfaceSortingEnabled: boolean | undefined,
  enableSortActions: boolean
): boolean => enableSortActions && (column.columnDef.enableSorting ?? surfaceSortingEnabled ?? false) && column.getCanSort();

/** Whether the header pin menu should render and be operable for a column. */
export const canPinColumn = (
  column: Column<RowData, unknown>,
  surfacePinningEnabled: boolean | undefined,
  enableColumnPinActions: boolean
): boolean => enableColumnPinActions && (column.columnDef.enablePinning ?? surfacePinningEnabled ?? false) && column.getCanPin();
