import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
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

type RenderHealthTone = 'idle' | 'fast' | 'watch' | 'slow';
type RowRenderTone = Exclude<RenderHealthTone, 'idle'>;
type RowRenderFilterValue = RowRenderTone | 'all';
type TableRowIdGetter<TData> = (row: TData, index: number) => string;

interface RowRenderMetric {
  durationMs: number;
  measuredAt: number;
  tone: RowRenderTone;
}

interface RenderFilterOption {
  value: RowRenderFilterValue;
  label: string;
  description: string;
}

interface RenderHealthState {
  label: string;
  tone: RenderHealthTone;
}

interface RenderMeasurement {
  durationMs: number;
  averageRowDurationMs: number;
  rowCount: number;
  visibleColumnCount: number;
  rowsPerSecond: number;
}

interface RowRenderMeasurementEvent {
  rowId: string;
  renderToken: number;
  durationMs: number;
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
const DEFAULT_TABLE_STATE: AdvancedTableState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnPinning: EMPTY_COLUMN_PINNING,
  pagination: DEFAULT_PAGINATION,
};
const DEFAULT_RENDER_MEASUREMENT: RenderMeasurement = {
  durationMs: 0,
  averageRowDurationMs: 0,
  rowCount: 0,
  visibleColumnCount: 0,
  rowsPerSecond: 0,
};
const RENDER_METRIC_COLUMN_ID = '__rowRenderMetric';
const RENDER_FILTER_OPTIONS: readonly RenderFilterOption[] = [
  {
    value: 'all',
    label: 'All rows',
    description: 'Latest sample',
  },
  {
    value: 'fast',
    label: 'Fast',
    description: 'Under 4 ms',
  },
  {
    value: 'watch',
    label: 'Watch',
    description: '4 to 8 ms',
  },
  {
    value: 'slow',
    label: 'Slow',
    description: 'Over 8 ms',
  },
] as const;
const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const integerFormatter = new Intl.NumberFormat('en-US');
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

@Directive({
  selector: 'tr[advancedTableRowMeter]',
})
export class AdvancedTableRowMeterDirective {
  readonly rowId = input.required<string>({
    alias: 'advancedTableRowMeter',
  });
  readonly renderToken = input.required<number>({
    alias: 'advancedTableRowRenderToken',
  });
  readonly renderStartedAt = input.required<number>({
    alias: 'advancedTableRowRenderStartedAt',
  });
  readonly enabled = input(false, {
    alias: 'advancedTableRowRenderEnabled',
    transform: booleanAttribute,
  });

  readonly advancedTableRowRendered = output<RowRenderMeasurementEvent>();

  private lastEmissionKey = '';

  constructor() {
    afterRenderEffect({
      read: () => {
        if (!this.enabled()) {
          return;
        }

        const rowId = this.rowId();
        const renderToken = this.renderToken();
        const renderStartedAt = this.renderStartedAt();

        if (renderToken <= 0 || renderStartedAt <= 0) {
          return;
        }

        const emissionKey = `${renderToken}:${rowId}`;

        if (this.lastEmissionKey === emissionKey) {
          return;
        }

        this.lastEmissionKey = emissionKey;
        this.advancedTableRowRendered.emit({
          rowId,
          renderToken,
          durationMs: roundToSingleDecimal(Math.max(performance.now() - renderStartedAt, 0.1)),
        });
      },
    });
  }
}

