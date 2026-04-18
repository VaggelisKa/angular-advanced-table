import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
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
import type { TemplateRef } from '@angular/core';
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
import type {
  NatTableCellTone,
  NatTableSortIndicatorContext,
  NatTableState,
} from './table.types';

type TableRowIdGetter<TData> = (row: TData, index: number) => string;

interface PinOffsets {
  left: Record<string, number>;
  right: Record<string, number>;
}

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

/**
 * Signals-first data table wrapper around TanStack Table with built-in global
 * search, column visibility controls, pagination, and sticky column pinning.
 *
 * Consumers configure the table by passing TanStack column definitions and
 * row data, then optionally control individual state slices through `state`
 * and `stateChange`.
 */
@Component({
  selector: 'nat-table',
  exportAs: 'natTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Grid,
    GridCell,
    GridCellWidget,
    GridRow,
    FlexRender,
    NatTableRowRenderEmitter,
    NgTemplateOutlet,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class NatTable<TData extends RowData = RowData> {
  /** Row data rendered by the table. */
  readonly data = input.required<readonly TData[]>();
  /** TanStack column definitions for the current row type. */
  readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  /** Accessible name announced for the table region. */
  readonly ariaLabel = input.required<string>();

  /** Allowed page sizes. Invalid entries are ignored and defaults are restored when empty. */
  readonly pageSizeOptions = input<readonly number[]>(DEFAULT_PAGE_SIZE_OPTIONS);
  /** Enables the built-in global search field and filter pipeline. */
  readonly enableGlobalFilter = input(true, { transform: booleanAttribute });
  /** Accessible label for the global search input. */
  readonly searchLabel = input('Search rows');
  /** Placeholder text shown in the global search input. */
  readonly searchPlaceholder = input('Search rows');
  /** Shows the built-in column visibility menu when hideable columns exist. */
  readonly showColumnVisibility = input(true, { transform: booleanAttribute });
  /** Enables client-side pagination controls and paginated row models. */
  readonly showPagination = input(true, { transform: booleanAttribute });
  /** Enables sticky left/right column pinning controls. */
  readonly allowColumnPinning = input(true, { transform: booleanAttribute });
  /** Message rendered when the current view contains no rows. */
  readonly emptyStateLabel = input('No rows match the current view.');
  /** Optional override for the global filter implementation. */
  readonly globalFilterFn = input<FilterFn<TData> | undefined>(undefined);
  /** Optional template used to render the sort indicator inside the header button. */
  readonly sortIndicatorTemplate = input<
    TemplateRef<NatTableSortIndicatorContext<TData>> | undefined
  >(undefined);
  /** Initial uncontrolled state applied once during the first render. */
  readonly initialState = input<Partial<NatTableState>>({});
  /**
   * Controlled state slices supplied by the consumer.
   *
   * Any property omitted from this object remains unmanaged and is updated
   * internally by the table.
   */
  readonly state = input<Partial<NatTableState>>({});
  /** Optional stable row id resolver used for selection, pinning, and events. */
  readonly getRowId = input<TableRowIdGetter<TData> | undefined>(undefined);
  /**
   * When `true`, emits one `rowRendered` event per body row per render cycle.
   * Kept off by default since it installs an `afterRenderEffect` per row.
   */
  readonly emitRowRenderEvents = input(false, { transform: booleanAttribute });

  /** Emits the full next state whenever the table updates any state slice. */
  readonly stateChange = output<NatTableState>();
  /** Emits per-row paint timings when `emitRowRenderEvents` is enabled. */
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
  /**
   * Raw TanStack `Table<TData>` instance.
   *
   * Exposed so companion controls and advanced consumers can read derived
   * state and invoke TanStack APIs directly.
   */
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
  private readonly measuredHeaderWidths = signal<Record<string, number>>({});
  private readonly destroyRef = inject(DestroyRef);
  private headerResizeObserver: ResizeObserver | null = null;

  protected readonly columnVisibilityOptions = computed(() =>
    this.table.getAllLeafColumns().filter((column) => column.getCanHide()),
  );
  /**
   * Intrinsic floor per column. `table-layout: auto` uses these as a lower
   * bound so columns never collapse below what the consumer considers
   * readable, while still letting content drive the actual width.
   */
  protected readonly columnMinWidths = computed<Record<string, number>>(() => {
    const result: Record<string, number> = {};

    for (const column of this.table.getVisibleLeafColumns()) {
      result[column.id] = Math.max(Math.round(column.getSize()), 1);
    }

    return result;
  });
  /**
   * Width per column used to compute pinned sticky offsets. Prefers the real
   * post-layout width reported by `ResizeObserver`; falls back to the TanStack
   * size hint when no measurement exists yet (initial paint, SSR, jsdom).
   */
  private readonly resolvedColumnWidths = computed<Record<string, number>>(() => {
    const measured = this.measuredHeaderWidths();
    const result: Record<string, number> = {};

    for (const column of this.table.getVisibleLeafColumns()) {
      const measuredWidth = measured[column.id];
      result[column.id] =
        measuredWidth !== undefined && measuredWidth > 0
          ? measuredWidth
          : Math.max(Math.round(column.getSize()), 1);
    }

    return result;
  });
  private readonly pinOffsets = computed<PinOffsets>(() => {
    const widths = this.resolvedColumnWidths();
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};
    let leftOffset = 0;

    for (const column of this.table.getLeftVisibleLeafColumns()) {
      left[column.id] = leftOffset;
      leftOffset += widths[column.id] ?? 0;
    }

    let rightOffset = 0;

    for (const column of [...this.table.getRightVisibleLeafColumns()].reverse()) {
      right[column.id] = rightOffset;
      rightOffset += widths[column.id] ?? 0;
    }

    return { left, right };
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

    afterNextRender(() => this.initializeHeaderObservation());
    // Re-attach the ResizeObserver to the current set of header cells after
    // every render. Column visibility, pinning, and visible-leaf changes swap
    // out the <th> nodes we need to observe; doing this inside a render
    // effect keeps it coupled to the DOM's actual shape rather than to a
    // synthetic "layout" signal.
    afterRenderEffect(() => {
      // Subscribe to leaf-column identity so the effect re-runs when the
      // visible set changes, not merely when unrelated state updates.
      this.columnVisibilityOptions();
      this.visibleColumnCount();
      this.reattachHeaderObservers();
    });

    this.destroyRef.onDestroy(() => this.headerResizeObserver?.disconnect());
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
    return column.getIsPinned() === 'left' ? (this.pinOffsets().left[column.id] ?? 0) : null;
  }

  protected getPinnedRight(column: Column<TData, unknown>): number | null {
    return column.getIsPinned() === 'right' ? (this.pinOffsets().right[column.id] ?? 0) : null;
  }

  protected getColumnMinWidth(column: Column<TData, unknown>): number {
    return this.columnMinWidths()[column.id] ?? Math.max(Math.round(column.getSize()), 1);
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

  protected getAriaSort(column: Column<TData, unknown>): 'ascending' | 'descending' | 'none' {
    const sortState = column.getIsSorted();

    if (sortState === 'asc') {
      return 'ascending';
    }

    if (sortState === 'desc') {
      return 'descending';
    }

    return 'none';
  }

  protected getSortIndicatorContext(
    column: Column<TData, unknown>,
  ): NatTableSortIndicatorContext<TData> {
    const sortState = column.getIsSorted();

    return {
      $implicit: sortState,
      sortState,
      ariaSort: this.getAriaSort(column),
      column,
      label: this.getColumnLabel(column),
    };
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

  private initializeHeaderObservation(): void {
    if (typeof ResizeObserver === 'undefined' || this.headerResizeObserver) {
      return;
    }

    this.headerResizeObserver = new ResizeObserver(() => this.measureHeaderWidths());
    this.reattachHeaderObservers();
  }

  private reattachHeaderObservers(): void {
    const observer = this.headerResizeObserver;
    const region = this.tableRegionRef()?.nativeElement;

    if (!observer || !region) {
      return;
    }

    observer.disconnect();

    const headerCells = region.querySelectorAll<HTMLTableCellElement>('thead th[data-column-id]');

    for (const cell of headerCells) {
      observer.observe(cell);
    }

    this.measureHeaderWidths();
  }

  private measureHeaderWidths(): void {
    const region = this.tableRegionRef()?.nativeElement;

    if (!region) {
      return;
    }

    const headerCells = region.querySelectorAll<HTMLTableCellElement>('thead th[data-column-id]');
    const next: Record<string, number> = {};

    for (const cell of headerCells) {
      const columnId = cell.dataset['columnId'];

      if (!columnId) {
        continue;
      }

      next[columnId] = cell.getBoundingClientRect().width;
    }

    if (hasSameWidths(this.measuredHeaderWidths(), next)) {
      return;
    }

    this.measuredHeaderWidths.set(next);
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

function hasSameWidths(left: Record<string, number>, right: Record<string, number>): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
}
