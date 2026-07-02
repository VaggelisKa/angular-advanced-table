import { hasNatTableStateValueChanged } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';

const serializeSelectedRowIds = (selection: NatTableUserState['rowSelection']): string =>
  Object.keys(selection)
    .filter((rowId) => selection[rowId])
    .sort()
    .join('|');

export type NatTableStateDiff = {
  readonly sortingChanged: boolean;
  readonly globalFilterChanged: boolean;
  readonly columnFiltersChanged: boolean;
  readonly columnVisibilityChanged: boolean;
  readonly columnOrderChanged: boolean;
  readonly columnPinningChanged: boolean;
  readonly columnSizingChanged: boolean;
  readonly paginationChanged: boolean;
  readonly rowSelectionChanged: boolean;
};

/** A state-slice changed flag paired with the emit action for that slice. */
export type SliceEmitter = readonly [changed: boolean, emit: () => void];

export const computeNatTableStateDiff = (prev: NatTableUserState, next: NatTableUserState): NatTableStateDiff => ({
  sortingChanged: hasNatTableStateValueChanged(prev.sorting, next.sorting),
  globalFilterChanged: prev.globalFilter !== next.globalFilter,
  columnFiltersChanged: hasNatTableStateValueChanged(prev.columnFilters, next.columnFilters),
  columnVisibilityChanged: hasNatTableStateValueChanged(prev.columnVisibility, next.columnVisibility),
  columnOrderChanged: hasNatTableStateValueChanged(prev.columnOrder, next.columnOrder),
  columnPinningChanged: hasNatTableStateValueChanged(prev.columnPinning, next.columnPinning),
  columnSizingChanged: hasNatTableStateValueChanged(prev.columnSizing, next.columnSizing),
  paginationChanged: hasNatTableStateValueChanged(prev.pagination, next.pagination),
  rowSelectionChanged: serializeSelectedRowIds(prev.rowSelection) !== serializeSelectedRowIds(next.rowSelection)
});