@Component({
  selector: 'advanced-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Grid, GridCell, GridCellWidget, GridRow, FlexRender, AdvancedTableRowMeterDirective],
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
  readonly enableRenderMetrics = input(false, { transform: booleanAttribute });
  readonly getRowId = input<TableRowIdGetter<TData> | undefined>(undefined);

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
  private readonly rowRenderMetrics = signal<Record<string, RowRenderMetric>>({});
  protected readonly renderMeasurement = signal<RenderMeasurement>(DEFAULT_RENDER_MEASUREMENT);
  protected readonly renderMeasurementToken = signal(0);
  protected readonly renderMeasurementStartedAt = signal(0);
  private readonly renderMetricFilterRevision = signal(0);
  private expectedMeasuredRowCount = 0;
  private measuredRowIds = new Set<string>();
  private shouldRefreshRenderMetricFilter = false;

  protected readonly renderFilterOptions = RENDER_FILTER_OPTIONS;
  protected readonly sanitizedPageSizeOptions = computed(() => {
    const options = this.pageSizeOptions()
      .map((value) => Math.trunc(value))
      .filter((value) => value > 0);

    return options.length ? options : [...DEFAULT_PAGE_SIZE_OPTIONS];
  });
  private readonly defaultPageSize = computed(() => this.sanitizedPageSizeOptions()[0]);
  private readonly resolvedColumnFilters = computed(() =>
    this.sanitizeColumnFilters(this.state().columnFilters ?? this.internalColumnFilters()),
  );
  protected readonly mergedState = computed<AdvancedTableState>(() => ({
    sorting: this.state().sorting ?? this.internalSorting(),
    globalFilter: this.enableGlobalFilter()
      ? (this.state().globalFilter ?? this.internalGlobalFilter())
      : '',
    columnFilters: this.resolvedColumnFilters(),
    columnVisibility: this.state().columnVisibility ?? this.internalColumnVisibility(),
    columnPinning: this.allowColumnPinning()
      ? (this.state().columnPinning ?? this.internalColumnPinning())
      : EMPTY_COLUMN_PINNING,
    pagination: this.state().pagination ?? this.internalPagination(),
  }));
  private readonly renderMetricColumn: ColumnDef<TData, unknown> = {
    id: RENDER_METRIC_COLUMN_ID,
    header: 'Render',
    size: 110,
    minSize: 80,
    meta: {
      label: 'Render',
      align: 'end',
    },
    enableGlobalFilter: false,
    enableHiding: false,
    enablePinning: false,
    enableSorting: false,
    filterFn: (row, _columnId, filterValue) => {
      const activeFilter = isRenderMetricFilterValue(filterValue) ? filterValue : 'all';

      if (!this.enableRenderMetrics() || activeFilter === 'all') {
        return true;
      }

      const metric = this.rowRenderMetrics()[row.id];

      if (!metric) {
        return true;
      }

      return metric.tone === activeFilter;
    },
    cell: (info) => this.getRowRenderMetricLabel(info.row.id),
  };
  private readonly resolvedColumns = computed<readonly ColumnDef<TData, unknown>[]>(() => {
    const columns = this.readRequiredInput(this.columns, []);

    if (!this.enableRenderMetrics()) {
      return columns;
    }

    return [...columns, this.renderMetricColumn];
  });
  protected readonly selectedRenderMetricFilter = computed<RowRenderFilterValue>(() => {
    if (!this.enableRenderMetrics()) {
      return 'all';
    }

    const activeFilter = this.mergedState().columnFilters.find(
      (entry) => entry.id === RENDER_METRIC_COLUMN_ID,
    );

    return isRenderMetricFilterValue(activeFilter?.value) ? activeFilter.value : 'all';
  });
  protected readonly showSearch = computed(() => this.enableGlobalFilter());
  protected readonly showVisibilityControls = computed(
    () => this.showColumnVisibility() && this.columnVisibilityOptions().length > 0,
  );
  protected readonly showRenderMetricControls = computed(() => this.enableRenderMetrics());
  protected readonly showTopControls = computed(
    () => this.showSearch() || this.showVisibilityControls() || this.showRenderMetricControls(),
  );
  protected readonly showTableToolbar = computed(
    () => this.showPagination() || this.enableRenderMetrics(),
  );
  protected readonly rowRenderHealth = computed<RenderHealthState>(() => {
    const measurement = this.renderMeasurement();

    if (!measurement.rowCount) {
      return {
        label: 'Idle',
        tone: 'idle',
      };
    }

    const tone = getRowRenderTone(measurement.durationMs);

    return {
      label: getRenderToneLabel(tone),
      tone,
    };
  });
  protected readonly renderFilterCaption = computed(() => {
    const measurement = this.renderMeasurement();

    if (!measurement.rowCount) {
      return 'Captures the latest row paint time for the current page.';
    }

    const rowLabel = measurement.rowCount === 1 ? 'row' : 'rows';

    return `${integerFormatter.format(measurement.rowCount)} visible ${rowLabel} sampled`;
  });
  protected readonly rowRenderSummary = computed(() => {
    const measurement = this.renderMeasurement();

    if (!measurement.rowCount) {
      return 'No visible rows in the current view.';
    }

    const rowLabel = measurement.rowCount === 1 ? 'row' : 'rows';
    const columnLabel = measurement.visibleColumnCount === 1 ? 'column' : 'columns';

    return `${integerFormatter.format(measurement.rowCount)} ${rowLabel} x ${integerFormatter.format(measurement.visibleColumnCount)} ${columnLabel} / ${decimalFormatter.format(measurement.averageRowDurationMs)} ms avg row / ${integerFormatter.format(measurement.rowsPerSecond)} rows/s`;
  });
  protected readonly rowRenderCompactSummary = computed(() => {
    const measurement = this.renderMeasurement();

    if (!measurement.rowCount) {
      return 'idle';
    }

    const rowLabel = measurement.rowCount === 1 ? 'row' : 'rows';

    return `${integerFormatter.format(measurement.rowCount)} ${rowLabel} sampled`;
  });
  protected readonly table: Table<TData> = createAngularTable<TData>(() => {
    if (this.selectedRenderMetricFilter() !== 'all') {
      this.renderMetricFilterRevision();
    }

    return {
      data: this.readRequiredInput(this.data, []) as TData[],
      columns: this.resolvedColumns() as ColumnDef<TData, unknown>[],
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
    };
  }) as Table<TData>;
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
        this.sanitizeColumnFilters(initialState.columnFilters ?? DEFAULT_TABLE_STATE.columnFilters),
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

    effect(() => {
      if (!this.enableRenderMetrics()) {
        this.renderMeasurement.set(DEFAULT_RENDER_MEASUREMENT);
        this.expectedMeasuredRowCount = 0;
        this.measuredRowIds = new Set<string>();
        this.shouldRefreshRenderMetricFilter = false;
        this.renderMeasurementToken.set(0);
        this.renderMeasurementStartedAt.set(0);
        return;
      }

      this.readRequiredInput(this.data, []);

      const visibleRows = this.table.getRowModel().rows;
      const visibleColumnCount = this.visibleColumnCount();

      this.expectedMeasuredRowCount = visibleRows.length;
      this.measuredRowIds = new Set<string>();
      this.shouldRefreshRenderMetricFilter = false;
      this.renderMeasurementStartedAt.set(performance.now());
      this.renderMeasurementToken.update((token) => token + 1);

      if (!visibleRows.length) {
        this.renderMeasurement.set({
          ...DEFAULT_RENDER_MEASUREMENT,
          visibleColumnCount,
        });
      }
    });

    afterNextRender(() => this.observeContainerWidth());
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

  protected setRenderMetricFilter(filterValue: RowRenderFilterValue): void {
    this.updateState({
      columnFilters: (currentFilters) =>
        upsertColumnFilter(
          currentFilters,
          RENDER_METRIC_COLUMN_ID,
          filterValue === 'all' ? null : filterValue,
        ),
      pagination: this.firstPageUpdater,
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

  protected isRenderMetricColumn(column: Column<TData, unknown>): boolean {
    return column.id === RENDER_METRIC_COLUMN_ID;
  }

  protected getRowRenderTone(rowId: string): RowRenderTone | 'pending' {
    return this.rowRenderMetrics()[rowId]?.tone ?? 'pending';
  }

  protected formatDecimal(value: number): string {
    return decimalFormatter.format(value);
  }

  protected recordRowRender(event: RowRenderMeasurementEvent): void {
    if (!this.enableRenderMetrics()) {
      return;
    }

    if (event.renderToken !== this.renderMeasurementToken()) {
      return;
    }

    if (this.measuredRowIds.has(event.rowId)) {
      return;
    }

    this.measuredRowIds.add(event.rowId);

    const previousMetric = this.rowRenderMetrics()[event.rowId];
    const nextMetric: RowRenderMetric = {
      durationMs: event.durationMs,
      measuredAt: Date.now(),
      tone: getRowRenderTone(event.durationMs),
    };

    this.rowRenderMetrics.update((currentMetrics) => ({
      ...currentMetrics,
      [event.rowId]: nextMetric,
    }));

    this.shouldRefreshRenderMetricFilter =
      this.shouldRefreshRenderMetricFilter ||
      previousMetric === undefined ||
      previousMetric.tone !== nextMetric.tone;

    if (this.measuredRowIds.size === this.expectedMeasuredRowCount) {
      this.finalizeRenderMeasurement();
    }
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
      columnFilters: this.sanitizeColumnFilters(
        this.resolveUpdater(currentState.columnFilters, updaters.columnFilters),
      ),
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

  private finalizeRenderMeasurement(): void {
    const currentMetrics = this.rowRenderMetrics();
    const durations = [...this.measuredRowIds]
      .map((rowId) => currentMetrics[rowId]?.durationMs ?? 0)
      .filter((durationMs) => durationMs > 0);
    const totalDurationMs = durations.length ? Math.max(...durations) : 0;
    const averageRowDurationMs = durations.length
      ? roundToSingleDecimal(
          durations.reduce((total, durationMs) => total + durationMs, 0) / durations.length,
        )
      : 0;

    this.renderMeasurement.set({
      durationMs: roundToSingleDecimal(totalDurationMs),
      averageRowDurationMs,
      rowCount: this.expectedMeasuredRowCount,
      visibleColumnCount: this.visibleColumnCount(),
      rowsPerSecond:
        totalDurationMs > 0
          ? Math.round((this.expectedMeasuredRowCount * 1000) / totalDurationMs)
          : 0,
    });

    if (this.selectedRenderMetricFilter() !== 'all' && this.shouldRefreshRenderMetricFilter) {
      this.renderMetricFilterRevision.update((revision) => revision + 1);
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

  private sanitizeColumnFilters(columnFilters: ColumnFiltersState): ColumnFiltersState {
    if (this.enableRenderMetrics()) {
      return columnFilters;
    }

    return columnFilters.filter((filter) => filter.id !== RENDER_METRIC_COLUMN_ID);
  }

  private getRowRenderMetricLabel(rowId: string): string {
    const metric = this.rowRenderMetrics()[rowId];

    if (!metric) {
      return 'Pending';
    }

    return `${decimalFormatter.format(metric.durationMs)} ms`;
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

function getRenderToneLabel(tone: RenderHealthTone): string {
  switch (tone) {
    case 'fast':
      return 'Fast';
    case 'watch':
      return 'Watch';
    case 'slow':
      return 'Slow';
    case 'idle':
      return 'Idle';
  }
}

function getRowRenderTone(durationMs: number): RowRenderTone {
  if (durationMs < 4) {
    return 'fast';
  }

  if (durationMs <= 8) {
    return 'watch';
  }

  return 'slow';
}

function upsertColumnFilter(
  currentFilters: ColumnFiltersState,
  columnId: string,
  value: unknown | null,
): ColumnFiltersState {
  const nextFilters = currentFilters.filter((filter) => filter.id !== columnId);

  if (value === null) {
    return nextFilters;
  }

  return [...nextFilters, { id: columnId, value }];
}

function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1));
}

function isRenderMetricFilterValue(value: unknown): value is RowRenderFilterValue {
  return value === 'all' || value === 'fast' || value === 'watch' || value === 'slow';
}

function isUnavailableRequiredInputError(error: unknown): error is Error & { code?: number } {
  return error instanceof Error && Math.abs((error as { code?: number }).code ?? 0) === 950;
}
