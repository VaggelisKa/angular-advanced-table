import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Grid, GridCell, GridCellWidget, GridRow } from '@angular/aria/grid';
import {
  FlexRender,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Cell,
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

import type { NatTableRowRenderedEvent } from './events';
import { NatTableRowRenderEmitter } from './row-render-emitter.directive';
import type { NatTableCellTone, NatTableState } from './table.types';

type TableRowIdGetter<TData> = (row: TData, index: number) => string;

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const EMPTY_COLUMN_PINNING: ColumnPinningState = {
  left: [],
  right: [],
};
const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
};
const DEFAULT_TABLE_STATE: NatTableState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnPinning: EMPTY_COLUMN_PINNING,
  pagination: DEFAULT_PAGINATION,
};

const genericGlobalFilter: FilterFn<RowData> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase();

  if (!query) {
    return true;
  }

  return Object.values(row.original as Record<string, unknown>).some((value) =>
    matchesFilterQuery(value, query),
  );
};

@Component({
  selector: 'nat-table',
  exportAs: 'natTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Grid, GridCell, GridCellWidget, GridRow, FlexRender, NatTableRowRenderEmitter],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class NatTable<TData extends RowData = RowData> {
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
  readonly initialState = input<Partial<NatTableState>>({});
  readonly state = input<Partial<NatTableState>>({});
  readonly getRowId = input<TableRowIdGetter<TData> | undefined>(undefined);
  /**
   * When `true`, emits one `rowRendered` event per body row per render cycle.
   * Kept off by default since it installs an `afterRenderEffect` per row.
   */
  readonly emitRowRenderEvents = input(false, { transform: booleanAttribute });

  readonly stateChange = output<NatTableState>();
  readonly rowRendered = output<NatTableRowRenderedEvent>();

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

  protected readonly renderCycleToken = signal(0);
  protected readonly renderCycleStartedAt = signal(0);

  protected readonly sanitizedPageSizeOptions = computed(() => {
    const options = this.pageSizeOptions()
      .map((value) => Math.trunc(value))
      .filter((value) => value > 0);

    return options.length ? options : [...DEFAULT_PAGE_SIZE_OPTIONS];
  });
  private readonly defaultPageSize = computed(() => this.sanitizedPageSizeOptions()[0]);
  protected readonly mergedState = computed<NatTableState>(() => ({
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
  protected readonly showSearch = computed(() => this.enableGlobalFilter());
  protected readonly showVisibilityControls = computed(
    () => this.showColumnVisibility() && this.columnVisibilityOptions().length > 0,
  );
  protected readonly showTopControls = computed(
    () => this.showSearch() || this.showVisibilityControls(),
  );
  protected readonly showTableToolbar = computed(() => this.showPagination());
  /** Raw TanStack `Table<TData>` instance — exposed so companion controls can read derived state. */
  readonly table: Table<TData> = createAngularTable<TData>(() => ({
    data: this.readRequiredInput(this.data, []) as TData[],
    columns: this.readRequiredInput(this.columns, []) as ColumnDef<TData, unknown>[],
    state: this.mergedState(),
    enableMultiSort: false,
    enableColumnPinning: this.allowColumnPinning(),
    autoResetPageIndex: false,
    globalFilterFn: (this.globalFilterFn() ?? genericGlobalFilter) as FilterFn<TData>,
    getRowId: (row, index) => this.resolveRowId(row, index),
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
  private readonly tableRegionRef = viewChild<ElementRef<HTMLElement>>('tableRegion');
  private readonly containerWidth = signal(0);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly columnVisibilityOptions = computed(() =>
    this.table.getAllLeafColumns().filter((column) => column.getCanHide()),
  );
  private readonly nominalTableWidth = computed(() => this.table.getTotalSize());
  protected readonly totalTableWidth = computed(() => {
    const container = this.containerWidth();
    const nominal = this.nominalTableWidth();

    return container > 0 ? Math.max(nominal, container) : nominal;
  });
  private readonly scaleFactor = computed(() => {
    const container = this.containerWidth();
    const nominal = this.nominalTableWidth();

    if (container <= 0 || nominal <= 0 || container <= nominal) {
      return 1;
    }

    return container / nominal;
  });
  protected readonly visibleColumnCount = computed(() => this.table.getVisibleLeafColumns().length);
  protected readonly emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1));

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

    // Track render cycles for the row-render emitter. A "cycle" is any change
    // that might cause rows to re-paint. Both signals are consumed purely by
    // the internal emitter directive (and remain inert when emitRowRenderEvents
    // is disabled).
    effect(() => {
      if (!this.emitRowRenderEvents()) {
        this.renderCycleToken.set(0);
        this.renderCycleStartedAt.set(0);
        return;
      }

      this.readRequiredInput(this.data, []);
      this.table.getRowModel().rows;

      this.renderCycleStartedAt.set(performance.now());
      this.renderCycleToken.update((token) => token + 1);
    });

    afterNextRender(() => this.observeContainerWidth());
  }

  /**
   * Merge the given state patch into the table, honouring both controlled and
   * uncontrolled slices. Companion controls use this to drive the table from
   * the outside (e.g. a filter chip mutating `columnFilters`).
   */
  patchState(
    updaters: Partial<{
      [K in keyof NatTableState]: Updater<NatTableState[K]>;
    }>,
  ): void {
    this.updateState(updaters);
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
      pagination: () => ({
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
    return Math.round(column.getSize() * this.scaleFactor());
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

  protected getCellTone(cell: Cell<TData, unknown>): NatTableCellTone | null {
    return cell.column.columnDef.meta?.cellTone?.(cell.getContext()) ?? null;
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

  protected onRowRendered(event: NatTableRowRenderedEvent): void {
    this.rowRendered.emit(event);
  }

  private readonly firstPageUpdater: Updater<PaginationState> = (currentPagination) => ({
    ...currentPagination,
    pageIndex: 0,
  });

  private updateState(
    updaters: Partial<{
      [K in keyof NatTableState]: Updater<NatTableState[K]>;
    }>,
  ): void {
    const currentState = this.mergedState();
    const nextState: NatTableState = {
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

  private commitInternalState(nextState: NatTableState): void {
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

  private observeContainerWidth(): void {
    const element = this.tableRegionRef()?.nativeElement;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const width = Math.floor(entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);

      if (width !== this.containerWidth()) {
        this.containerWidth.set(width);
      }
    });

    observer.observe(element);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private resolveRowId(row: TData, index: number): string {
    const getRowId = this.getRowId();

    return getRowId ? getRowId(row, index) : String(index);
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

function isUnavailableRequiredInputError(error: unknown): error is Error & { code?: number } {
  return error instanceof Error && Math.abs((error as { code?: number }).code ?? 0) === 950;
}
