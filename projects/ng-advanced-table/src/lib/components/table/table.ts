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
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import {
  FlexRender,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type CellContext,
  type Column,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnDef,
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

interface TableColumnAccessibilityState {
  id: string;
  label: string;
  visible: boolean;
}

interface TableColumnRenderState {
  alignEnd: boolean;
  pinnedLeft: boolean;
  pinnedRight: boolean;
  hasPinnedEdgeLeft: boolean;
  hasPinnedEdgeRight: boolean;
  left: number | null;
  right: number | null;
  minWidth: number;
  ariaSort: 'ascending' | 'descending' | null;
  rowHeader: boolean;
}

interface TableAccessibilitySnapshot {
  sortingKey: string;
  globalFilter: string;
  columnFiltersKey: string;
  pagination: PaginationState;
  pageCount: number;
  visibleRows: number;
  totalRows: number;
  columns: TableColumnAccessibilityState[];
}

const EMPTY_COLUMN_PINNING: ColumnPinningState = {
  left: [],
  right: [],
};
const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};
const DEFAULT_TABLE_STATE: NatTableState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnPinning: EMPTY_COLUMN_PINNING,
  pagination: DEFAULT_PAGINATION,
};
let nextTableId = 0;

const genericGlobalFilter: FilterFn<RowData> = (row, columnId, filterValue) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase();

  if (!query) {
    return true;
  }

  return matchesFilterQuery(row.getValue(columnId), query) || matchesFilterQuery(row.id, query);
};

/**
 * Signals-first Angular table primitive built on TanStack Table.
 *
 * The core component renders the table structure only. Optional controls,
 * header actions, and themed surfaces live in companion packages.
 */
