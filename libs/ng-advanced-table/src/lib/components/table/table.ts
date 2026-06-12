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
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import {
  FlexRender,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Cell,
  type CellContext,
  type Column,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnDef,
  type FilterFn,
  type Header,
  type HeaderGroup,
  type PaginationState,
  type Row,
  type RowData,
  type SortingState,
  type Table,
  type Updater,
  type VisibilityState,
} from '@tanstack/angular-table';

import type { NatTableRowRenderedEvent } from './events';
import { NatTableRowRenderEmitter } from './row-render-emitter.directive';
import {
  formatNatTableIntlNumber,
  mergeNatTableAccessibilityText,
  NAT_TABLE_ENGLISH_LOCALE,
  NAT_TABLE_INTL,
  resolveNatTableIntl,
} from './table-intl';
import type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySummaryContext,
  NatTableAccessibilityText,
  NatTableCellTone,
  NatTableRowActivateEvent,
  NatTableRowIdGetter,
  NatTableState,
} from './table.types';
type ColumnReorderZone = 'left' | 'center' | 'right';
interface TableColumnAccessibilityState {
  id: string;
  label: string;
  visible: boolean;
}

interface TableColumnRenderState {
  label: string;
  hiddenHeaderLabel: string | null;
  alignEnd: boolean;
  pinnedLeft: boolean;
  pinnedRight: boolean;
  hasPinnedEdgeLeft: boolean;
  hasPinnedEdgeRight: boolean;
  left: number | null;
  right: number | null;
  width: string | null;
  minWidth: string | null;
  maxWidth: string | null;
  constrainedWidth: boolean;
  headerWidth: string | null;
  headerMinWidth: string | null;
  headerMaxWidth: string | null;
  headerConstrainedWidth: boolean;
  ariaSort: 'ascending' | 'descending' | null;
  rowHeader: boolean;
}

