import type { ColumnDef, FilterFn, Row, RowData, Table, Updater, VisibilityState } from '@tanstack/angular-table';
import {
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/angular-table';

import type { NatTableState } from './table.state';
import { genericGlobalFilter } from '../utils/global-filter.util';
import { resolveDefaultRowId } from '../utils/row-state.util';
import { firstPageUpdater } from '../utils/state-seed.util';

const resolveRowId = <TData extends RowData>(store: NatTableState<TData>, row: TData, index: number, parent?: Row<TData>): string => {
  const getRowIdFn = store.getRowId();

  return getRowIdFn ? getRowIdFn(row, index, parent) : resolveDefaultRowId(row, index, parent);
};

/**
 * Builds the TanStack table instance for a `NatTableState` store. Reads the
 * store's public signals/computeds and delegates mutation callbacks back to
 * the store's methods — same object, no cycle.
 */
export const createNatTableInstance = <TData extends RowData>(store: NatTableState<TData>): Table<TData> =>
  createAngularTable<TData>(() => ({
    data: store.data() as TData[],
    columns: store.columnDefs() as ColumnDef<TData, unknown>[],
    state: store.mergedState(),
    pageCount: store.manualPagination() ? store.manualPageCount() : undefined,
    manualPagination: store.manualPagination(),
    manualSorting: store.manualSorting(),
    manualFiltering: store.manualFiltering(),
    enableMultiSort: store.enableMultiSort(),
    isMultiSortEvent: (event) => store.enableMultiSort() && (event as { readonly shiftKey?: boolean }).shiftKey === true,
    enableSorting: true,
    enableColumnPinning: true,
    enableColumnOrdering: store.hasReorderableColumns(),
    enableColumnResizing: true,
    columnResizeMode: store.columnResizeMode(),
    columnResizeDirection: store.resolvedDirection(),
    enableRowSelection: store.enableRowSelection(),
    enableMultiRowSelection: store.selectionMode() === 'multiple',
    meta: {
      natTableLocaleId: store.localeId(),
      natTableCanMoveColumn: (columnId, direction) => store.canMoveColumn(columnId, direction),
      natTableMoveColumn: (columnId, direction) => store.moveColumn(columnId, direction),
      natTableSortingEnabled: store.enableSorting(),
      natTablePinningEnabled: store.enablePinning()
    },
    autoResetPageIndex: false,
    globalFilterFn: (store.globalFilterFn() ?? genericGlobalFilter) as FilterFn<TData>,
    getRowId: (row, index, parent) => resolveRowId(store, row, index, parent),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: store.manualFiltering() ? undefined : getFilteredRowModel(),
    getSortedRowModel: store.manualSorting() ? undefined : getSortedRowModel(),
    getPaginationRowModel: !store.manualPagination() && store.enablePagination() ? getPaginationRowModel() : undefined,
    onSortingChange: (updater) => store.updateState({ sorting: updater }),
    onGlobalFilterChange: (updater: Updater<string>) => store.updateState({ globalFilter: updater, pagination: firstPageUpdater }),
    onColumnFiltersChange: (updater) => store.updateState({ columnFilters: updater, pagination: firstPageUpdater }),
    onColumnVisibilityChange: (updater: Updater<VisibilityState>) => store.updateState({ columnVisibility: updater }),
    onColumnOrderChange: (updater) => store.updateState({ columnOrder: updater }),
    onColumnPinningChange: (updater) => store.updateState({ columnPinning: updater }),
    onColumnSizingChange: (updater) => store.applyColumnSizingChange(updater),
    onRowSelectionChange: (updater) => store.updateState({ rowSelection: updater }),
    onPaginationChange: (updater) => store.updateState({ pagination: updater })
  })) as Table<TData>;