@Component({
  selector: 'nat-table',
  exportAs: 'natTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Grid, GridCell, GridRow, FlexRender, NatTableRowRenderEmitter],
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
  /** Optional supplemental description announced when the grid receives focus. */
  readonly ariaDescription = input('');
  /** Instructions announced to screen readers for grid navigation. */
  readonly keyboardInstructions = input(
    'Use arrow keys to move between cells. Use Tab to move into controls within a cell.',
  );

  /** Enables the global filter pipeline for companion search controls. */
  readonly enableGlobalFilter = input(true, { transform: booleanAttribute });
  /** Enables sticky column pinning where the column allows it. */
  readonly allowColumnPinning = input(true, { transform: booleanAttribute });
  /** Enables client-side pagination row models when external UI drives pagination state. */
  readonly enablePagination = input(false, { transform: booleanAttribute });
  /** Message rendered when the current view contains no rows. */
  readonly emptyStateLabel = input('No rows match the current view.');
  /** Optional override for the global filter implementation. */
  readonly globalFilterFn = input<FilterFn<TData> | undefined>(undefined);
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
  /** Enables polite live announcements for sort/filter/pagination changes. */
  readonly enableAnnouncements = input(true, { transform: booleanAttribute });

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
  protected readonly liveMessage = signal('');
  protected readonly generatedTableId = `nat-table-${nextTableId++}`;
  protected readonly tableSummaryId = `${this.generatedTableId}-summary`;
  protected readonly tableDescriptionId = `${this.generatedTableId}-description`;
  protected readonly tableKeyboardInstructionsId = `${this.generatedTableId}-instructions`;
  private lastAccessibilitySnapshot: TableAccessibilitySnapshot | null = null;

  protected readonly renderCycleToken = signal(0);
  protected readonly renderCycleStartedAt = signal(0);

  protected readonly headerGroups = computed(() => this.table.getHeaderGroups());
  protected readonly bodyRows = computed(() => this.table.getRowModel().rows);
  private readonly allLeafColumns = computed(() => this.table.getAllLeafColumns());
  protected readonly visibleColumns = computed(() => this.table.getVisibleLeafColumns());
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
  protected readonly visibleColumnCount = computed(() => this.visibleColumns().length);
  protected readonly visibleRowCount = computed(() => this.bodyRows().length);
  protected readonly totalRowCount = computed(() => this.readRequiredInput(this.data, []).length);
  protected readonly pageCount = computed(() =>
    this.enablePagination() ? Math.max(this.table.getPageCount(), 1) : 1,
  );
  protected readonly visibleColumnIds = computed(() =>
    this.visibleColumns()
      .map((column) => column.id)
      .join('|'),
  );
  protected readonly emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1));
  protected readonly tableSummary = computed(() => this.buildTableSummary());
  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [this.tableSummaryId];

    if (this.ariaDescription().trim()) {
      ids.push(this.tableDescriptionId);
    }

    if (this.keyboardInstructions().trim()) {
      ids.push(this.tableKeyboardInstructionsId);
    }

    return ids.join(' ');
  });
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
    getPaginationRowModel: this.enablePagination() ? getPaginationRowModel() : undefined,
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

  /**
   * Width per column used to compute pinned sticky offsets. Prefers the real
   * post-layout width reported by `ResizeObserver`; falls back to the TanStack
   * size hint when no measurement exists yet (initial paint, SSR, jsdom).
   */
  private readonly resolvedColumnWidths = computed<Record<string, number>>(() => {
    const measured = this.measuredHeaderWidths();
    const result: Record<string, number> = {};

    for (const column of this.visibleColumns()) {
      const measuredWidth = measured[column.id];
      result[column.id] =
        measuredWidth !== undefined && measuredWidth > 0
          ? measuredWidth
          : Math.max(Math.round(column.getSize()), 1);
    }

    return result;
  });
  protected readonly columnRenderStates = computed<Record<string, TableColumnRenderState>>(() => {
    const visibleColumns = this.visibleColumns();
    const widths = this.resolvedColumnWidths();
    const state = this.mergedState();
    const visibleColumnsById = new Map(visibleColumns.map((column) => [column.id, column] as const));
    const leftVisibleColumns = (state.columnPinning.left ?? [])
      .map((columnId) => visibleColumnsById.get(columnId))
      .filter((column): column is Column<TData, unknown> => !!column);
    const rightVisibleColumns = (state.columnPinning.right ?? [])
      .map((columnId) => visibleColumnsById.get(columnId))
      .filter((column): column is Column<TData, unknown> => !!column);
    const leftPinnedIds = new Set(leftVisibleColumns.map((column) => column.id));
    const rightPinnedIds = new Set(rightVisibleColumns.map((column) => column.id));
    const activeSorting = state.sorting[0];
    const leftOffsets: Record<string, number> = {};
    const rightOffsets: Record<string, number> = {};
    const result: Record<string, TableColumnRenderState> = {};
    let leftOffset = 0;

    for (const column of leftVisibleColumns) {
      leftOffsets[column.id] = leftOffset;
      leftOffset += widths[column.id] ?? 0;
    }

    let rightOffset = 0;

    for (let index = rightVisibleColumns.length - 1; index >= 0; index -= 1) {
      const column = rightVisibleColumns[index];

      rightOffsets[column.id] = rightOffset;
      rightOffset += widths[column.id] ?? 0;
    }

    for (const column of visibleColumns) {
      const minWidth = Math.max(Math.round(column.getSize()), 1);
      const pinnedLeft = leftPinnedIds.has(column.id);
      const pinnedRight = rightPinnedIds.has(column.id);

      result[column.id] = {
        alignEnd: column.columnDef.meta?.align === 'end',
        pinnedLeft,
        pinnedRight,
        hasPinnedEdgeLeft: pinnedLeft && leftVisibleColumns.at(-1)?.id === column.id,
        hasPinnedEdgeRight: pinnedRight && rightVisibleColumns[0]?.id === column.id,
        left: pinnedLeft ? (leftOffsets[column.id] ?? 0) : null,
        right: pinnedRight ? (rightOffsets[column.id] ?? 0) : null,
        minWidth,
        ariaSort:
          activeSorting?.id === column.id
            ? activeSorting.desc
              ? 'descending'
              : 'ascending'
            : null,
        rowHeader: !!column.columnDef.meta?.rowHeader,
      };
    }

    return result;
  });

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
        pageSize: initialState.pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize,
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

      this.bodyRows();

      this.renderCycleStartedAt.set(performance.now());
      this.renderCycleToken.update((token) => token + 1);
    });

    effect(() => {
      if (!this.hasSeededInitialState()) {
        return;
      }

      const snapshot = this.captureAccessibilitySnapshot();
      const previousSnapshot = this.lastAccessibilitySnapshot;

      this.lastAccessibilitySnapshot = snapshot;

      if (!previousSnapshot || !this.enableAnnouncements()) {
        return;
      }

      const message = this.describeAccessibilityChange(previousSnapshot, snapshot);

      if (message) {
        this.announce(message);
      }
    });

    afterNextRender(() => this.initializeHeaderObservation());
    afterRenderEffect(() => {
      this.visibleColumnIds();
      this.reattachHeaderObservers();
    });

    this.destroyRef.onDestroy(() => this.headerResizeObserver?.disconnect());
  }

  /**
   * Merge the given state patch into the table, honouring both controlled and
   * uncontrolled slices. Companion controls use this to drive the table from
   * the outside (e.g. search, pager, or synthetic filters).
   */
  patchState(
    updaters: Partial<{
      [K in keyof NatTableState]: Updater<NatTableState[K]>;
    }>,
  ): void {
    this.updateState(updaters);
  }

  tableElementId(): string {
    return this.generatedTableId;
  }

  protected getCellTone(
    column: Column<TData, unknown>,
    context: CellContext<TData, unknown>,
  ): NatTableCellTone | null {
    return column.columnDef.meta?.cellTone?.(context) ?? null;
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

  private buildTableSummary(): string {
    const state = this.mergedState();
    const visibleRows = this.visibleRowCount();
    const totalRows = this.totalRowCount();
    const visibleColumns = this.visibleColumnCount();
    const pageCount = this.pageCount();
    const currentPage = state.pagination.pageIndex + 1;
    const hasFilters = !!state.globalFilter.trim() || state.columnFilters.length > 0;

    let summary =
      visibleRows === 0
        ? `No rows are currently shown. ${visibleColumns} visible ${pluralize('column', visibleColumns)}.`
        : hasFilters && totalRows !== visibleRows
          ? `Showing ${visibleRows} of ${totalRows} ${pluralize('row', totalRows)} across ${visibleColumns} visible ${pluralize('column', visibleColumns)}.`
          : `Showing ${visibleRows} ${pluralize('row', visibleRows)} across ${visibleColumns} visible ${pluralize('column', visibleColumns)}.`;

    if (this.enablePagination()) {
      summary += ` Page ${currentPage} of ${pageCount}.`;
    }

    return summary;
  }

  private captureAccessibilitySnapshot(): TableAccessibilitySnapshot {
    const state = this.mergedState();

    return {
      sortingKey: serializeSorting(state.sorting),
      globalFilter: state.globalFilter.trim(),
      columnFiltersKey: serializeColumnFilters(state.columnFilters),
      pagination: state.pagination,
      pageCount: this.pageCount(),
      visibleRows: this.visibleRowCount(),
      totalRows: this.totalRowCount(),
      columns: this.allLeafColumns().map((column) => ({
        id: column.id,
        label: resolveColumnLabel(column),
        visible: column.getIsVisible(),
      })),
    };
  }

  private describeAccessibilityChange(
    previous: TableAccessibilitySnapshot,
    next: TableAccessibilitySnapshot,
  ): string | null {
    if (previous.sortingKey !== next.sortingKey) {
      return this.describeSortingChange(next);
    }

    if (
      previous.globalFilter !== next.globalFilter ||
      previous.columnFiltersKey !== next.columnFiltersKey
    ) {
      return this.describeFilteringChange(next);
    }

    if (!hasSameColumnVisibility(previous.columns, next.columns)) {
      return this.describeColumnVisibilityChange(previous.columns, next.columns);
    }

    if (previous.pagination.pageSize !== next.pagination.pageSize) {
      return `Showing ${next.pagination.pageSize} ${pluralize('row', next.pagination.pageSize)} per page. Page ${next.pagination.pageIndex + 1} of ${next.pageCount}.`;
    }

    if (previous.pagination.pageIndex !== next.pagination.pageIndex) {
      return `Page ${next.pagination.pageIndex + 1} of ${next.pageCount}. ${next.visibleRows} ${pluralize('row', next.visibleRows)} shown.`;
    }

    return null;
  }

  private describeSortingChange(snapshot: TableAccessibilitySnapshot): string {
    const sorting = this.mergedState().sorting[0];

    if (!sorting) {
      return 'Sorting cleared.';
    }

    const label =
      snapshot.columns.find((column) => column.id === sorting.id)?.label ?? 'current column';
    const direction = sorting.desc ? 'descending' : 'ascending';

    return `Sorted by ${label} ${direction}.`;
  }

  private describeFilteringChange(snapshot: TableAccessibilitySnapshot): string {
    const query = snapshot.globalFilter;

    if (snapshot.visibleRows === 0) {
      return query ? `No rows match "${query}".` : 'No rows match the current filters.';
    }

    if (query) {
      return `Showing ${snapshot.visibleRows} matching ${pluralize('row', snapshot.visibleRows)} for "${query}".`;
    }

    if (snapshot.columnFiltersKey) {
      return `Showing ${snapshot.visibleRows} filtered ${pluralize('row', snapshot.visibleRows)}.`;
    }

    return `Showing all ${snapshot.visibleRows} ${pluralize('row', snapshot.visibleRows)}.`;
  }

  private describeColumnVisibilityChange(
    previous: readonly TableColumnAccessibilityState[],
    next: readonly TableColumnAccessibilityState[],
  ): string {
    const changedColumns = next.filter((column) => {
      const previousColumn = previous.find((candidate) => candidate.id === column.id);

      return previousColumn && previousColumn.visible !== column.visible;
    });
    const visibleCount = next.filter((column) => column.visible).length;

    if (changedColumns.length === 1) {
      const [column] = changedColumns;

      return `${column.label} column ${column.visible ? 'shown' : 'hidden'}. ${visibleCount} visible ${pluralize('column', visibleCount)}.`;
    }

    return `${visibleCount} visible ${pluralize('column', visibleCount)}.`;
  }

  private announce(message: string): void {
    this.liveMessage.set('');
    queueMicrotask(() => this.liveMessage.set(message));
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

function resolveColumnLabel<TData extends RowData>(column: Column<TData, unknown>): string {
  const metaLabel = column.columnDef.meta?.label;

  if (metaLabel) {
    return metaLabel;
  }

  if (typeof column.columnDef.header === 'string') {
    return column.columnDef.header;
  }

  const accessorKey = (column.columnDef as { accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : column.id || 'Column';
}

function serializeSorting(sorting: SortingState): string {
  return sorting.map((entry) => `${entry.id}:${entry.desc ? 'desc' : 'asc'}`).join('|');
}

function serializeColumnFilters(columnFilters: ColumnFiltersState): string {
  return columnFilters.map((entry) => `${entry.id}:${JSON.stringify(entry.value)}`).join('|');
}

function hasSameColumnVisibility(
  current: readonly TableColumnAccessibilityState[],
  next: readonly TableColumnAccessibilityState[],
): boolean {
  if (current.length !== next.length) {
    return false;
  }

  return current.every(
    (column, index) =>
      column.id === next[index]?.id &&
      column.label === next[index]?.label &&
      column.visible === next[index]?.visible,
  );
}

function pluralize(noun: string, count: number): string {
  return count === 1 ? noun : `${noun}s`;
}
