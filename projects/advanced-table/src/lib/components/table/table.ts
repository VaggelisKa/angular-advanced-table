import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  type WritableSignal,
} from '@angular/core';
import { Grid, GridCell, GridCellWidget, GridRow } from '@angular/aria/grid';
import {
  FlexRender,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type FilterFn,
  type PaginationState,
  type RowData,
  type SortingState,
  type Table,
  type Updater,
  type VisibilityState,
} from '@tanstack/angular-table';

import type { AdvancedTableState } from './table.types';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const EMPTY_COLUMN_PINNING: ColumnPinningState = {
  left: [],
  right: [],
};
const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
};
const DEFAULT_TABLE_STATE: AdvancedTableState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnPinning: EMPTY_COLUMN_PINNING,
  pagination: DEFAULT_PAGINATION,
};
const genericGlobalFilter: FilterFn<RowData> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '').trim().toLowerCase();

  if (!query) {
    return true;
  }

  return Object.values(row.original as Record<string, unknown>).some((value) =>
    matchesFilterQuery(value, query),
  );
};

@Component({
  selector: 'advanced-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Grid, GridCell, GridCellWidget, GridRow, FlexRender],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class AdvancedTableComponent<TData extends RowData = RowData> {
  readonly data = input.required<readonly TData[]>();
  readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  readonly ariaLabel = input.required<string>();

  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  readonly enableGlobalFilter = input(true, { transform: booleanAttribute });
  readonly searchLabel = input('Search rows');
  readonly searchPlaceholder = input('Search rows');
  readonly showColumnVisibility = input(true, { transform: booleanAttribute });
  readonly showPagination = input(true, { transform: booleanAttribute });
  readonly allowColumnPinning = input(true, { transform: booleanAttribute });
  readonly emptyStateLabel = input('No rows match the current view.');
  readonly globalFilterFn = input<FilterFn<TData> | undefined>(undefined);
  readonly initialState = input<Partial<AdvancedTableState>>({});
  readonly state = input<Partial<AdvancedTableState>>({});

  readonly stateChange = output<AdvancedTableState>();

  private readonly internalSorting = signal<SortingState>(DEFAULT_TABLE_STATE.sorting);
  private readonly internalGlobalFilter = signal(DEFAULT_TABLE_STATE.globalFilter);
  private readonly internalColumnFilters = signal<ColumnFiltersState>(
    DEFAULT_TABLE_STATE.columnFilters,
  );
  private readonly internalColumnVisibility = signal<VisibilityState>(
    DEFAULT_TABLE_STATE.columnVisibility,
  );
  private readonly internalColumnPinning = signal<ColumnPinningState>(
    DEFAULT_TABLE_STATE.columnPinning,
  );
  private readonly internalPagination = signal<PaginationState>(DEFAULT_TABLE_STATE.pagination);
  private readonly hasSeededInitialState = signal(false);

  protected readonly sanitizedPageSizeOptions = computed(() => {
    const options = this.pageSizeOptions()
      .map((value) => Math.trunc(value))
      .filter((value) => value > 0);

    return options.length ? options : [...DEFAULT_PAGE_SIZE_OPTIONS];
  });
  private readonly defaultPageSize = computed(() => this.sanitizedPageSizeOptions()[0]);

  protected readonly mergedState = computed<AdvancedTableState>(() => ({
    sorting: this.state().sorting ?? this.internalSorting(),
    globalFilter: this.enableGlobalFilter()
      ? (this.state().globalFilter ?? this.internalGlobalFilter())
      : '',
    columnFilters: this.state().columnFilters ?? this.internalColumnFilters(),
    columnVisibility: this.state().columnVisibility ?? this.internalColumnVisibility(),
    columnPinning: this.allowColumnPinning()
      ? (this.state().columnPinning ?? this.internalColumnPinning())
      : EMPTY_COLUMN_PINNING,
    pagination: this.state().pagination ?? this.internalPagination(),
  }));
  protected readonly table: Table<TData> = createAngularTable<TData>(() => ({
    data: this.readRequiredInput(this.data, []) as TData[],
    columns: this.readRequiredInput(this.columns, []) as ColumnDef<TData, unknown>[],
    state: this.mergedState(),
    enableMultiSort: false,
    enableColumnPinning: this.allowColumnPinning(),
    autoResetPageIndex: false,
    globalFilterFn: (this.globalFilterFn() ?? genericGlobalFilter) as FilterFn<TData>,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: this.showPagination() ? getPaginationRowModel() : undefined,
    onSortingChange: (updater) => this.updateState({ sorting: updater }),
    onGlobalFilterChange: (updater) =>
      this.updateState({ globalFilter: updater, pagination: this.firstPageUpdater }),
    onColumnFiltersChange: (updater) =>
      this.updateState({ columnFilters: updater, pagination: this.firstPageUpdater }),
    onColumnVisibilityChange: (updater) => this.updateState({ columnVisibility: updater }),
    onColumnPinningChange: (updater) => this.updateState({ columnPinning: updater }),
    onPaginationChange: (updater) => this.updateState({ pagination: updater }),
  })) as Table<TData>;
  protected readonly columnVisibilityOptions = computed(() =>
    this.table
      .getAllLeafColumns()
      .filter((column) => column.getCanHide()),
  );
  protected readonly totalTableWidth = computed(() => this.table.getTotalSize());
  protected readonly visibleColumnCount = computed(() => this.table.getVisibleLeafColumns().length);
  protected readonly emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1));
  protected readonly showSearch = computed(() => this.enableGlobalFilter());
  protected readonly showVisibilityControls = computed(
    () => this.showColumnVisibility() && this.columnVisibilityOptions().length > 0,
  );
  protected readonly showTopControls = computed(
    () => this.showSearch() || this.showVisibilityControls(),
  );

  constructor() {
    effect(() => {
      if (this.hasSeededInitialState()) {
        return;
      }

      const initialState = this.initialState();

      this.internalSorting.set(initialState.sorting ?? DEFAULT_TABLE_STATE.sorting);
      this.internalGlobalFilter.set(
        this.enableGlobalFilter()
          ? (initialState.globalFilter ?? DEFAULT_TABLE_STATE.globalFilter)
          : '',
      );
      this.internalColumnFilters.set(
        initialState.columnFilters ?? DEFAULT_TABLE_STATE.columnFilters,
      );
      this.internalColumnVisibility.set(
        initialState.columnVisibility ?? DEFAULT_TABLE_STATE.columnVisibility,
      );
      this.internalColumnPinning.set(
        this.allowColumnPinning()
          ? (initialState.columnPinning ?? DEFAULT_TABLE_STATE.columnPinning)
          : EMPTY_COLUMN_PINNING,
      );
      this.internalPagination.set({
        pageIndex: initialState.pagination?.pageIndex ?? DEFAULT_PAGINATION.pageIndex,
        pageSize: initialState.pagination?.pageSize ?? this.defaultPageSize(),
      });
      this.hasSeededInitialState.set(true);
    });
  }

  protected onSearchInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.updateState({
      globalFilter: target.value,
      pagination: this.firstPageUpdater,
    });
  }

  protected setPageSize(pageSize: number): void {
    this.updateState({
      pagination: (currentPagination) => ({
        pageIndex: 0,
        pageSize,
      }),
    });
  }

  protected toggleColumnPin(column: Column<TData, unknown>): void {
    if (column.getIsPinned()) {
      column.pin(false);
      return;
    }

    column.pin('left');
  }

  protected getPinLabel(column: Column<TData, unknown>): string {
    return column.getIsPinned() ? 'Unpin column' : 'Pin column';
  }

  protected canPinColumn(column: Column<TData, unknown>): boolean {
    return this.allowColumnPinning() && column.getCanPin();
  }

  protected toggleColumnVisibility(column: Column<TData, unknown>): void {
    if (column.getIsVisible() && this.visibleColumnCount() === 1) {
      return;
    }

    column.toggleVisibility(!column.getIsVisible());
  }

  protected canToggleColumnVisibility(column: Column<TData, unknown>): boolean {
    return !column.getIsVisible() || this.visibleColumnCount() > 1;
  }

  protected getColumnVisibilityAction(column: Column<TData, unknown>): string {
    return `${column.getIsVisible() ? 'Hide' : 'Show'} ${this.getColumnLabel(column)} column`;
  }

  protected getPinnedLeft(column: Column<TData, unknown>): number | null {
    return column.getIsPinned() === 'left' ? column.getStart('left') : null;
  }

  protected getPinnedRight(column: Column<TData, unknown>): number | null {
    return column.getIsPinned() === 'right' ? column.getAfter('right') : null;
  }

  protected getColumnWidth(column: Column<TData, unknown>): number {
    return column.getSize();
  }

  protected isLastLeftPinnedColumn(column: Column<TData, unknown>): boolean {
    return column.getIsPinned() === 'left' && column.getIsLastColumn('left');
  }

  protected isFirstRightPinnedColumn(column: Column<TData, unknown>): boolean {
    return column.getIsPinned() === 'right' && column.getIsFirstColumn('right');
  }

  protected getSortIcon(column: Column<TData, unknown>): string {
    const sortState = column.getIsSorted();

    if (sortState === 'asc') {
      return '↑';
    }

    if (sortState === 'desc') {
      return '↓';
    }

    return '↕';
  }

  protected getAriaSort(column: Column<TData, unknown>): string {
    const sortState = column.getIsSorted();

    if (sortState === 'asc') {
      return 'ascending';
    }

    if (sortState === 'desc') {
      return 'descending';
    }

    return 'none';
  }

  protected isColumnAlignedEnd(column: Column<TData, unknown>): boolean {
    return column.columnDef.meta?.align === 'end';
  }

  protected getColumnLabel(column: Column<TData, unknown>): string {
    const metaLabel = column.columnDef.meta?.label;

    if (metaLabel) {
      return metaLabel;
    }

    if (typeof column.columnDef.header === 'string') {
      return column.columnDef.header;
    }

    return column.id;
  }

  private readonly firstPageUpdater: Updater<PaginationState> = (currentPagination) => ({
    ...currentPagination,
    pageIndex: 0,
  });

  private updateState(
    updaters: Partial<{
      [K in keyof AdvancedTableState]: Updater<AdvancedTableState[K]>;
    }>,
  ): void {
    const currentState = this.mergedState();
    const nextState: AdvancedTableState = {
      sorting: this.resolveUpdater(currentState.sorting, updaters.sorting),
      globalFilter: this.resolveUpdater(currentState.globalFilter, updaters.globalFilter),
      columnFilters: this.resolveUpdater(currentState.columnFilters, updaters.columnFilters),
      columnVisibility: this.resolveUpdater(
        currentState.columnVisibility,
        updaters.columnVisibility,
      ),
      columnPinning: this.resolveUpdater(currentState.columnPinning, updaters.columnPinning),
      pagination: this.resolveUpdater(currentState.pagination, updaters.pagination),
    };

    this.commitInternalState(nextState);
    this.stateChange.emit(nextState);
  }

  private commitInternalState(nextState: AdvancedTableState): void {
    if (this.state().sorting === undefined) {
      this.internalSorting.set(nextState.sorting);
    }

    if (this.state().globalFilter === undefined) {
      this.internalGlobalFilter.set(nextState.globalFilter);
    }

    if (this.state().columnFilters === undefined) {
      this.internalColumnFilters.set(nextState.columnFilters);
    }

    if (this.state().columnVisibility === undefined) {
      this.internalColumnVisibility.set(nextState.columnVisibility);
    }

    if (this.state().columnPinning === undefined) {
      this.internalColumnPinning.set(nextState.columnPinning);
    }

    if (this.state().pagination === undefined) {
      this.internalPagination.set(nextState.pagination);
    }
  }

  private resolveUpdater<T>(currentValue: T, updater: Updater<T> | undefined): T {
    if (updater === undefined) {
      return currentValue;
    }

    return updater instanceof Function ? updater(currentValue) : updater;
  }

  private readRequiredInput<T>(reader: () => T, fallback: T): T {
    try {
      return reader();
    } catch (error) {
      if (isUnavailableRequiredInputError(error)) {
        return fallback;
      }

      throw error;
    }
  }
}

function matchesFilterQuery(value: unknown, query: string): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value).toLowerCase().includes(query);
  }

  if (value instanceof Date) {
    return value.toISOString().toLowerCase().includes(query);
  }

  if (Array.isArray(value)) {
    return value.some((item) => matchesFilterQuery(item, query));
  }

  return false;
}

function isUnavailableRequiredInputError(
  error: unknown,
): error is Error & { code?: number } {
  return error instanceof Error && Math.abs((error as { code?: number }).code ?? 0) === 950;
}