interface TableColumnSizingState {
  hasSize: boolean;
  hasMinSize: boolean;
  hasMaxSize: boolean;
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
const DEFAULT_COLUMN_ORDER: ColumnOrderState = [];
const DEFAULT_TABLE_STATE: NatTableState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnOrder: DEFAULT_COLUMN_ORDER,
  columnPinning: EMPTY_COLUMN_PINNING,
  pagination: DEFAULT_PAGINATION,
};
const ROW_ACTIVATE_INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [contenteditable="true"], ' +
  '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], ' +
  '[role="menuitemcheckbox"], [role="menuitemradio"], [role="tab"], [role="switch"], ' +
  '[role="combobox"], [role="textbox"], [role="searchbox"]';
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
  imports: [Grid, GridCell, GridRow, CdkDropList, CdkDrag, FlexRender, NatTableRowRenderEmitter],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class NatTable<TData extends RowData = RowData> {
  /** Row data rendered by the table. */
  readonly data = input.required<readonly TData[]>();
  /** TanStack column definitions for the current row type. */
  readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  /** Required accessible name announced for the grid when no visible caption is rendered. */
  readonly accessibleName = input.required<string>();
  /** Visible table caption. When present, it provides the grid's accessible name. */
  readonly caption = input<string | undefined>(undefined);
  /** Locale id used to resolve generated table accessibility copy. */
  readonly locale = input<string | undefined>(undefined);
  /** Optional accessibility copy and live-announcement formatters. */
  readonly accessibilityText = input<NatTableAccessibilityText>({});

  /** Enables the global filter pipeline for companion search controls. */
  readonly enableGlobalFilter = input(true, { transform: booleanAttribute });
  /** Enables sticky column pinning where the column allows it. */
  readonly enableColumnPinning = input(true, { transform: booleanAttribute });
  /** Enables drag-and-drop and keyboard reordering for leaf header cells. */
  readonly enableColumnReorder = input(false, { transform: booleanAttribute });
  /** Enables client-side pagination row models when external UI drives pagination state. */
  readonly enablePagination = input(false, { transform: booleanAttribute });
  /** Optional override for the global filter implementation. */
  readonly globalFilterFn = input<FilterFn<TData>>();
  /**
   * One-time uncontrolled seed for state slices.
   *
   * Ignored for slices also present in `state`. After the first render, use
   * `(stateChange)` or granular `*Change` outputs instead.
   */
  readonly initialState = input<Partial<NatTableState>>({});
  /**
   * Controlled state slices. A slice is controlled when its key is present
   * here, even if the value is empty. Omitted keys stay internal.
   *
   * Update controlled slices via the matching `*Change` output (or
   * `(stateChange)`) and flow the value back in. Pass only the slices you
   * own; echoing the full `(stateChange)` payload controls every slice.
   */
  readonly state = input<Partial<NatTableState>>({});
  /** Optional stable row id resolver used for selection, pinning, and events. */
  readonly getRowId = input<NatTableRowIdGetter<TData>>();
  /** Emits one `rowRendered` event per body row per cycle. Off by default (adds an `afterRenderEffect` per row). */
  readonly emitRowRenderEvents = input(false, { transform: booleanAttribute });
  /** Enables polite live announcements for sort/filter/pagination changes. */
  readonly enableAnnouncements = input(true, { transform: booleanAttribute });
  /** Enables sticky positioning for the table header row. */
  readonly stickyHeader = input(true, { transform: booleanAttribute });

  /** Full normalized state whenever any slice changes, including uncontrolled slices. Prefer granular `*Change` outputs when you only need one slice. */
  readonly stateChange = output<NatTableState>();
  /** Emits the next sorting state when it actually changes. */
  readonly sortingChange = output<SortingState>();
  /** Emits the next global filter query when it actually changes. */
  readonly globalFilterChange = output<string>();
  /** Emits the next column filter list when it actually changes. */
  readonly columnFiltersChange = output<ColumnFiltersState>();
  /** Emits the next column visibility map when it actually changes. */
  readonly columnVisibilityChange = output<VisibilityState>();
  /** Emits the next leaf column order when it actually changes. */
  readonly columnOrderChange = output<ColumnOrderState>();
  /** Emits the next column pinning state when it actually changes. */
  readonly columnPinningChange = output<ColumnPinningState>();
  /** Emits the next pagination state when it actually changes. */
  readonly paginationChange = output<PaginationState>();
  /** Emits per-row paint timings when `emitRowRenderEvents` is enabled. */
  readonly rowRendered = output<NatTableRowRenderedEvent>();
  /** Emits on row click or Enter/Space unless the event started on an interactive descendant. */
  readonly rowActivate = output<NatTableRowActivateEvent<TData>>();

  private readonly internalSorting = signal<SortingState>(DEFAULT_TABLE_STATE.sorting);
  private readonly internalGlobalFilter = signal(DEFAULT_TABLE_STATE.globalFilter);
  private readonly internalColumnFilters = signal<ColumnFiltersState>(
    DEFAULT_TABLE_STATE.columnFilters,
  );
  private readonly internalColumnVisibility = signal<VisibilityState>(
    DEFAULT_TABLE_STATE.columnVisibility,
  );
  private readonly internalColumnOrder = signal<ColumnOrderState>(DEFAULT_TABLE_STATE.columnOrder);
  private readonly internalColumnPinning = signal<ColumnPinningState>(
    DEFAULT_TABLE_STATE.columnPinning,
  );
  private readonly internalPagination = signal<PaginationState>(DEFAULT_TABLE_STATE.pagination);
  private readonly hasSeededInitialState = signal(false);
  protected readonly liveMessage = signal('');
  /** Stable DOM id for the rendered `<table>` element. */
  readonly tableElementId = signal(`nat-table-${nextTableId++}`);
  protected readonly tableCaptionId = computed(() => `${this.tableElementId()}-caption`);
  protected readonly tableSummaryId = computed(() => `${this.tableElementId()}-summary`);
  protected readonly tableDescriptionId = computed(() => `${this.tableElementId()}-description`);
  protected readonly tableKeyboardInstructionsId = computed(
    () => `${this.tableElementId()}-instructions`,
  );
  private readonly tableIntlConfig = inject(NAT_TABLE_INTL);
  private lastAccessibilitySnapshot: TableAccessibilitySnapshot | null = null;
  /** Current locale id resolved from the `locale` input or built-in English default. */
  readonly localeId = computed(() => this.locale() ?? NAT_TABLE_ENGLISH_LOCALE);
  private readonly tableIntl = computed(() =>
    resolveNatTableIntl(this.tableIntlConfig, this.localeId()),
  );

  protected readonly renderCycleToken = signal(0);
  protected readonly renderCycleStartedAt = signal(0);
  private readonly allLeafColumnIds = computed(() =>
    getColumnDefLeafIds(this.readRequiredInput(this.columns, [])),
  );
  private readonly userColumnSizing = computed(() =>
    getUserColumnSizing(this.readRequiredInput(this.columns, [])),
  );
  private readonly resolvedColumnOrder = computed(() =>
    normalizeColumnOrder(
      this.state().columnOrder ?? this.internalColumnOrder(),
      this.allLeafColumnIds(),
    ),
  );
  private readonly resolvedColumnPinning = computed(() =>
    this.enableColumnPinning()
      ? normalizeColumnPinning(
          this.state().columnPinning ?? this.internalColumnPinning(),
          this.allLeafColumnIds(),
        )
      : EMPTY_COLUMN_PINNING,
  );
  private readonly resolvedAccessibilityText = computed(() =>
    mergeNatTableAccessibilityText(this.tableIntl().accessibilityText, this.accessibilityText()),
  );
  protected readonly resolvedDescription = computed(
    () => this.resolvedAccessibilityText().description ?? '',
  );
  protected readonly resolvedEmptyState = computed(
    () => this.resolvedAccessibilityText().emptyState ?? '',
  );
  protected readonly resolvedCaption = computed(() => this.caption()?.trim() ?? '');
  protected readonly tableAriaLabel = computed(() => {
    if (this.resolvedCaption()) {
      return null;
    }

    return this.accessibleName().trim() || null;
  });
  protected readonly tableAriaLabelledBy = computed(() =>
    this.resolvedCaption() ? this.tableCaptionId() : null,
  );
  protected readonly resolvedKeyboardInstructions = computed(() => {
    const instructions = (this.resolvedAccessibilityText().keyboardInstructions ?? '').trim();
    const reorderInstructions =
      this.resolvedAccessibilityText().reorderKeyboardInstructions?.trim() ?? '';

    if (!this.enableColumnReorder()) {
      return instructions;
    }

    return [instructions, reorderInstructions].filter((value) => !!value).join(' ');
  });

  protected readonly headerGroups = computed(() => this.table.getHeaderGroups());
  protected readonly bodyRows = computed(() => this.table.getRowModel().rows);
  private readonly allLeafColumns = computed(() => this.table.getAllLeafColumns());
  protected readonly visibleColumns = computed(() => this.table.getVisibleLeafColumns());
  protected readonly mergedState = computed<NatTableState>(() => ({
    sorting: normalizeSortingState(this.state().sorting ?? this.internalSorting()),
    globalFilter: this.enableGlobalFilter()
      ? (this.state().globalFilter ?? this.internalGlobalFilter())
      : '',
    columnFilters: this.state().columnFilters ?? this.internalColumnFilters(),
    columnVisibility: this.state().columnVisibility ?? this.internalColumnVisibility(),
    columnOrder: this.resolvedColumnOrder(),
    columnPinning: this.resolvedColumnPinning(),
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
  protected readonly leafHeaderRowId = computed(
    () => this.table.getHeaderGroups().at(-1)?.id ?? null,
  );
  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [this.tableSummaryId()];

    if (this.resolvedDescription().trim()) {
      ids.push(this.tableDescriptionId());
    }

    if (this.resolvedKeyboardInstructions().trim()) {
      ids.push(this.tableKeyboardInstructionsId());
    }

    return ids.join(' ');
  });
  /** TanStack `Table<TData>` instance; read derived state or call TanStack APIs directly. */
  readonly table: Table<TData> = createAngularTable<TData>(() => ({
    data: this.readRequiredInput(this.data, []) as TData[],
    columns: this.readRequiredInput(this.columns, []) as ColumnDef<TData, unknown>[],
    state: this.mergedState(),
    enableMultiSort: false,
    isMultiSortEvent: () => false,
    enableColumnPinning: this.enableColumnPinning(),
    enableColumnOrdering: true,
    meta: {
      natTableLocaleId: this.localeId(),
    },
    autoResetPageIndex: false,
    globalFilterFn: (this.globalFilterFn() ?? genericGlobalFilter) as FilterFn<TData>,
    getRowId: (row, index, parent) => this.resolveRowId(row, index, parent),
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
    onColumnOrderChange: (updater) => this.updateState({ columnOrder: updater }),
    onColumnPinningChange: (updater) => this.updateState({ columnPinning: updater }),
    onPaginationChange: (updater) => this.updateState({ pagination: updater }),
  })) as Table<TData>;
  private readonly tableRegionRef = viewChild<ElementRef<HTMLElement>>('tableRegion');
  /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
  readonly tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null);
  private readonly measuredHeaderWidths = signal<Record<string, number>>({});
  private readonly destroyRef = inject(DestroyRef);
  private headerResizeObserver: ResizeObserver | null = null;

  /**
   * Per-column widths for pinned sticky offsets. CSS width comes from TanStack
   * `size` / `minSize` / `maxSize`; this uses measured headers, then fixed
   * sizing, then `column.getSize()` as a fallback.
   */
  private readonly resolvedColumnWidths = computed<Record<string, number>>(() => {
    const measured = this.measuredHeaderWidths();
    const result: Record<string, number> = {};

    for (const column of this.visibleColumns()) {
      const measuredWidth = measured[column.id];
      const sizing = this.userColumnSizing()[column.id];
      const fixedWidth = sizing?.hasSize === true ? getNumericColumnWidth(column.getSize()) : null;

      result[column.id] =
        measuredWidth !== undefined && measuredWidth > 0
          ? measuredWidth
          : fixedWidth !== null
            ? fixedWidth
            : Math.max(Math.round(column.getSize()), 1);
    }

    return result;
  });
  protected readonly columnRenderStates = computed<Record<string, TableColumnRenderState>>(() => {
    const visibleColumns = this.visibleColumns();
    const widths = this.resolvedColumnWidths();
    const userColumnSizing = this.userColumnSizing();
    const state = this.mergedState();
    const visibleColumnsById = new Map(
      visibleColumns.map((column) => [column.id, column] as const),
    );
    const leftVisibleColumns = (state.columnPinning.left ?? [])
      .map((columnId) => visibleColumnsById.get(columnId))
      .filter((column): column is Column<TData, unknown> => !!column);
    const rightVisibleColumns = (state.columnPinning.right ?? [])
      .map((columnId) => visibleColumnsById.get(columnId))
      .filter((column): column is Column<TData, unknown> => !!column);
    const leftPinnedIds = new Set(leftVisibleColumns.map((column) => column.id));
    const rightPinnedIds = new Set(rightVisibleColumns.map((column) => column.id));
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
      const sizing = userColumnSizing[column.id];
      const width = sizing?.hasSize === true ? normalizeColumnDimension(column.getSize()) : null;
      const minWidth =
        sizing?.hasMinSize === true
          ? normalizeColumnDimension(column.columnDef.minSize)
          : width !== null
            ? width
            : null;
      const maxWidth =
        sizing?.hasMaxSize === true
          ? normalizeColumnDimension(column.columnDef.maxSize)
          : width !== null
            ? width
            : null;
      const pinnedLeft = leftPinnedIds.has(column.id);
      const pinnedRight = rightPinnedIds.has(column.id);

      const sortEntry = state.sorting.find((entry) => entry.id === column.id);
      const meta = column.columnDef.meta;
      const label = resolveColumnLabel(column);
      const headerWidth =
        meta?.headerSize !== undefined ? normalizeColumnDimension(meta.headerSize) : null;
      const headerMinWidth =
        meta?.headerMinSize !== undefined
          ? normalizeColumnDimension(meta.headerMinSize)
          : headerWidth !== null
            ? headerWidth
            : null;
      const headerMaxWidth =
        meta?.headerMaxSize !== undefined
          ? normalizeColumnDimension(meta.headerMaxSize)
          : headerWidth !== null
            ? headerWidth
            : null;

      result[column.id] = {
        label,
        hiddenHeaderLabel: normalizeColumnLabel(meta?.hiddenHeaderLabel),
        alignEnd: meta?.align === 'end',
        pinnedLeft,
        pinnedRight,
        hasPinnedEdgeLeft: pinnedLeft && leftVisibleColumns.at(-1)?.id === column.id,
        hasPinnedEdgeRight: pinnedRight && rightVisibleColumns[0]?.id === column.id,
        left: pinnedLeft ? (leftOffsets[column.id] ?? 0) : null,
        right: pinnedRight ? (rightOffsets[column.id] ?? 0) : null,
        width,
        minWidth,
        maxWidth,
        constrainedWidth: width !== null || maxWidth !== null,
        headerWidth,
        headerMinWidth,
        headerMaxWidth,
        headerConstrainedWidth: headerWidth !== null || headerMaxWidth !== null,
        ariaSort: sortEntry ? (sortEntry.desc ? 'descending' : 'ascending') : null,
        rowHeader: !!meta?.rowHeader,
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

      this.internalSorting.set(
        normalizeSortingState(initialState.sorting ?? DEFAULT_TABLE_STATE.sorting),
      );
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
      this.internalColumnOrder.set(initialState.columnOrder ?? DEFAULT_TABLE_STATE.columnOrder);
      this.internalColumnPinning.set(
        this.enableColumnPinning()
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

  /** Apply a partial state update from companion controls (search, pager, filters). Respects controlled and uncontrolled slices. */
  patchState(
    updaters: Partial<{
      [K in keyof NatTableState]: Updater<NatTableState[K]>;
    }>,
  ): void {
    this.updateState(updaters);
  }

  protected isLeafHeaderRow(headerGroup: HeaderGroup<TData>): boolean {
    return headerGroup.id === this.leafHeaderRowId();
  }

  protected getHeaderRowColumnIds(headerGroup: HeaderGroup<TData>): string[] {
    return headerGroup.headers
      .filter((header) => !header.isPlaceholder)
      .map((header) => header.column.id);
  }

  protected canReorderHeader(header: Header<TData, unknown>): boolean {
    if (!this.enableColumnReorder() || header.isPlaceholder) {
      return false;
    }

    return this.getVisibleZoneColumnIds(this.getColumnZone(header.column)).length > 1;
  }

  protected shouldHidePrimitiveHeaderLabel(
    header: Header<TData, unknown>,
    columnState: TableColumnRenderState | undefined,
  ): boolean {
    return (
      !!columnState?.hiddenHeaderLabel && isPrimitiveHeaderContent(header.column.columnDef.header)
    );
  }

  protected onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void {
    if (
      !this.enableColumnReorder() ||
      !this.isLeafHeaderRow(headerGroup) ||
      event.previousIndex === event.currentIndex
    ) {
      return;
    }

    const rowColumnIds = this.getHeaderRowColumnIds(headerGroup);
    const movingColumnId = this.resolveDraggedColumnId(event, rowColumnIds);

    if (!movingColumnId) {
      return;
    }

    const zone = this.getColumnZoneById(movingColumnId);

    if (!zone || !this.isDropIndexWithinZone(rowColumnIds, zone, event.currentIndex)) {
      return;
    }

    const reorderedRowColumnIds = moveItemInArrayCopy(
      rowColumnIds,
      event.previousIndex,
      event.currentIndex,
    );
    const nextVisibleZoneOrder = reorderedRowColumnIds.filter(
      (columnId) => this.getColumnZoneById(columnId) === zone,
    );

    this.applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder);
  }

  protected onHeaderKeydown(event: KeyboardEvent, column: Column<TData, unknown>): void {
    if (this.handleCellInteractionKeydown(event)) {
      return;
    }

    if (!this.enableColumnReorder() || !event.altKey || !event.shiftKey) {
      return;
    }

    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    const zone = this.getColumnZone(column);
    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
    const currentIndex = visibleZoneColumnIds.indexOf(column.id);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = currentIndex + (event.key === 'ArrowLeft' ? -1 : 1);

    if (nextIndex < 0 || nextIndex >= visibleZoneColumnIds.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextVisibleZoneOrder = moveItemInArrayCopy(visibleZoneColumnIds, currentIndex, nextIndex);

    this.applyVisibleZoneReorder(zone, column.id, nextVisibleZoneOrder);
  }

  /** Keydown on a body data/row-header cell; routes through the cell-interaction model. */
  protected onCellKeydown(event: KeyboardEvent): void {
    this.handleCellInteractionKeydown(event);
  }

  /**
   * ARIA grid cell-interaction: Enter moves focus from a cell into its first
   * interactive control, Tab cycles between a cell's controls, and Escape returns
   * to the cell. The controls are rendered through `flexRender` (separate views),
   * so `@angular/aria`'s `GridCell` content query never registers them; this
   * supplies the keyboard path the grid pattern otherwise cannot. Returns `true`
   * when it handled the event (so the caller skips its own behavior, e.g. row activation).
   */
  private handleCellInteractionKeydown(event: KeyboardEvent): boolean {
    if (event.defaultPrevented) {
      return false;
    }

    const target = event.target;
    const cell = this.closestGridCell(target);

    if (!cell || !(target instanceof HTMLElement)) {
      return false;
    }

    const onCellItself = target === cell;

    if (event.key === 'Enter' && onCellItself) {
      const controls = this.cellInteractiveControls(cell);

      if (controls.length === 0) {
        return false; // Let a control-less cell fall through to row activation.
      }

      event.preventDefault();
      event.stopPropagation();
      controls[0].focus();
      return true;
    }

    if (event.key === 'Escape' && !onCellItself) {
      event.preventDefault();
      event.stopPropagation();
      cell.focus();
      return true;
    }

    if (event.key === 'Tab') {
      const grid = cell.closest('table');

      if (!grid) {
        return false;
      }

      const controls = this.gridInteractiveControls(grid);

      if (controls.length === 0) {
        return false;
      }

      const forward = !event.shiftKey;

      // Tab from a cell steps into that cell's own controls (first when forward, last when back).
      if (onCellItself) {
        const inCell = controls.filter((control) => cell.contains(control));

        if (inCell.length === 0) {
          return false; // No controls here — let Tab move on normally.
        }

        event.preventDefault();
        event.stopPropagation();
        (forward ? inCell[0] : inCell[inCell.length - 1]).focus();
        return true;
      }

      // Tab from a control walks to the next/previous control across the whole grid.
      const index = controls.indexOf(target);

      if (index === -1) {
        return false;
      }

      const next = index + (forward ? 1 : -1);

      if (next < 0 || next >= controls.length) {
        return false; // Past the first/last control: let Tab leave the grid.
      }

      event.preventDefault();
      event.stopPropagation();
      controls[next].focus();
      return true;
    }

    return false;
  }

  private closestGridCell(target: EventTarget | null): HTMLElement | null {
    return target instanceof Element
      ? target.closest<HTMLElement>('[role="gridcell"], [role="columnheader"], [role="rowheader"]')
      : null;
  }

  /** Controls Enter steps into — the cell's action controls, not the resize handle. */
  private cellInteractiveControls(cell: HTMLElement): HTMLElement[] {
    return this.collectInteractiveControls(cell, ROW_ACTIVATE_INTERACTIVE_SELECTOR);
  }

  /**
   * Every focusable item in the grid in document order — the Tab walk order. Includes
   * the column resize handles so Tab iterates through them alongside the cell controls.
   */
  private gridInteractiveControls(grid: HTMLElement): HTMLElement[] {
    return this.collectInteractiveControls(
      grid,
      `${ROW_ACTIVATE_INTERACTIVE_SELECTOR}, .column-resize-handle`,
    );
  }

  private collectInteractiveControls(root: HTMLElement, selector: string): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (element) =>
        !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
    );
  }

  protected getCellTone(
    column: Column<TData, unknown>,
    context: CellContext<TData, unknown>,
  ): NatTableCellTone | null {
    return column.columnDef.meta?.cellTone?.(context) ?? null;
  }

  /**
   * Locale-aware display string for a cell whose column declares
   * `meta.valueFormatter`, or `null` to fall back to the column's `cell`
   * renderer.
   */
  protected cellValueFormatter(cell: Cell<TData, unknown>): string | null {
    const formatter = cell.column.columnDef.meta?.valueFormatter;

    return formatter
      ? formatter({
          value: cell.getValue(),
          row: cell.row.original,
          locale: this.localeId(),
        })
      : null;
  }

  protected onRowRendered(event: NatTableRowRenderedEvent): void {
    this.rowRendered.emit(event);
  }

  protected onRowClick(event: MouseEvent, row: Row<TData>): void {
    if (event.button !== 0 || event.defaultPrevented) {
      return;
    }

    if (originatesFromInteractiveDescendant(event)) {
      return;
    }

    this.rowActivate.emit({
      rowData: row.original,
      row,
      originalEvent: event,
    });
  }

  protected onRowKeydown(event: KeyboardEvent, row: Row<TData>): void {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }

    if (originatesFromInteractiveDescendant(event)) {
      return;
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
    }

    this.rowActivate.emit({
      rowData: row.original,
      row,
      originalEvent: event,
    });
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
      sorting: normalizeSortingState(this.resolveUpdater(currentState.sorting, updaters.sorting)),
      globalFilter: this.resolveUpdater(currentState.globalFilter, updaters.globalFilter),
      columnFilters: this.resolveUpdater(currentState.columnFilters, updaters.columnFilters),
      columnVisibility: this.resolveUpdater(
        currentState.columnVisibility,
        updaters.columnVisibility,
      ),
      columnOrder: normalizeColumnOrder(
        this.resolveUpdater(currentState.columnOrder, updaters.columnOrder),
        this.allLeafColumnIds(),
      ),
      columnPinning: normalizeColumnPinning(
        this.resolveUpdater(currentState.columnPinning, updaters.columnPinning),
        this.allLeafColumnIds(),
      ),
      pagination: this.resolveUpdater(currentState.pagination, updaters.pagination),
    };

    this.commitInternalState(nextState);
    this.stateChange.emit(nextState);
    this.emitSliceChanges(currentState, nextState);
  }

  private emitSliceChanges(previous: NatTableState, next: NatTableState): void {
    if (!hasSameSorting(previous.sorting, next.sorting)) {
      this.sortingChange.emit(next.sorting);
    }

    if (previous.globalFilter !== next.globalFilter) {
      this.globalFilterChange.emit(next.globalFilter);
    }

    if (!hasSameColumnFilters(previous.columnFilters, next.columnFilters)) {
      this.columnFiltersChange.emit(next.columnFilters);
    }

    if (!hasSameVisibilityMap(previous.columnVisibility, next.columnVisibility)) {
      this.columnVisibilityChange.emit(next.columnVisibility);
    }

    if (!hasSameStringOrder(previous.columnOrder, next.columnOrder)) {
      this.columnOrderChange.emit(next.columnOrder);
    }

    if (!hasSameColumnPinning(previous.columnPinning, next.columnPinning)) {
      this.columnPinningChange.emit(next.columnPinning);
    }

    if (!hasSamePagination(previous.pagination, next.pagination)) {
      this.paginationChange.emit(next.pagination);
    }
  }

  private commitInternalState(nextState: NatTableState): void {
    const controlled = this.state();

    if (controlled.sorting === undefined) {
      this.internalSorting.set(nextState.sorting);
    }

    if (controlled.globalFilter === undefined) {
      this.internalGlobalFilter.set(nextState.globalFilter);
    }

    if (controlled.columnFilters === undefined) {
      this.internalColumnFilters.set(nextState.columnFilters);
    }

    if (controlled.columnVisibility === undefined) {
      this.internalColumnVisibility.set(nextState.columnVisibility);
    }

    if (controlled.columnOrder === undefined) {
      this.internalColumnOrder.set(nextState.columnOrder);
    }

    if (controlled.columnPinning === undefined) {
      this.internalColumnPinning.set(nextState.columnPinning);
    }

    if (controlled.pagination === undefined) {
      this.internalPagination.set(nextState.pagination);
    }
  }

  private resolveDraggedColumnId(
    event: CdkDragDrop<string[]>,
    rowColumnIds: readonly string[],
  ): string | null {
    const draggedColumnId = event.item.data;

    if (typeof draggedColumnId === 'string' && rowColumnIds.includes(draggedColumnId)) {
      return draggedColumnId;
    }

    return rowColumnIds[event.previousIndex] ?? null;
  }

  private isDropIndexWithinZone(
    rowColumnIds: readonly string[],
    zone: ColumnReorderZone,
    currentIndex: number,
  ): boolean {
    const zoneIndices = rowColumnIds.reduce<number[]>((indices, columnId, index) => {
      if (this.getColumnZoneById(columnId) === zone) {
        indices.push(index);
      }

      return indices;
    }, []);

    if (!zoneIndices.length) {
      return false;
    }

    return currentIndex >= zoneIndices[0] && currentIndex <= zoneIndices[zoneIndices.length - 1];
  }

  private applyVisibleZoneReorder(
    zone: ColumnReorderZone,
    movingColumnId: string,
    nextVisibleZoneOrder: readonly string[],
  ): void {
    const currentState = this.mergedState();
    const currentVisibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
    const movingColumn = this.table.getColumn(movingColumnId);

    if (
      !movingColumn ||
      !currentVisibleZoneColumnIds.length ||
      hasSameStringOrder(currentVisibleZoneColumnIds, nextVisibleZoneOrder)
    ) {
      return;
    }

    const label = resolveColumnLabel(movingColumn);

    if (zone === 'center') {
      const nextColumnOrder = replaceIdsInSlots(
        currentState.columnOrder,
        nextVisibleZoneOrder,
        new Set(currentVisibleZoneColumnIds),
      );

      if (hasSameStringOrder(currentState.columnOrder, nextColumnOrder)) {
        return;
      }

      this.updateState({ columnOrder: nextColumnOrder });
      this.announceColumnReorder(label, zone, nextVisibleZoneOrder, movingColumnId);
      return;
    }

    const currentPinnedZoneOrder =
      (zone === 'left' ? currentState.columnPinning.left : currentState.columnPinning.right) ?? [];
    const nextPinnedZoneOrder = replaceIdsInSlots(
      currentPinnedZoneOrder,
      nextVisibleZoneOrder,
      new Set(currentVisibleZoneColumnIds),
    );

    if (hasSameStringOrder(currentPinnedZoneOrder, nextPinnedZoneOrder)) {
      return;
    }

    this.updateState({
      columnPinning: {
        ...currentState.columnPinning,
        [zone]: nextPinnedZoneOrder,
      },
    });
    this.announceColumnReorder(label, zone, nextVisibleZoneOrder, movingColumnId);
  }

  private announceColumnReorder(
    label: string,
    zone: ColumnReorderZone,
    nextVisibleZoneOrder: readonly string[],
    movingColumnId: string,
  ): void {
    const nextIndex = nextVisibleZoneOrder.indexOf(movingColumnId);

    if (nextIndex === -1) {
      return;
    }

    const formatter = this.resolvedAccessibilityText().columnReorder;
    const context: NatTableAccessibilityColumnReorderAnnouncementContext = {
      columnId: movingColumnId,
      label,
      zone,
      positionValue: nextIndex + 1,
      positionText: this.formatAccessibilityNumber(nextIndex + 1),
      totalValue: nextVisibleZoneOrder.length,
      totalText: this.formatAccessibilityNumber(nextVisibleZoneOrder.length),
    };

    this.announce(formatter?.(context) ?? '');
  }

  private getColumnZone(column: Column<TData, unknown>): ColumnReorderZone {
    const pinnedState = column.getIsPinned();

    if (pinnedState === 'left') {
      return 'left';
    }

    if (pinnedState === 'right') {
      return 'right';
    }

    return 'center';
  }

  private getColumnZoneById(columnId: string): ColumnReorderZone | null {
    const column = this.table.getColumn(columnId);

    return column ? this.getColumnZone(column) : null;
  }

  private getVisibleZoneColumnIds(zone: ColumnReorderZone): string[] {
    return this.table
      .getVisibleLeafColumns()
      .filter((column) => this.getColumnZone(column) === zone)
      .map((column) => column.id);
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
    const summaryContext = this.getSummaryContext();
    const formatter = this.resolvedAccessibilityText().tableSummary;

    return formatter?.(summaryContext) ?? '';
  }

  private getSummaryContext(): NatTableAccessibilitySummaryContext {
    const state = this.mergedState();
    const visibleRows = this.visibleRowCount();
    const totalRows = this.totalRowCount();
    const visibleColumns = this.visibleColumnCount();
    const page = state.pagination.pageIndex + 1;
    const pageCount = this.pageCount();

    return {
      visibleRowsValue: visibleRows,
      visibleRowsText: this.formatAccessibilityNumber(visibleRows),
      totalRowsValue: totalRows,
      totalRowsText: this.formatAccessibilityNumber(totalRows),
      visibleColumnsValue: visibleColumns,
      visibleColumnsText: this.formatAccessibilityNumber(visibleColumns),
      pageIndex: state.pagination.pageIndex,
      pageValue: page,
      pageText: this.formatAccessibilityNumber(page),
      pageCountValue: pageCount,
      pageCountText: this.formatAccessibilityNumber(pageCount),
      filterState:
        state.globalFilter.trim() || state.columnFilters.length > 0 ? 'filtered' : 'unfiltered',
      paginationState: this.enablePagination() ? 'enabled' : 'disabled',
    };
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
      return this.describePageSizeChange(next);
    }

    if (previous.pagination.pageIndex !== next.pagination.pageIndex) {
      return this.describePageChange(next);
    }

    return null;
  }

  private describeSortingChange(snapshot: TableAccessibilitySnapshot): string {
    const sortingState = this.mergedState().sorting;
    const formatter = this.resolvedAccessibilityText().sortingChange;
    const entry = sortingState[0];
    const columnLabel = entry
      ? (snapshot.columns.find((column) => column.id === entry.id)?.label ?? entry.id)
      : null;
    const sortState = entry ? (entry.desc ? 'descending' : 'ascending') : 'none';
    const context: NatTableAccessibilitySortingAnnouncementContext = {
      columnId: entry?.id ?? null,
      columnLabel,
      sortState,
    };

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describeFilteringChange(snapshot: TableAccessibilitySnapshot): string {
    const formatter = this.resolvedAccessibilityText().filteringChange;
    const query = snapshot.globalFilter;
    const hasColumnFilters = !!snapshot.columnFiltersKey;
    const context: NatTableAccessibilityFilteringAnnouncementContext = {
      query: snapshot.globalFilter,
      filterState: query
        ? hasColumnFilters
          ? 'global-and-column'
          : 'global'
        : hasColumnFilters
          ? 'column'
          : 'none',
      visibleRowsValue: snapshot.visibleRows,
      visibleRowsText: this.formatAccessibilityNumber(snapshot.visibleRows),
      totalRowsValue: snapshot.totalRows,
      totalRowsText: this.formatAccessibilityNumber(snapshot.totalRows),
    };

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describeColumnVisibilityChange(
    previous: readonly TableColumnAccessibilityState[],
    next: readonly TableColumnAccessibilityState[],
  ): string {
    const changedColumns = next.reduce<NatTableAccessibilityColumnVisibilityAnnouncementChange[]>(
      (result, column) => {
        const previousColumn = previous.find((candidate) => candidate.id === column.id);

        if (previousColumn && previousColumn.visible !== column.visible) {
          result.push({
            id: column.id,
            label: column.label,
            visibilityState: column.visible ? 'visible' : 'hidden',
          });
        }

        return result;
      },
      [],
    );
    const visibleCount = next.filter((column) => column.visible).length;
    const formatter = this.resolvedAccessibilityText().columnVisibilityChange;
    const context: NatTableAccessibilityColumnVisibilityAnnouncementContext = {
      changedColumns,
      visibleColumnsValue: visibleCount,
      visibleColumnsText: this.formatAccessibilityNumber(visibleCount),
      totalColumnsValue: next.length,
      totalColumnsText: this.formatAccessibilityNumber(next.length),
    };

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describePageSizeChange(snapshot: TableAccessibilitySnapshot): string {
    const formatter = this.resolvedAccessibilityText().pageSizeChange;
    const context = this.getPaginationAnnouncementContext(snapshot);

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describePageChange(snapshot: TableAccessibilitySnapshot): string {
    const formatter = this.resolvedAccessibilityText().pageChange;
    const context = this.getPaginationAnnouncementContext(snapshot);

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private getPaginationAnnouncementContext(
    snapshot: TableAccessibilitySnapshot,
  ): NatTableAccessibilityPaginationAnnouncementContext {
    const page = snapshot.pagination.pageIndex + 1;
    const pageCount = snapshot.pageCount;
    const pageSize = snapshot.pagination.pageSize;

    return {
      pageIndex: snapshot.pagination.pageIndex,
      pageValue: page,
      pageText: this.formatAccessibilityNumber(page),
      pageCountValue: pageCount,
      pageCountText: this.formatAccessibilityNumber(pageCount),
      pageSizeValue: pageSize,
      pageSizeText: this.formatAccessibilityNumber(pageSize),
      visibleRowsValue: snapshot.visibleRows,
      visibleRowsText: this.formatAccessibilityNumber(snapshot.visibleRows),
    };
  }

  private announce(message: string): void {
    this.liveMessage.set('');
    queueMicrotask(() => this.liveMessage.set(message));
  }

  private resolveRowId(row: TData, index: number, parent?: Row<TData>): string {
    const getRowId = this.getRowId();

    return getRowId ? getRowId(row, index, parent) : String(index);
  }

  private formatAccessibilityNumber(value: number): string {
    return formatNatTableIntlNumber(this.tableIntl(), value, undefined, this.localeId());
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

function getColumnDefLeafIds<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
): string[] {
  return columns.flatMap((column) => {
    const childColumns = (
      column as ColumnDef<TData, unknown> & {
        columns?: readonly ColumnDef<TData, unknown>[];
      }
    ).columns;

    if (childColumns?.length) {
      return getColumnDefLeafIds(childColumns);
    }

    const columnId = resolveColumnDefId(column);

    return columnId ? [columnId] : [];
  });
}

function getUserColumnSizing<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
): Record<string, TableColumnSizingState> {
  const result: Record<string, TableColumnSizingState> = {};

  for (const column of columns) {
    const childColumns = (
      column as ColumnDef<TData, unknown> & {
        columns?: readonly ColumnDef<TData, unknown>[];
      }
    ).columns;

    if (childColumns?.length) {
      Object.assign(result, getUserColumnSizing(childColumns));
      continue;
    }

    const columnId = resolveColumnDefId(column);

    if (!columnId) {
      continue;
    }

    // TanStack applies default `size`, `minSize`, and `maxSize` to runtime
    // column definitions. Read the original input defs so only user-provided
    // sizing becomes rendered CSS.
    result[columnId] = {
      hasSize: column.size !== undefined,
      hasMinSize: column.minSize !== undefined,
      hasMaxSize: column.maxSize !== undefined,
    };
  }

  return result;
}

function resolveColumnDefId<TData extends RowData>(
  column: ColumnDef<TData, unknown>,
): string | null {
  if (column.id) {
    return column.id;
  }

  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;

  if (typeof accessorKey === 'string') {
    return accessorKey;
  }

  return typeof column.header === 'string' ? column.header : null;
}

function originatesFromInteractiveDescendant(event: Event): boolean {
  const target = event.target;
  const currentTarget = event.currentTarget;

  if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
    return false;
  }

  const interactive = target.closest(ROW_ACTIVATE_INTERACTIVE_SELECTOR);

  if (!interactive) {
    return false;
  }

  return interactive !== currentTarget && currentTarget.contains(interactive);
}

/** Collapses to a single primary sort column (deduped by id, first wins). */
function normalizeSortingState(sorting: SortingState): SortingState {
  if (!sorting.length) {
    return sorting;
  }

  const seen = new Set<string>();
  const deduped: SortingState = [];

  for (const entry of sorting) {
    if (!entry || seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    deduped.push(entry);
  }

  const normalized = deduped.slice(0, 1);

  if (normalized.length === sorting.length && normalized[0] === sorting[0]) {
    return sorting;
  }

  if (
    normalized.length === 1 &&
    sorting.length === 1 &&
    normalized[0]!.id === sorting[0]!.id &&
    normalized[0]!.desc === sorting[0]!.desc
  ) {
    return sorting;
  }

  return normalized;
}

function normalizeColumnOrder(
  columnOrder: readonly string[],
  allLeafColumnIds: readonly string[],
): ColumnOrderState {
  const validColumnIds = new Set(allLeafColumnIds);
  const nextOrder = uniqueStringValues(
    columnOrder.filter((columnId) => validColumnIds.has(columnId)),
  );

  for (const columnId of allLeafColumnIds) {
    if (!nextOrder.includes(columnId)) {
      nextOrder.push(columnId);
    }
  }

  return nextOrder;
}

function normalizeColumnPinning(
  columnPinning: ColumnPinningState,
  allLeafColumnIds: readonly string[],
): ColumnPinningState {
  const validColumnIds = new Set(allLeafColumnIds);
  const leftColumnIds = columnPinning.left ?? [];
  const rightColumnIds = columnPinning.right ?? [];

  return {
    left: uniqueStringValues(leftColumnIds.filter((columnId) => validColumnIds.has(columnId))),
    right: uniqueStringValues(rightColumnIds.filter((columnId) => validColumnIds.has(columnId))),
  };
}

function uniqueStringValues(values: readonly string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

function moveItemInArrayCopy(
  values: readonly string[],
  fromIndex: number,
  toIndex: number,
): string[] {
  const nextValues = [...values];
  const [movedValue] = nextValues.splice(fromIndex, 1);

  if (movedValue === undefined) {
    return nextValues;
  }

  nextValues.splice(toIndex, 0, movedValue);
  return nextValues;
}

function replaceIdsInSlots(
  currentOrder: readonly string[],
  nextVisibleOrder: readonly string[],
  movableIds: ReadonlySet<string>,
): string[] {
  const nextValues = [...nextVisibleOrder];

  return currentOrder.map((columnId) => {
    if (!movableIds.has(columnId)) {
      return columnId;
    }

    return nextValues.shift() ?? columnId;
  });
}

function hasSameStringOrder(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
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

function normalizeColumnDimension(value: number | string | undefined): string | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${Math.round(value)}px` : null;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue ? trimmedValue : null;
  }

  return null;
}

function getNumericColumnWidth(value: number | string | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const pixelMatch = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim());

  if (!pixelMatch) {
    return null;
  }

  const width = Number(pixelMatch[1]);

  return Number.isFinite(width) && width >= 0 ? Math.round(width) : null;
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
  const hiddenHeaderLabel = normalizeColumnLabel(column.columnDef.meta?.hiddenHeaderLabel);

  if (hiddenHeaderLabel) {
    return hiddenHeaderLabel;
  }

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

function normalizeColumnLabel(label: string | undefined): string | null {
  const normalized = label?.trim() ?? '';

  return normalized || null;
}

function isPrimitiveHeaderContent<TData extends RowData>(
  header: ColumnDef<TData, unknown>['header'],
): boolean {
  return typeof header === 'string' || typeof header === 'number';
}

function serializeSorting(sorting: SortingState): string {
  return sorting.map((entry) => `${entry.id}:${entry.desc ? 'desc' : 'asc'}`).join('|');
}

function serializeColumnFilters(columnFilters: ColumnFiltersState): string {
  return columnFilters.map((entry) => `${entry.id}:${JSON.stringify(entry.value)}`).join('|');
}

function hasSameSorting(previous: SortingState, next: SortingState): boolean {
  if (previous === next) {
    return true;
  }

  return serializeSorting(previous) === serializeSorting(next);
}

function hasSameColumnFilters(previous: ColumnFiltersState, next: ColumnFiltersState): boolean {
  if (previous === next) {
    return true;
  }

  return serializeColumnFilters(previous) === serializeColumnFilters(next);
}

function hasSameVisibilityMap(previous: VisibilityState, next: VisibilityState): boolean {
  if (previous === next) {
    return true;
  }

  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of previousKeys) {
    if (previous[key] !== next[key]) {
      return false;
    }
  }

  return true;
}

function hasSameColumnPinning(previous: ColumnPinningState, next: ColumnPinningState): boolean {
  if (previous === next) {
    return true;
  }

  return (
    hasSameStringOrder(previous.left ?? [], next.left ?? []) &&
    hasSameStringOrder(previous.right ?? [], next.right ?? [])
  );
}

function hasSamePagination(previous: PaginationState, next: PaginationState): boolean {
  if (previous === next) {
    return true;
  }

  return previous.pageIndex === next.pageIndex && previous.pageSize === next.pageSize;
}

function hasSameColumnVisibility(
  current: readonly TableColumnAccessibilityState[],
  next: readonly TableColumnAccessibilityState[],
): boolean {
  if (current.length !== next.length) {
    return false;
  }

  // Intentionally ignores label changes so swapping i18n labels (or any other
  // purely cosmetic column-def change) does not flow through to a misleading
  // visibility announcement on the live region.
  return current.every((column) => {
    const nextColumn = next.find((candidate) => candidate.id === column.id);

    if (!nextColumn) {
      return false;
    }

    return nextColumn.visible === column.visible;
  });
}
