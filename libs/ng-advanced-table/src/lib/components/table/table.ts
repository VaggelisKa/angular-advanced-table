/* eslint-disable max-lines -- the table component is a single cohesive primitive (state, layout, a11y, resize, reorder); splitting it would fragment tightly-coupled signal graph and lifecycle wiring. */
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import { Directionality } from '@angular/cdk/bidi';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  Injector,
  NgZone,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  isDevMode,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import type { ElementRef, TemplateRef } from '@angular/core';

import {
  FlexRender,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/angular-table';
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  FilterFn,
  Header,
  HeaderGroup,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  Updater,
  VisibilityState
} from '@tanstack/angular-table';

import { handleCellInteractionFocusIn, handleCellInteractionKeydown } from './cell-interaction';
import type { NatTableRowRenderedEvent } from './events';
import { validateKeybindings } from './keybindings';
import { NatTableRowRenderEmitter } from './row-render-emitter.directive';
import {
  NAT_TABLE_ENGLISH_LOCALE,
  NAT_TABLE_INTL,
  formatNatTableIntlNumber,
  mergeNatTableAccessibilityText,
  resolveNatTableIntl
} from './table-intl';
import { NatTableBodyCellLayout, NatTableHeaderCellLayout, NatTablePxWidth, NatTableResizeGuide } from './table-layout.directive';
import { NatTableStateCell } from './table-state-cell.directive';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from './table-state-templates';
import {
  getColumnDefLeafIds,
  getColumnMoveTargetIndex,
  getNumericColumnWidth,
  getUserColumnSizing,
  hasSameColumnVisibility,
  hasSameStringOrder,
  hasSameWidths,
  matchesFilterQuery,
  moveItemInArrayCopy,
  normalizeColumnOrder,
  normalizeColumnPinning,
  normalizeDataStatus,
  normalizeRowSelection,
  normalizeSortingState,
  originatesFromInteractiveDescendant,
  readColumnEntry,
  replaceIdsInSlots,
  resolveColumnLabel,
  serializeColumnFilters,
  serializeRowSelection,
  serializeSorting
} from './table-utils';
import type { ColumnReorderKeyboardDirection, TableColumnAccessibilityState, TableColumnSizingState } from './table-utils';
import { NatTableService } from './table.service';
import type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilityPaginationAnnouncementContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilitySummaryContext,
  NatTableBodyState,
  NatTableColumnMoveDirection,
  NatTableDataStatus,
  NatTableEmptyTemplateContext,
  NatTableErrorTemplateContext,
  NatTableLoadingTemplateContext,
  NatTableRowActivateEvent,
  NatTableRowIdGetter,
  NatTableState,
  NatTableUiController
} from './table.types';
import { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS } from './table.types';
import {
  accumulatePinnedOffsets,
  buildColumnRenderState,
  canResizeColumn,
  firstPageUpdater,
  getCellTone,
  getColumnZone,
  getHeaderRowColumnIds,
  isColumnResizable,
  isResizeKey,
  readRequiredInput,
  resolveDraggedColumnId,
  resolveFilterState,
  resolvePinnedZoneColumns,
  resolveSeedState,
  resolveUpdater,
  scrollElementHorizontallyIntoView,
  shouldHidePrimitiveHeaderLabel,
  sortDirection
} from './table.util';
import type { ColumnRenderStateContext, ColumnReorderZone, TableColumnRenderState } from './table.util';

type TableAccessibilitySnapshot = {
  dataStatus: NatTableDataStatus;
  sortingKey: string;
  globalFilter: string;
  columnFiltersKey: string;
  rowSelectionKey: string;
  selectedRowCount: number;
  pagination: PaginationState;
  pageCount: number;
  visibleRows: number;
  totalRows: number;
  columns: TableColumnAccessibilityState[];
};

const EMPTY_COLUMN_PINNING: ColumnPinningState = {
  left: [],
  right: []
};
const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: 10
};
const DEFAULT_COLUMN_ORDER: ColumnOrderState = [];
const EMPTY_COLUMN_SIZING: ColumnSizingState = {};
const DEFAULT_TABLE_STATE: NatTableState = {
  sorting: [],
  globalFilter: '',
  columnFilters: [],
  columnVisibility: {},
  columnOrder: DEFAULT_COLUMN_ORDER,
  columnPinning: EMPTY_COLUMN_PINNING,
  columnSizing: EMPTY_COLUMN_SIZING,
  rowSelection: {},
  pagination: DEFAULT_PAGINATION
};
const RESIZE_KEYBOARD_STEP = 8;
const RESIZE_KEYBOARD_STEP_LARGE = 40;
/**
 * Minimum resize width for a column that does not declare its own `minSize`.
 * TanStack defaults `minSize` to 20px, which is narrower than the resize handle
 * hit area (`--nat-table-resize-handle-hit`, 24px / the WCAG 2.5.8 AA target):
 * a column dragged that small swallows its own handle (it overflows the cell and
 * stops being grabbable) and, in fill layout, collapses every neighbour to the
 * same sliver while the grown column overflows the region. Twice the hit target
 * keeps the handle fully inside the column plus a grabbable header strip. An
 * explicit `minSize` is always honoured as-is.
 */
const DEFAULT_MIN_COLUMN_WIDTH = 48;
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
 * Whether the current browser can drive the viewport-sticky header from the
 * compositor via CSS scroll-driven animations. When unsupported (notably older
 * iOS Safari), the table falls back to the JS scroll listener instead.
 */
function browserSupportsScrollTimeline(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
}

function readVisualViewportOffsetTop(): number {
  return window.visualViewport?.offsetTop ?? 0;
}

/**
 * Signals-first Angular table primitive built on TanStack Table.
 *
 * The core component renders the table structure only. Optional controls,
 * header actions, and themed surfaces live in companion packages.
 */
@Component({
  selector: 'nat-table',
  exportAs: 'natTable',
  imports: [
    NgTemplateOutlet,
    Grid,
    GridCell,
    GridRow,
    CdkDropList,
    CdkDrag,
    FlexRender,
    NatTableRowRenderEmitter,
    NatTableStateCell,
    NatTableHeaderCellLayout,
    NatTableBodyCellLayout,
    NatTablePxWidth,
    NatTableResizeGuide
  ],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class NatTable<TData extends RowData = RowData> implements NatTableUiController<TData> {
  /** Row data rendered by the table. */
  public readonly data = input.required<readonly TData[]>();
  /** TanStack column definitions for the current row type. */
  public readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  /** Required accessible name announced for the grid when no visible caption is rendered. */
  public readonly accessibleName = input.required<string>();
  /** Visible table caption. When present, it provides the grid's accessible name. */
  public readonly caption = input<string | undefined>(undefined);
  /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
  public readonly dataStatus = input<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  /** Optional error payload passed through to `natTableError` templates. */
  public readonly error = input<unknown>(null);
  /** Enables row selection (`aria-selected`, selection state, companion checkbox column). */
  public readonly enableRowSelection = input(false, { transform: booleanAttribute });
  /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
  public readonly selectionMode = input<'single' | 'multiple'>('multiple');
  /** Optional override for the global filter implementation. */
  public readonly globalFilterFn = input<FilterFn<TData>>();
  /** Optional stable row id resolver used for selection, pinning, and events. */
  public readonly getRowId = input<NatTableRowIdGetter<TData>>();
  /** Emits one `rowRendered` event per body row per cycle. Off by default (adds an `afterRenderEffect` per row). */
  public readonly emitRowRenderEvents = input(false, { transform: booleanAttribute });

  /** Emits per-row paint timings when `emitRowRenderEvents` is enabled. */
  public readonly rowRendered = output<NatTableRowRenderedEvent>();
  /** Emits on row click or Enter/Space unless the event started on an interactive descendant. */
  public readonly rowActivate = output<NatTableRowActivateEvent<TData>>();

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly ngZone = inject(NgZone);

  protected readonly initialState = computed(() => this.natTableService.surfaceInitialState());
  protected readonly state = computed(() => this.natTableService.state());
  protected readonly mode = computed(() => this.natTableService.surfaceMode());
  protected readonly manualPagination = computed(() => this.natTableService.manualPagination());
  protected readonly manualSorting = computed(() => this.natTableService.manualSorting());
  protected readonly manualFiltering = computed(() => this.natTableService.manualFiltering());
  // Public because NatTable serves as the NatTableUiController (see setController);
  // the `[for]="grid"` consumer binding needs these on the public surface.
  public readonly enablePagination = computed(() => this.natTableService.hasPagination());
  public readonly enableGlobalFilter = computed(() => this.natTableService.hasSearch());

  protected readonly manualPageCount = computed(() => this.natTableService.manualPageCount());
  protected readonly enableAnnouncements = computed(() => this.natTableService.enableAnnouncements());

  protected readonly stickyHeader = computed(() => this.natTableService.stickyHeader());
  protected readonly enableMultiSort = computed(() => this.natTableService.enableMultiSort());
  protected readonly locale = computed(() => this.natTableService.locale());
  protected readonly accessibilityText = computed(() => this.natTableService.accessibilityText());
  protected readonly columnResizeMode = computed(() => this.natTableService.columnResizeMode());
  protected readonly columnSizingMode = computed(() => this.natTableService.columnSizingMode());
  /** Fixed layout makes column widths authoritative (`table-layout: fixed`) so resizing is pixel-exact and the region scrolls; fill (default) stretches columns to the container. */
  protected readonly isFixedLayout = computed(() => this.columnSizingMode() === 'fixed');
  protected readonly direction = computed(() => this.natTableService.direction());

  private readonly internalSorting = signal<SortingState>(DEFAULT_TABLE_STATE.sorting);
  private readonly internalGlobalFilter = signal(DEFAULT_TABLE_STATE.globalFilter);
  private readonly internalColumnFilters = signal<ColumnFiltersState>(DEFAULT_TABLE_STATE.columnFilters);

  private readonly internalColumnVisibility = signal<VisibilityState>(DEFAULT_TABLE_STATE.columnVisibility);

  private readonly internalColumnOrder = signal<ColumnOrderState>(DEFAULT_TABLE_STATE.columnOrder);
  private readonly internalColumnPinning = signal<ColumnPinningState>(DEFAULT_TABLE_STATE.columnPinning);

  private readonly internalColumnSizing = signal<ColumnSizingState>(DEFAULT_TABLE_STATE.columnSizing);

  /**
   * Transient measured width staged for a column the resolved state hasn't
   * sized yet, applied only during the synchronous pointer-down that starts a
   * resize. `mergedState` overlays it so TanStack captures the real start size
   * instead of the 150px default; `onResizeStart` clears it once captured.
   */
  private readonly resizeSeedSizing = signal<ColumnSizingState>({});
  private readonly internalRowSelection = signal<RowSelectionState>(DEFAULT_TABLE_STATE.rowSelection);

  private readonly internalPagination = signal<PaginationState>(DEFAULT_TABLE_STATE.pagination);
  private readonly hasSeededInitialState = signal(false);
  protected readonly liveMessage = signal('');
  /** Stable DOM id for the rendered `<table>` element. */
  public readonly tableElementId = signal(`nat-table-${nextTableId++}`);
  protected readonly tableCaptionId = computed(() => `${this.tableElementId()}-caption`);
  protected readonly tableSummaryId = computed(() => `${this.tableElementId()}-summary`);
  protected readonly tableDescriptionId = computed(() => `${this.tableElementId()}-description`);
  protected readonly tableKeyboardInstructionsId = computed(() => `${this.tableElementId()}-instructions`);

  private readonly tableIntlConfig = inject(NAT_TABLE_INTL);
  private lastAccessibilitySnapshot: TableAccessibilitySnapshot | null = null;
  /** Current locale id resolved from the `locale` input or built-in English default. */
  public readonly localeId = computed(() => this.locale() ?? NAT_TABLE_ENGLISH_LOCALE);
  private readonly tableIntl = computed(() => resolveNatTableIntl(this.tableIntlConfig, this.localeId()));

  protected readonly renderCycleToken = signal(0);
  protected readonly renderCycleStartedAt = signal(0);
  private readonly allLeafColumnIds = computed(() => getColumnDefLeafIds(readRequiredInput(this.columns, [])));

  private readonly userColumnSizing = computed(() => getUserColumnSizing(readRequiredInput(this.columns, [])));

  private readonly resolvedColumnOrder = computed(() =>
    normalizeColumnOrder(this.state().columnOrder ?? this.internalColumnOrder(), this.allLeafColumnIds())
  );

  private readonly resolvedColumnPinning = computed(() =>
    normalizeColumnPinning(this.state().columnPinning ?? this.internalColumnPinning(), this.allLeafColumnIds())
  );

  private readonly resolvedColumnSizing = computed<ColumnSizingState>(() => {
    const resolved = this.state().columnSizing ?? this.internalColumnSizing();
    const seed = this.resizeSeedSizing();

    // Overlay seed widths only for columns the resolved state hasn't sized yet.
    // Resolved entries always win, so the overlay self-shadows once a controlled
    // binding (or the internal signal) catches up — and never blocks a reset.
    let merged: ColumnSizingState | null = null;

    for (const columnId of Object.keys(seed)) {
      if (!(columnId in resolved)) {
        (merged ??= { ...resolved })[columnId] = seed[columnId];
      }
    }

    return merged ?? resolved;
  });

  private readonly resolvedAccessibilityText = computed(() =>
    mergeNatTableAccessibilityText(this.tableIntl().accessibilityText, this.accessibilityText())
  );

  protected readonly resolvedDescription = computed(() => this.resolvedAccessibilityText().description ?? '');

  protected readonly resolvedEmptyState = computed(() => this.resolvedAccessibilityText().emptyState ?? '');

  protected readonly resolvedLoadingState = computed(() => this.resolvedAccessibilityText().loadingState ?? '');

  protected readonly resolvedErrorState = computed(() => this.resolvedAccessibilityText().errorState ?? '');

  protected readonly resolvedDataStatus = computed(() => normalizeDataStatus(this.dataStatus()));
  protected readonly resolvedCaption = computed(() => this.caption()?.trim() ?? '');
  protected readonly tableAriaLabel = computed(() => {
    if (this.resolvedCaption()) {
      return null;
    }

    return this.accessibleName().trim() || null;
  });

  protected readonly tableAriaLabelledBy = computed(() => (this.resolvedCaption() ? this.tableCaptionId() : null));

  protected readonly resolvedKeyboardInstructions = computed(() => {
    const instructions = (this.resolvedAccessibilityText().keyboardInstructions ?? '').trim();
    const reorderInstructions = this.resolvedAccessibilityText().reorderKeyboardInstructions?.trim() ?? '';
    const resizeInstructions = this.resolvedAccessibilityText().resizeKeyboardInstructions?.trim() ?? '';
    const parts = [instructions, reorderInstructions];

    if (this.hasResizableColumns()) {
      parts.push(resizeInstructions);
    }

    return parts.filter((value) => !!value).join(' ');
  });

  protected readonly headerGroups = computed(() => this.table.getHeaderGroups());
  protected readonly bodyRows = computed(() => this.table.getRowModel().rows);
  private readonly allLeafColumns = computed(() => this.table.getAllLeafColumns());
  private readonly hasResizableColumns = computed(() => this.allLeafColumns().some((column) => isColumnResizable(column)));

  protected readonly visibleColumns = computed(() => this.table.getVisibleLeafColumns());
  protected readonly mergedState = computed<NatTableState>(() => ({
    sorting: normalizeSortingState(this.state().sorting ?? this.internalSorting(), this.enableMultiSort()),
    globalFilter: this.enableGlobalFilter() ? (this.state().globalFilter ?? this.internalGlobalFilter()) : '',
    columnFilters: this.state().columnFilters ?? this.internalColumnFilters(),
    columnVisibility: this.state().columnVisibility ?? this.internalColumnVisibility(),
    columnOrder: this.resolvedColumnOrder(),
    columnPinning: this.resolvedColumnPinning(),
    columnSizing: this.resolvedColumnSizing(),
    rowSelection: normalizeRowSelection(this.state().rowSelection ?? this.internalRowSelection(), this.selectionMode() === 'multiple'),
    pagination: this.state().pagination ?? this.internalPagination()
  }));

  /**
   * Grid-level `aria-multiselectable` for row selection. The `ngGrid` directive
   * only manages this attribute for its own cell-selection model
   * (`enableSelection`), which this table does not use — enabling it would turn
   * on focus-follows cell selection that conflicts with TanStack row selection.
   * The directive's host binding clobbers template bindings for the attribute,
   * so the value is written imperatively after render (see constructor).
   */
  private readonly ariaMultiSelectable = computed(() => this.enableRowSelection() && this.selectionMode() === 'multiple');

  protected readonly visibleColumnCount = computed(() => this.visibleColumns().length);
  protected readonly visibleRowCount = computed(() => this.bodyRows().length);
  protected readonly totalRowCount = computed(() => readRequiredInput(this.data, []).length);
  protected readonly resolvedPageCount = computed(() => {
    if (this.manualPagination()) {
      return this.manualPageCount() ?? 1;
    }

    return this.enablePagination() ? Math.max(this.table.getPageCount(), 1) : 1;
  });

  protected readonly visibleColumnIds = computed(() =>
    this.visibleColumns()
      .map((column) => column.id)
      .join('|')
  );

  protected readonly emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1));
  protected readonly tableAriaBusy = computed(() => (this.resolvedDataStatus() === NAT_TABLE_DATA_STATUS.loading ? 'true' : null));

  protected readonly bodyState = computed<NatTableBodyState>(() => {
    const dataStatus = this.resolvedDataStatus();

    if (dataStatus === NAT_TABLE_DATA_STATUS.error) {
      return NAT_TABLE_BODY_STATE.error;
    }

    if (dataStatus === NAT_TABLE_DATA_STATUS.loading && this.totalRowCount() === 0) {
      return NAT_TABLE_BODY_STATE.loading;
    }

    return this.visibleRowCount() > 0 ? NAT_TABLE_BODY_STATE.rows : NAT_TABLE_BODY_STATE.empty;
  });

  private readonly renderedVisibleRowCount = computed(() =>
    this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.visibleRowCount() : 0
  );

  private readonly stateTotalRowCount = computed(() => {
    const bodyState = this.bodyState();

    return bodyState === NAT_TABLE_BODY_STATE.loading || bodyState === NAT_TABLE_BODY_STATE.error ? 0 : this.totalRowCount();
  });

  private readonly renderedPageIndex = computed(() =>
    this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.mergedState().pagination.pageIndex : 0
  );

  private readonly renderedPageCount = computed(() => (this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.resolvedPageCount() : 1));

  protected readonly loadingTemplateContext = computed<NatTableLoadingTemplateContext<TData>>(() => ({
    ...this.getStateTemplateBaseContext(),
    $implicit: NAT_TABLE_BODY_STATE.loading,
    status: NAT_TABLE_BODY_STATE.loading
  }));

  protected readonly emptyTemplateContext = computed<NatTableEmptyTemplateContext<TData>>(() => ({
    ...this.getStateTemplateBaseContext(),
    $implicit: NAT_TABLE_BODY_STATE.empty,
    status: NAT_TABLE_BODY_STATE.empty
  }));

  protected readonly errorTemplateContext = computed<NatTableErrorTemplateContext<TData>>(() => {
    const error = this.error();

    return {
      ...this.getStateTemplateBaseContext(),
      $implicit: error,
      status: NAT_TABLE_BODY_STATE.error,
      error
    };
  });

  private readonly loadingTemplate = contentChild(NatTableLoadingTemplate);
  private readonly emptyTemplate = contentChild(NatTableEmptyTemplate);
  private readonly errorTemplate = contentChild(NatTableErrorTemplate);
  protected readonly loadingTemplateRef = computed<TemplateRef<NatTableLoadingTemplateContext<TData>> | null>(() => {
    const templateRef = this.loadingTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableLoadingTemplateContext<TData>>) : null;
  });

  protected readonly emptyTemplateRef = computed<TemplateRef<NatTableEmptyTemplateContext<TData>> | null>(() => {
    const templateRef = this.emptyTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableEmptyTemplateContext<TData>>) : null;
  });

  protected readonly errorTemplateRef = computed<TemplateRef<NatTableErrorTemplateContext<TData>> | null>(() => {
    const templateRef = this.errorTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableErrorTemplateContext<TData>>) : null;
  });

  protected readonly tableSummary = computed(() => this.buildTableSummary());
  protected readonly leafHeaderRowId = computed(() => this.table.getHeaderGroups().at(-1)?.id ?? null);

  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.tableSummary().trim()) {
      ids.push(this.tableSummaryId());
    }

    if (this.resolvedDescription().trim()) {
      ids.push(this.tableDescriptionId());
    }

    if (this.resolvedKeyboardInstructions().trim()) {
      ids.push(this.tableKeyboardInstructionsId());
    }

    return ids.length ? ids.join(' ') : null;
  });

  public readonly table: Table<TData> = createAngularTable<TData>(() => ({
    data: readRequiredInput(this.data, []) as TData[],
    columns: readRequiredInput(this.columns, []) as ColumnDef<TData, unknown>[],
    state: this.mergedState(),
    pageCount: this.manualPagination() ? this.manualPageCount() : undefined,
    manualPagination: this.manualPagination(),
    manualSorting: this.manualSorting(),
    manualFiltering: this.manualFiltering(),
    enableMultiSort: this.enableMultiSort(),
    isMultiSortEvent: (event) => this.enableMultiSort() && (event as { shiftKey?: boolean }).shiftKey === true,
    enableColumnPinning: true,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    columnResizeMode: this.columnResizeMode(),
    columnResizeDirection: this.resolvedDirection(),
    enableRowSelection: this.enableRowSelection(),
    enableMultiRowSelection: this.selectionMode() === 'multiple',
    meta: {
      natTableLocaleId: this.localeId(),
      natTableCanMoveColumn: (columnId, direction) => this.canMoveColumn(columnId, direction),
      natTableMoveColumn: (columnId, direction) => this.moveColumn(columnId, direction)
    },
    autoResetPageIndex: false,
    globalFilterFn: (this.globalFilterFn() ?? genericGlobalFilter) as FilterFn<TData>,
    getRowId: (row, index, parent) => this.resolveRowId(row, index, parent),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: this.manualFiltering() ? undefined : getFilteredRowModel(),
    getSortedRowModel: this.manualSorting() ? undefined : getSortedRowModel(),
    getPaginationRowModel: !this.manualPagination() && this.enablePagination() ? getPaginationRowModel() : undefined,
    onSortingChange: (updater) => this.updateState({ sorting: updater }),
    onGlobalFilterChange: (updater: Updater<string>) => this.updateState({ globalFilter: updater, pagination: firstPageUpdater }),
    onColumnFiltersChange: (updater) => this.updateState({ columnFilters: updater, pagination: firstPageUpdater }),
    onColumnVisibilityChange: (updater: Updater<VisibilityState>) => this.updateState({ columnVisibility: updater }),
    onColumnOrderChange: (updater) => this.updateState({ columnOrder: updater }),
    onColumnPinningChange: (updater) => this.updateState({ columnPinning: updater }),
    onColumnSizingChange: (updater) => this.applyColumnSizingChange(updater),
    onRowSelectionChange: (updater) => this.updateState({ rowSelection: updater }),
    onPaginationChange: (updater) => this.updateState({ pagination: updater })
  })) as Table<TData>;

  private readonly tableRegionRef = viewChild<ElementRef<HTMLElement>>('tableRegion');
  /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
  public readonly tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null);

  private readonly measuredHeaderWidths = signal<Record<string, number>>({});
  private readonly injector = inject(Injector);
  /**
   * Visible width of the scroll region (its `clientWidth`). Caps each column's
   * maximum resize width so a single column can never be dragged wider than the
   * viewport and scroll its content off-screen. 0 until first measured (no cap).
   */
  private readonly regionViewportWidth = signal<number>(0);
  private readonly destroyRef = inject(DestroyRef);
  private readonly directionality = inject(Directionality, { optional: true });
  /** Resolved text direction: explicit `direction` config → inherited CDK direction → `'ltr'`. */
  protected readonly resolvedDirection = computed<'ltr' | 'rtl'>(() => this.direction() ?? this.directionality?.value ?? 'ltr');

  private headerResizeObserver: ResizeObserver | null = null;

  private cachedStickyTop = 0;
  private tablePageTop = 0;
  private cachedStickyRangeStart = 0;
  private cachedStickyMaxTranslate = 0;
  private theadHeight = 0;
  private tableHeight = 0;
  private isRegionScrollable = false;
  private isTableVisible = false;
  private cachedHeaderCells: HTMLTableCellElement[] = [];
  private cachedTableEl: HTMLTableElement | null = null;
  private cachedTheadEl: HTMLTableSectionElement | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  /**
   * TanStack id of the column whose pointer/touch resize drag is in progress.
   * Tracked so a single announcement can fire when the drag ends (the keyboard
   * path announces per step; pointer resize is otherwise silent).
   */
  private previousResizingColumnId: string | null = null;

  /**
   * Width and column committed by the in-progress pointer/touch resize drag,
   * snapshotted while TanStack still reports the drag as active. A controlled
   * `columnSizing` binding cannot round-trip back to this component before the
   * resize-end effect runs, so the effect announces this snapshot instead of
   * the (stale) resolved width.
   */
  private resizeCommit: { columnId: string; width: number } | null = null;

  /**
   * Fill layout with at least one resizable column and a measured region. The table
   * then renders authoritative widths (a colgroup under `table-layout: fixed`) that
   * sum to the region, so resizing a column is pixel-exact while the other columns
   * flex to keep the table filled. Falls back to intrinsic auto layout before the
   * region is measured or when no column opts into resizing.
   */
  private readonly isFillFlexLayout = computed(
    () => !this.isFixedLayout() && this.hasResizableColumns() && this.regionViewportWidth() > 0
  );

  /**
   * Authoritative widths drive the layout: either explicit `fixed` sizing mode or
   * fill flex. Renders the colgroup and switches the table to `table-layout: fixed`.
   */
  protected readonly usesAuthoritativeLayout = computed(() => this.isFixedLayout() || this.isFillFlexLayout());

  /**
   * Per-column widths used for sticky pinned offsets, the colgroup, and the keyboard
   * resize base. Fill flex distributes the region across columns (see below); fixed
   * mode and non-resizable fill use measured headers, then fixed sizing, then
   * `column.getSize()`.
   */
  protected readonly resolvedColumnWidths = computed<Record<string, number>>(() => {
    const visibleColumns = this.visibleColumns();
    const columnSizing = this.mergedState().columnSizing;

    // Fill flex: resized columns keep their exact width; the rest share the remaining
    // region width in proportion to their intrinsic size (never below their min), so
    // the widths sum to the region and the table stays filled while each resize is
    // pixel-exact under table-layout: fixed.
    return this.isFillFlexLayout()
      ? this.computeFillFlexWidths(visibleColumns, columnSizing)
      : this.computeIntrinsicWidths(visibleColumns, columnSizing);
  });

  /**
   * Fill-flex width distribution: resized columns keep their exact (clamped) width;
   * the remaining columns each get their min plus a proportional share of the surplus,
   * so the widths sum to the region and no flex column drops below its min.
   */
  private computeFillFlexWidths(
    visibleColumns: readonly Column<TData, unknown>[],
    columnSizing: ColumnSizingState
  ): Record<string, number> {
    const container = this.regionViewportWidth();
    const widths: Record<string, number> = {};
    const flex: { id: string; weight: number; min: number }[] = [];
    let sumPinned = 0;
    let totalWeight = 0;
    let sumFlexMins = 0;

    for (const column of visibleColumns) {
      const resizedWidth = readColumnEntry(columnSizing, column.id);

      if (resizedWidth !== undefined) {
        const width = this.clampColumnWidth(column, resizedWidth);

        widths[column.id] = width;
        sumPinned += width;
      } else {
        const weight = Math.max(Math.round(column.getSize()), 1);
        const min = this.getResizeBounds(column).min;

        flex.push({ id: column.id, weight, min });
        totalWeight += weight;
        sumFlexMins += min;
      }
    }

    // Every column pinned: authoritative widths, region scrolls if they overflow.
    if (flex.length === 0) {
      return widths;
    }

    // Each flex column gets its min plus a share of the leftover space (in
    // proportion to intrinsic size); the last absorbs the exact remainder so the
    // widths sum to the region — no gap, no overflow — and no flex column drops
    // below its min. When the pinned columns leave no surplus, the flex columns
    // sit at their mins and the region scrolls.
    const surplus = Math.max(0, container - sumPinned - sumFlexMins);
    let distributedSurplus = 0;

    flex.forEach(({ id, weight, min }, index) => {
      // Math.floor never over-allocates, so the running sum stays <= surplus and the
      // last column gets the exact remainder (always >= 0) — the widths sum to the
      // container with no sub-pixel overflow. (The old Math.round could over-allocate
      // and leave the last column a negative share, pushing the total 1–2px past the
      // region.)
      const extra = index === flex.length - 1 ? surplus - distributedSurplus : Math.floor((surplus * weight) / totalWeight);

      distributedSurplus += extra;
      // Honor the column's own maxSize: a flex column never renders wider than its cap.
      // ponytail: if every flex column is capped below its share the table may sit
      // slightly under-filled (rare); we don't redistribute the capped remainder.
      const flexColumn = this.table.getColumn(id);
      const flexMax = flexColumn ? this.getResizeBounds(flexColumn).max : null;
      const width = min + Math.max(0, extra);

      widths[id] = flexMax !== null ? Math.min(width, flexMax) : width;
    });

    return widths;
  }

  /**
   * Intrinsic (auto) / fixed-mode width resolution.
   * Precedence: user-resized > measured header (auto layout only) > fixed def size > getSize().
   */
  private computeIntrinsicWidths(
    visibleColumns: readonly Column<TData, unknown>[],
    columnSizing: ColumnSizingState
  ): Record<string, number> {
    const measured = this.measuredHeaderWidths();
    const userColumnSizing = this.userColumnSizing();
    const usesAuthoritativeLayout = this.usesAuthoritativeLayout();
    const result: Record<string, number> = {};

    for (const column of visibleColumns) {
      result[column.id] = this.resolveIntrinsicColumnWidth(column, {
        measuredWidth: measured[column.id],
        sizing: userColumnSizing[column.id],
        resizedWidth: columnSizing[column.id],
        usesAuthoritativeLayout
      });
    }

    return result;
  }

  /**
   * Resolves one column's intrinsic width by precedence. The measured-header fallback
   * applies only in auto layout: under an authoritative colgroup the "measured" width is
   * just last frame's forced colgroup width, so using it would defeat a columnSizing reset.
   */
  private resolveIntrinsicColumnWidth(
    column: Column<TData, unknown>,
    context: {
      measuredWidth: number | undefined;
      sizing: TableColumnSizingState | undefined;
      resizedWidth: number | undefined;
      usesAuthoritativeLayout: boolean;
    }
  ): number {
    const { measuredWidth, sizing, resizedWidth, usesAuthoritativeLayout } = context;

    if (resizedWidth !== undefined) {
      return this.clampColumnWidth(column, resizedWidth);
    }

    if (!usesAuthoritativeLayout && measuredWidth !== undefined && measuredWidth > 0) {
      return measuredWidth;
    }

    const fixedWidth = sizing?.hasSize === true ? getNumericColumnWidth(column.getSize()) : null;

    return fixedWidth ?? Math.max(Math.round(column.getSize()), 1);
  }

  /**
   * Sum of all visible column widths, used as the table width in fixed-layout
   * mode so columns render at exactly their resolved widths (`table-layout:
   * fixed`) and the region scrolls once the total exceeds the viewport.
   */
  protected readonly fixedLayoutTableWidth = computed(() => {
    const widths = this.resolvedColumnWidths();

    return this.visibleColumns().reduce((total, column) => total + (widths[column.id] ?? 0), 0);
  });

  protected readonly columnRenderStates = computed<Record<string, TableColumnRenderState>>(() => {
    const visibleColumns = this.visibleColumns();
    const widths = this.resolvedColumnWidths();
    const state = this.mergedState();
    const visibleColumnsById = new Map(visibleColumns.map((column) => [column.id, column] as const));
    const leftVisibleColumns = resolvePinnedZoneColumns(state.columnPinning.left, visibleColumnsById);
    const rightVisibleColumns = resolvePinnedZoneColumns(state.columnPinning.right, visibleColumnsById);
    const context: ColumnRenderStateContext<TData> = {
      widths,
      state,
      userColumnSizing: this.userColumnSizing(),
      primarySortColumnId: state.sorting.at(0)?.id ?? null,
      leftVisibleColumns,
      rightVisibleColumns,
      leftPinnedIds: new Set(leftVisibleColumns.map((column) => column.id)),
      rightPinnedIds: new Set(rightVisibleColumns.map((column) => column.id)),
      leftOffsets: accumulatePinnedOffsets(leftVisibleColumns, widths),
      rightOffsets: accumulatePinnedOffsets([...rightVisibleColumns].reverse(), widths)
    };
    const result: Record<string, TableColumnRenderState> = {};

    for (const column of visibleColumns) {
      result[column.id] = buildColumnRenderState(column, context);
    }

    return result;
  });

  public constructor() {
    this.natTableService.setController(this);

    this.registerKeybindingValidationEffect();
    this.registerSeedEffect();
    this.registerRenderCycleEffect();
    this.registerAnnouncementEffect();
    this.registerResizeAnnouncementEffect();
    this.registerHeaderObservationEffects();
    this.registerCacheInvalidationEffect();

    this.destroyRef.onDestroy(() => this.headerResizeObserver?.disconnect());
  }

  /** Dev-only: warns when configured keybindings overlap. */
  private registerKeybindingValidationEffect(): void {
    effect(() => {
      const bindings = this.natTableService.keybindings();

      if (isDevMode()) {
        const warnings = validateKeybindings(bindings);

        for (const warning of warnings) {
          console.warn(`[ng-advanced-table] ${warning}`);
        }
      }
    });
  }

  /** Seeds internal state from the surface's initial state on first run. */
  private registerSeedEffect(): void {
    effect(() => {
      if (this.hasSeededInitialState()) {
        return;
      }

      this.seedInitialState(this.initialState());
    });
  }

  /**
   * Tracks render cycles for the row-render emitter. A "cycle" is any change that
   * might cause rows to re-paint. Both signals are consumed purely by the internal
   * emitter directive (and remain inert when emitRowRenderEvents is disabled).
   */
  private registerRenderCycleEffect(): void {
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
  }

  /** Announces accessibility changes (sorting, filtering, selection, pagination) once seeded. */
  private registerAnnouncementEffect(): void {
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
  }

  private registerCacheInvalidationEffect(): void {
    effect(() => {
      // Access columnRenderStates to react to column visibility/ordering changes and invalidate cache
      this.columnRenderStates();
      this.cachedHeaderCells = [];
      this.cachedTableEl = null;
      this.cachedTheadEl = null;
    });
  }

  /**
   * Announces the final width once a pointer/touch resize drag ends. Keyed off
   * TanStack's `isResizingColumn`, set only for pointer drags (never keyboard),
   * so this never double-announces with the keyboard path.
   */
  private registerResizeAnnouncementEffect(): void {
    effect(() => {
      const resizingColumnId = this.table.getState().columnSizingInfo.isResizingColumn || null;

      untracked(() => this.handleResizeEnd(resizingColumnId));
    });
  }

  /** Fires the resize-end announcement when a pointer resize transitions to idle. */
  private handleResizeEnd(resizingColumnId: string | null): void {
    const previous = this.previousResizingColumnId;

    this.previousResizingColumnId = resizingColumnId;

    if (!previous || resizingColumnId || !this.enableAnnouncements()) {
      return;
    }

    const commit = this.resizeCommit;

    this.resizeCommit = null;

    if (commit?.columnId !== previous) {
      return;
    }

    const column = this.table.getColumn(previous);

    if (column) {
      this.announceColumnResize(column, commit.width);
    }
  }

  /** Wires up header-width measurement and the imperative aria-multiselectable attribute. */
  private registerHeaderObservationEffects(): void {
    afterNextRender(() => {
      this.initializeHeaderObservation();
      this.setupStickyHeaderScrollListener();
    });
    afterRenderEffect(() => {
      this.visibleColumnIds();
      this.bodyRows();
      this.bodyState();
      this.reattachHeaderObservers();
      this.measureTableDimensions();
      this.updateStickyHeaderPosition();
    });
    afterRenderEffect(() => {
      const multiSelectable = this.ariaMultiSelectable();
      const table = this.tableRegionRef()?.nativeElement.querySelector('table');

      if (!table) {
        return;
      }

      if (multiSelectable) {
        table.setAttribute('aria-multiselectable', 'true');
      } else {
        table.removeAttribute('aria-multiselectable');
      }
    });
  }

  /** Seeds the internal (uncontrolled) state signals from the surface's initial state, once. */
  private seedInitialState(initialState: Partial<NatTableState>): void {
    const seed = resolveSeedState(initialState, DEFAULT_TABLE_STATE);

    this.internalSorting.set(normalizeSortingState(seed.sorting, this.enableMultiSort()));
    this.internalGlobalFilter.set(this.enableGlobalFilter() ? seed.globalFilter : '');
    this.internalColumnFilters.set(seed.columnFilters);
    this.internalColumnVisibility.set(seed.columnVisibility);
    this.internalColumnOrder.set(seed.columnOrder);
    this.internalColumnPinning.set(seed.columnPinning);
    this.internalColumnSizing.set(seed.columnSizing);
    this.internalRowSelection.set(normalizeRowSelection(seed.rowSelection, this.selectionMode() === 'multiple'));
    this.internalPagination.set(seed.pagination);
    this.hasSeededInitialState.set(true);

    untracked(() => this.natTableService.notifyStateChange(this.mergedState()));
  }

  /** Apply a partial state update from companion controls (search, pager, filters). Respects controlled and uncontrolled slices. */
  public patchState(
    updaters: Partial<{
      [K in keyof NatTableState]: Updater<NatTableState[K]>;
    }>
  ): void {
    this.updateState(updaters);
  }

  protected isLeafHeaderRow(headerGroup: HeaderGroup<TData>): boolean {
    return headerGroup.id === this.leafHeaderRowId();
  }

  /** Template-bound alias for the colocated util (kept a field so the template can call it). */
  protected readonly getHeaderRowColumnIds = getHeaderRowColumnIds<TData>;

  /** Template-bound alias for the colocated util. */
  protected readonly shouldHidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel<TData>;

  /** Template-bound alias for the colocated cell-tone util. */
  protected readonly getCellTone = getCellTone<TData>;

  /** Host/template focusin handler — bound to the imported helper (no instance state). */
  protected readonly onCellFocusIn = handleCellInteractionFocusIn;

  protected canReorderHeader(header: Header<TData, unknown>): boolean {
    if (header.isPlaceholder) {
      return false;
    }

    return this.getVisibleZoneColumnIds(getColumnZone(header.column)).length > 1;
  }

  protected onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void {
    if (!this.isLeafHeaderRow(headerGroup) || event.previousIndex === event.currentIndex) {
      return;
    }

    const rowColumnIds = this.getHeaderRowColumnIds(headerGroup);
    const movingColumnId = resolveDraggedColumnId(event, rowColumnIds);

    if (!movingColumnId) {
      return;
    }

    const zone = this.getColumnZoneById(movingColumnId);

    if (!zone || !this.isDropIndexWithinZone(rowColumnIds, zone, event.currentIndex)) {
      return;
    }

    const reorderedRowColumnIds = moveItemInArrayCopy(rowColumnIds, event.previousIndex, event.currentIndex);
    const nextVisibleZoneOrder = reorderedRowColumnIds.filter((columnId) => this.getColumnZoneById(columnId) === zone);

    this.applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder);
  }

  protected onHeaderKeydown(event: KeyboardEvent, column: Column<TData, unknown>): void {
    const keyboard = this.natTableService.keyboard();

    if (handleCellInteractionKeydown(event, keyboard.cellInteraction)) return;

    // Alt+Arrow steps the focused header's column; Alt+Home/End jump to its min/max
    // width. This is the keyboard resize path — the handle itself is mouse-only.
    // Column reordering uses Control/Command+Shift+Arrow (handled below).
    if (event.altKey && !event.shiftKey && isResizeKey(event)) {
      this.resizeColumnFromKey(event, column);

      return;
    }

    const directionDelta = keyboard.columnReorderDirection(event);

    if (directionDelta === null) return;

    const zone = getColumnZone(column);
    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
    const currentIndex = visibleZoneColumnIds.indexOf(column.id);

    if (currentIndex === -1 || visibleZoneColumnIds.length < 2) return;

    event.preventDefault();
    event.stopPropagation();

    this.moveColumnByDelta(column.id, directionDelta);
  }

  protected onCellKeydown(event: KeyboardEvent): void {
    handleCellInteractionKeydown(event, this.natTableService.keyboard().cellInteraction);
  }

  /** Template-bound alias for the colocated util. */
  protected readonly canResizeColumn = canResizeColumn<TData>;

  protected onResizeStart(event: MouseEvent | TouchEvent, header: Header<TData, unknown>): void {
    if (!this.canResizeColumn(header)) {
      return;
    }

    // Stop the pointer gesture from also starting a cdkDrag column reorder.
    event.stopPropagation();
    this.seedColumnSizingFromMeasuredWidth(header.column);
    this.captureResizeGuideOrigin(event);
    header.getResizeHandler()(event);
    // The start size is now captured into columnSizingInfo; drop the transient
    // overlay so a later controlled reset of this column isn't blocked.
    this.resizeSeedSizing.set({});
  }

  /**
   * Seed an auto-sized column's `columnSizing` entry with its real rendered
   * width before a pointer resize begins.
   *
   * TanStack's `getResizeHandler` captures `startSize = column.getSize()`
   * synchronously at pointer-down, and `getSize()` returns the default size
   * (150) for columns that were never explicitly sized — not the width the
   * user actually sees. Without this, a mouse drag (and the resize guide)
   * starts from 150 while keyboard resizing starts from the measured width,
   * so the two disagree and keyboard resizes overshoot the table bounds.
   */
  private seedColumnSizingFromMeasuredWidth(column: Column<TData, unknown>): void {
    const alreadyResized = readColumnEntry(this.mergedState().columnSizing, column.id) !== undefined;
    const explicitlySized = readColumnEntry(this.userColumnSizing(), column.id)?.hasSize === true;

    // In fill flex layout the rendered width is the flex-distributed width, not the
    // column's `size`, so an explicitly-sized column must still be seeded from its
    // effective width or a pointer drag would start from `getSize()` and jump.
    if (alreadyResized || (explicitlySized && !this.isFillFlexLayout())) {
      return;
    }

    const measuredWidth = this.getColumnEffectiveWidth(column);

    this.updateState({
      columnSizing: (current) => ({ ...current, [column.id]: measuredWidth })
    });

    // A controlled `columnSizing` binding can't reflect this update within the
    // synchronous pointer-down, so also stage it as a transient overlay that
    // mergedState applies until the binding catches up (cleared in onResizeStart).
    this.resizeSeedSizing.set({ [column.id]: measuredWidth });

    // The TanStack Angular adapter only applies state into the table options
    // when its table signal is pulled. Read state here to flush the seed
    // synchronously, so the resize handler (called next) reads the seeded
    // width instead of the stale default. Do not remove — the bare read is the
    // flush. See createAngularTable in @tanstack/angular-table.
    this.table.getState();
  }

  // Pixel offset of the dragged column's resize edge within the scrollable
  // region content box. The sticky-header `<th>` clips the handle's own line to
  // header height, so a separate full-height guide is anchored here instead.
  private readonly resizeGuideOrigin = signal<number | null>(null);

  /** Full-height drag guide position: column edge + live drag delta, or null when idle. */
  protected readonly columnResizeGuide = computed<{ left: number; offset: number } | null>(() => {
    const info = this.table.getState().columnSizingInfo;
    const origin = this.resizeGuideOrigin();
    const resizingId = info.isResizingColumn;

    if (resizingId === false || origin === null) return null;

    const widthDelta = info.deltaOffset ?? 0;
    const column = this.table.getColumn(resizingId);

    if (!column) return { left: origin, offset: widthDelta };

    // deltaOffset is the column's WIDTH change (TanStack: newWidth = startSize +
    // deltaOffset, already direction-adjusted via columnResizeDirection). Clamp it
    // to the column's bounds so the guide never points past where the resize can
    // land, then map the width delta to a screen offset — in RTL the visual edge
    // moves opposite the column's growth.
    const { min, max } = this.getResizeFitBounds(column);
    const startSize = info.startSize ?? this.getColumnEffectiveWidth(column);
    const clampedDelta = Math.max(min - startSize, max !== null ? Math.min(max - startSize, widthDelta) : widthDelta);

    return {
      left: origin,
      offset: this.resolvedDirection() === 'rtl' ? -clampedDelta : clampedDelta
    };
  });

  /** True while a pointer/touch column-resize drag is in progress. */
  protected readonly isColumnResizing = computed(() => this.table.getState().columnSizingInfo.isResizingColumn !== false);

  private captureResizeGuideOrigin(event: MouseEvent | TouchEvent): void {
    const region = this.tableRegionRef()?.nativeElement;
    const handle = event.currentTarget as HTMLElement | null;

    if (!region || !handle) {
      this.resizeGuideOrigin.set(null);

      return;
    }

    const regionRect = region.getBoundingClientRect();
    const handleRect = handle.getBoundingClientRect();
    // The resize edge sits on the column's trailing side: right in LTR, left in RTL.
    const edge = this.resolvedDirection() === 'rtl' ? handleRect.left : handleRect.right;

    this.resizeGuideOrigin.set(edge - regionRect.left + region.scrollLeft);
  }

  /**
   * Resize `column` by one keyboard step from a horizontal arrow (Home/End jump to
   * the min/max bound). Driven by Alt+Arrow / Alt+Home/End on the focused header.
   * RTL-aware and fit/min/max clamped; a no-op resize bails without emitting.
   */
  private resizeColumnFromKey(event: KeyboardEvent, column: Column<TData, unknown>): void {
    if (!isColumnResizable(column)) return;

    const { min, max } = this.getResizeFitBounds(column);
    const current = this.getColumnEffectiveWidth(column);
    // Alt+Shift+Arrow never reaches this method (it matches neither resize nor reorder),
    // so the large step is unreachable here; keep it for the End fallback below.
    const step = RESIZE_KEYBOARD_STEP;
    // In RTL the resize edge sits on the column's left, so the arrow pointing at it
    // (ArrowLeft) must grow the column, mirroring the pointer-drag handle.
    const towardEdge = this.resolvedDirection() === 'rtl' ? -step : step;
    let next: number;

    switch (event.key) {
      case 'ArrowLeft':
        next = current - towardEdge;
        break;
      case 'ArrowRight':
        next = current + towardEdge;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max ?? current + RESIZE_KEYBOARD_STEP_LARGE;
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const clamped = Math.max(min, max !== null ? Math.min(max, next) : next);

    // At a bound the press cannot change the width, but a keyboard/SR user still needs
    // to learn the column's range — so announce the bound WITHOUT emitting a sizing
    // change (announcing is not a state change; no columnSizing event fires here).
    if (clamped === current) {
      this.announceColumnResize(column, current);

      return;
    }

    this.updateState({
      columnSizing: (currentSizing) => ({ ...currentSizing, [column.id]: clamped })
    });
    this.announceColumnResize(column, clamped);
  }

  private getResizeBounds(column: Column<TData, unknown>): { min: number; max: number | null } {
    // An explicit `minSize` wins; otherwise fall back to a usable default instead of
    // TanStack's 20px (which is narrower than the resize handle). hasMinSize reads the
    // original input def, so it is true only when the consumer set minSize themselves.
    const explicitMin = readColumnEntry(this.userColumnSizing(), column.id)?.hasMinSize === true;
    const rawMin = explicitMin ? column.columnDef.minSize : DEFAULT_MIN_COLUMN_WIDTH;
    const min = Math.max(Math.round(rawMin ?? DEFAULT_MIN_COLUMN_WIDTH), 1);
    const rawMax = column.columnDef.maxSize;
    const max = typeof rawMax === 'number' && Number.isFinite(rawMax) && rawMax < Number.MAX_SAFE_INTEGER ? Math.round(rawMax) : null;

    return { min, max };
  }

  /**
   * Resize bounds tightened to "fit": a drag can grow a column only into the
   * space the other columns leave, so the table never gets wider than the
   * visible region. Never reports below the column's current width (an
   * already-overflowing table shrinks but does not jump) and never exceeds the
   * column's own maxSize. Falls back to the plain bounds until the region is measured.
   */
  private getResizeFitBounds(column: Column<TData, unknown>): { min: number; max: number | null } {
    const { min, max: ownMax } = this.getResizeBounds(column);
    const region = this.regionViewportWidth();

    // Fixed (authoritative) layout is designed to grow and scroll, so the "fit to
    // viewport" cap must not apply: a resize can push the column past the region and
    // the table widens. Only fill mode keeps the table inside the visible region.
    if (this.isFixedLayout()) {
      return { min, max: ownMax };
    }

    if (region <= 0) {
      return { min, max: ownMax };
    }

    const widths = this.resolvedColumnWidths();
    const columnSizing = this.mergedState().columnSizing;
    let sumOthers = 0;

    for (const other of this.visibleColumns()) {
      if (other.id === column.id) continue;

      // In fill flex layout, growing this column shrinks the non-resized (flex)
      // columns down to their mins to keep the table filled, while resized columns
      // stay put; elsewhere the other columns hold their current widths. So the most
      // this column can take is the region minus every other column's floor.
      sumOthers +=
        this.isFillFlexLayout() && readColumnEntry(columnSizing, other.id) === undefined
          ? this.getResizeBounds(other).min
          : (widths[other.id] ?? 0);
    }

    const current = widths[column.id] ?? this.getColumnEffectiveWidth(column);
    const fitMax = Math.max(current, region - sumOthers);
    const cappedMax = ownMax !== null ? Math.min(ownMax, fitMax) : fitMax;

    return { min, max: Math.max(Math.round(cappedMax), min) };
  }

  /** Clamp a single width to a column's [minSize, maxSize] bounds, rounded to a positive integer. */
  private clampColumnWidth(column: Column<TData, unknown>, width: number): number {
    const { min, max } = this.getResizeBounds(column);
    const clamped = Math.max(min, max !== null ? Math.min(max, width) : width);

    return Math.max(Math.round(clamped), 1);
  }

  /**
   * Clamp every entry of a column-sizing map to its column's resize bounds.
   * TanStack's resize handler stores the raw drag width without honoring
   * minSize/maxSize (only `column.getSize()` clamps on read), so a drag can
   * persist an out-of-range width. Clamping on commit keeps the stored state, the
   * emitted `columnSizingChange`, and the rendered column width in range.
   */
  private clampColumnSizing(sizing: ColumnSizingState): ColumnSizingState {
    let result: ColumnSizingState | null = null;

    for (const columnId of Object.keys(sizing)) {
      const column = this.table.getColumn(columnId);

      if (!column) continue;

      const clamped = this.clampColumnWidth(column, sizing[columnId]);

      if (clamped !== sizing[columnId]) {
        (result ??= { ...sizing })[columnId] = clamped;
      }
    }

    return result ?? sizing;
  }

  /**
   * Commit a column-sizing change from TanStack's pointer/touch resize handler.
   * While the drag is still active (`isResizingColumn` is reset only AFTER the
   * size commit in table-core), snapshot the clamped committed width so the
   * resize-end effect can announce it without waiting for a controlled
   * `columnSizing` binding to echo back a cycle later.
   */
  private applyColumnSizingChange(updater: Updater<ColumnSizingState>): void {
    const resizingColumnId = this.table.getState().columnSizingInfo.isResizingColumn;

    if (typeof resizingColumnId !== 'string') {
      this.updateState({ columnSizing: updater });

      return;
    }

    // Clamp the dragged column to its fit bounds so the table never grows past
    // the visible region, then store the capped map (not the raw updater) so the
    // committed/controlled width matches what renders and what is announced.
    const next: ColumnSizingState = {
      ...resolveUpdater(this.mergedState().columnSizing, updater)
    };
    const column = this.table.getColumn(resizingColumnId);
    const raw = readColumnEntry(next, resizingColumnId);

    if (column && raw !== undefined) {
      const { min, max } = this.getResizeFitBounds(column);
      const capped = Math.max(min, max !== null ? Math.min(max, raw) : raw);

      next[resizingColumnId] = capped;
      this.resizeCommit = { columnId: resizingColumnId, width: Math.round(capped) };
    } else {
      this.resizeCommit = null;
    }

    this.updateState({ columnSizing: next });
  }

  private getColumnEffectiveWidth(column: Column<TData, unknown>): number {
    // Clamp to the column's own resize bounds. In fill layout the measured width
    // can stretch a column past its maxSize (or below minSize), so seeding the
    // resize base from the raw measurement would make the first keystroke after a
    // neighbouring resize jump: a "grow" press would clamp straight down to the bound
    // instead of stepping by one. clampColumnWidth also rounds and floors at 1px so the
    // committed and announced width stays a whole number of pixels.
    return this.clampColumnWidth(column, this.resolvedColumnWidths()[column.id] ?? column.getSize());
  }

  private announceColumnResize(column: Column<TData, unknown>, width: number): void {
    const label = resolveColumnLabel(column);
    const formatter = this.resolvedAccessibilityText().columnResize;
    // Flag the bounds with the SAME limits the resize obeys: min from getResizeBounds,
    // max from getResizeFitBounds (the fill-mode fit cap, or the plain ownMax in fixed
    // mode). So a keyboard/SR user hears "(minimum)"/"(maximum)" exactly when a further
    // press in that direction would be a no-op.
    const { min } = this.getResizeBounds(column);
    const { max } = this.getResizeFitBounds(column);
    const context: NatTableAccessibilityColumnResizeAnnouncementContext = {
      columnId: column.id,
      label,
      widthValue: width,
      widthText: this.formatAccessibilityNumber(width),
      atMinimum: width <= min,
      atMaximum: max !== null && width >= max
    };

    this.announce(formatter?.(context) ?? '');
  }

  protected onRowRendered(event: NatTableRowRenderedEvent): void {
    this.rowRendered.emit(event);
  }

  protected rowAriaSelected(row: Row<TData>): boolean | null {
    return this.enableRowSelection() ? row.getIsSelected() : null;
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
      originalEvent: event
    });
  }

  protected onRowKeydown(event: KeyboardEvent, row: Row<TData>): void {
    if (event.defaultPrevented) {
      return;
    }

    if (!this.natTableService.keyboard().rowActivate(event)) {
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
      originalEvent: event
    });
  }

  private updateState(
    updaters: Partial<{
      [K in keyof NatTableState]: Updater<NatTableState[K]>;
    }>
  ): void {
    const currentState = this.mergedState();
    const nextState: NatTableState = {
      sorting: normalizeSortingState(resolveUpdater(currentState.sorting, updaters.sorting), this.enableMultiSort()),
      globalFilter: resolveUpdater(currentState.globalFilter, updaters.globalFilter),
      columnFilters: resolveUpdater(currentState.columnFilters, updaters.columnFilters),
      columnVisibility: resolveUpdater(currentState.columnVisibility, updaters.columnVisibility),
      columnOrder: normalizeColumnOrder(resolveUpdater(currentState.columnOrder, updaters.columnOrder), this.allLeafColumnIds()),
      columnPinning: normalizeColumnPinning(
        resolveUpdater(currentState.columnPinning, updaters.columnPinning),
        this.allLeafColumnIds()
      ),
      columnSizing: this.clampColumnSizing(resolveUpdater(currentState.columnSizing, updaters.columnSizing)),
      rowSelection: normalizeRowSelection(
        resolveUpdater(currentState.rowSelection, updaters.rowSelection),
        this.selectionMode() === 'multiple'
      ),
      pagination: resolveUpdater(currentState.pagination, updaters.pagination)
    };

    this.commitInternalState(nextState);
    this.natTableService.notifyStateChange(nextState);
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

    if (controlled.columnSizing === undefined) {
      this.internalColumnSizing.set(nextState.columnSizing);
    }

    if (controlled.rowSelection === undefined) {
      this.internalRowSelection.set(nextState.rowSelection);
    }

    if (controlled.pagination === undefined) {
      this.internalPagination.set(nextState.pagination);
    }
  }

  private isDropIndexWithinZone(rowColumnIds: readonly string[], zone: ColumnReorderZone, currentIndex: number): boolean {
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

  private applyVisibleZoneReorder(zone: ColumnReorderZone, movingColumnId: string, nextVisibleZoneOrder: readonly string[]): void {
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
      const nextColumnOrder = replaceIdsInSlots(currentState.columnOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));

      if (hasSameStringOrder(currentState.columnOrder, nextColumnOrder)) {
        return;
      }

      this.updateState({ columnOrder: nextColumnOrder });
      this.announceColumnReorder(label, zone, nextVisibleZoneOrder, movingColumnId);
      this.scrollColumnHeaderIntoView(movingColumnId);

      return;
    }

    const currentPinnedZoneOrder = (zone === 'left' ? currentState.columnPinning.left : currentState.columnPinning.right) ?? [];
    const nextPinnedZoneOrder = replaceIdsInSlots(currentPinnedZoneOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));

    if (hasSameStringOrder(currentPinnedZoneOrder, nextPinnedZoneOrder)) {
      return;
    }

    this.updateState({
      columnPinning: {
        ...currentState.columnPinning,
        [zone]: nextPinnedZoneOrder
      }
    });
    this.announceColumnReorder(label, zone, nextVisibleZoneOrder, movingColumnId);
    this.scrollColumnHeaderIntoView(movingColumnId);
  }

  private canMoveColumn(columnId: string, direction: NatTableColumnMoveDirection): boolean {
    return this.canMoveColumnByDelta(columnId, direction === 'left' ? -1 : 1);
  }

  private moveColumn(columnId: string, direction: NatTableColumnMoveDirection): void {
    this.moveColumnByDelta(columnId, direction === 'left' ? -1 : 1);
  }

  private canMoveColumnByDelta(columnId: string, directionDelta: ColumnReorderKeyboardDirection): boolean {
    const zone = this.getColumnZoneById(columnId);

    if (!zone) return false;

    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);

    return getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta) !== null;
  }

  private moveColumnByDelta(columnId: string, directionDelta: ColumnReorderKeyboardDirection): void {
    const zone = this.getColumnZoneById(columnId);

    if (!zone) return;

    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
    const currentIndex = visibleZoneColumnIds.indexOf(columnId);
    const nextIndex = getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta);

    if (nextIndex === null) return;

    const nextVisibleZoneOrder = moveItemInArrayCopy(visibleZoneColumnIds, currentIndex, nextIndex);

    this.applyVisibleZoneReorder(zone, columnId, nextVisibleZoneOrder);
  }

  private scrollColumnHeaderIntoView(columnId: string): void {
    afterNextRender(
      {
        write: () => {
          const scrollContainer = this.tableScrollContainer();
          const headerElement = this.getHeaderElement(columnId);

          if (!scrollContainer || !headerElement) {
            return;
          }

          scrollElementHorizontallyIntoView(scrollContainer, headerElement);
        }
      },
      { injector: this.injector }
    );
  }

  private getHeaderElement(columnId: string): HTMLElement | null {
    const tableRegion = this.tableRegionRef()?.nativeElement;

    if (!tableRegion) {
      return null;
    }

    const headers = tableRegion.querySelectorAll<HTMLElement>('thead th[data-column-id]');

    for (const header of headers) {
      if (header.getAttribute('data-column-id') === columnId) {
        return header;
      }
    }

    return null;
  }

  private announceColumnReorder(
    label: string,
    zone: ColumnReorderZone,
    nextVisibleZoneOrder: readonly string[],
    movingColumnId: string
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
      totalText: this.formatAccessibilityNumber(nextVisibleZoneOrder.length)
    };

    this.announce(formatter?.(context) ?? '');
  }

  private getColumnZoneById(columnId: string): ColumnReorderZone | null {
    const column = this.table.getColumn(columnId);

    return column ? getColumnZone(column) : null;
  }

  private getVisibleZoneColumnIds(zone: ColumnReorderZone): string[] {
    return this.table
      .getVisibleLeafColumns()
      .filter((column) => getColumnZone(column) === zone)
      .map((column) => column.id);
  }

  private initializeHeaderObservation(): void {
    if (typeof ResizeObserver === 'undefined' || this.headerResizeObserver) return;

    this.headerResizeObserver = new ResizeObserver(() => {
      this.measureHeaderWidths();
      this.measureRegionViewportWidth();
    });
    this.reattachHeaderObservers();
  }

  private reattachHeaderObservers(): void {
    const observer = this.headerResizeObserver;
    const region = this.tableRegionRef()?.nativeElement;

    if (!observer || !region) return;

    observer.disconnect();
    observer.observe(region);

    const headerCells = region.querySelectorAll<HTMLTableCellElement>('thead th[data-column-id]');

    for (const cell of headerCells) {
      observer.observe(cell);
    }

    this.measureHeaderWidths();
    this.measureRegionViewportWidth();
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

  private updateCachedStickyTop(): void {
    const region = this.tableRegionRef()?.nativeElement;

    if (!region) {
      return;
    }
    const computedVar = window.getComputedStyle(region).getPropertyValue('--nat-table-sticky-top').trim();

    if (!computedVar) {
      this.cachedStickyTop = 0;

      return;
    }

    if (/^-?\d+(\.\d+)?(px)?$/.test(computedVar)) {
      this.cachedStickyTop = parseFloat(computedVar) || 0;

      return;
    }

    try {
      const temp = document.createElement('div');

      temp.style.position = 'absolute';
      temp.style.visibility = 'hidden';
      temp.style.pointerEvents = 'none';
      temp.style.height = computedVar;
      region.appendChild(temp);
      const computedHeight = window.getComputedStyle(temp).height;

      region.removeChild(temp);
      this.cachedStickyTop = parseFloat(computedHeight) || 0;
    } catch {
      this.cachedStickyTop = parseFloat(computedVar) || 0;
    }
  }

  private measureTableDimensions(): void {
    const region = this.tableRegionRef()?.nativeElement;
    const tableEl = this.cachedTableEl ?? region?.querySelector('table');
    const theadEl = this.cachedTheadEl ?? tableEl?.querySelector('thead');

    if (!region || !tableEl || !theadEl) {
      return;
    }

    this.cachedTableEl = tableEl as HTMLTableElement;
    this.cachedTheadEl = theadEl as HTMLTableSectionElement;

    const rect = tableEl.getBoundingClientRect();

    this.tablePageTop = rect.top + window.scrollY;
    this.theadHeight = theadEl.getBoundingClientRect().height;
    this.tableHeight = rect.height;

    // Check vertical scrollability of region
    const overflowY = window.getComputedStyle(region).overflowY;

    this.isRegionScrollable = region.scrollHeight > region.clientHeight && (overflowY === 'auto' || overflowY === 'scroll');

    if (this.isRegionScrollable) {
      tableEl.classList.add('is-region-scrollable');
    } else {
      tableEl.classList.remove('is-region-scrollable');
    }

    if (browserSupportsScrollTimeline()) {
      const rangeStart = Math.max(0, this.tablePageTop - this.cachedStickyTop);
      const maxTranslate = Math.max(0, this.tableHeight - this.theadHeight);
      const rangeEnd = rangeStart + maxTranslate;

      this.cachedStickyRangeStart = rangeStart;
      this.cachedStickyMaxTranslate = maxTranslate;

      tableEl.style.setProperty('--nat-table-sticky-range-start', `${rangeStart}px`);
      tableEl.style.setProperty('--nat-table-sticky-range-end', `${rangeEnd}px`);
      tableEl.style.setProperty('--nat-table-sticky-max-translate', `${maxTranslate}px`);
    }
  }

  /**
   * Nudges the scroll-timeline range from its cached layout anchor so the
   * compositor translate matches live table geometry without recomputing
   * document offsets every frame.
   */
  private updateScrollTimelineViewportCorrection(): void {
    const region = this.tableRegionRef()?.nativeElement;
    const tableEl = this.cachedTableEl ?? region?.querySelector<HTMLTableElement>('table');

    if (!tableEl || !browserSupportsScrollTimeline() || this.isRegionScrollable || !this.stickyHeader() || !this.isTableVisible) {
      return;
    }

    const visualOffsetTop = readVisualViewportOffsetTop();
    const rectTop = tableEl.getBoundingClientRect().top - visualOffsetTop;
    const timelineTranslate = Math.min(
      Math.max(0, window.scrollY - this.cachedStickyRangeStart),
      this.cachedStickyMaxTranslate
    );
    let expectedTranslate = 0;

    if (rectTop < this.cachedStickyTop) {
      expectedTranslate = Math.min(Math.max(0, this.cachedStickyTop - rectTop), this.cachedStickyMaxTranslate);
    }

    const correction = expectedTranslate - timelineTranslate;
    const adjustedRangeStart = Math.max(0, this.cachedStickyRangeStart - correction);

    tableEl.style.setProperty('--nat-table-sticky-range-start', `${adjustedRangeStart}px`);
    tableEl.style.setProperty(
      '--nat-table-sticky-range-end',
      `${adjustedRangeStart + this.cachedStickyMaxTranslate}px`
    );
  }

  private setupStickyHeaderScrollListener(): void {
    this.ngZone.runOutsideAngular(() => {
      const region = this.tableRegionRef()?.nativeElement;

      if (!region) {
        return;
      }

      const supportsScrollTimeline = browserSupportsScrollTimeline();

      this.observeStickyHeaderVisibility(region);

      let ticking = false;

      const listener = (event: Event): void => {
        if (!this.isTableVisible) {
          return;
        }

        if (event.type === 'resize') {
          this.updateCachedStickyTop();
          this.measureTableDimensions();

          if (supportsScrollTimeline) {
            this.updateScrollTimelineViewportCorrection();
          } else {
            this.updateStickyHeaderPosition();
          }

          return;
        }

        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (supportsScrollTimeline) {
              this.updateScrollTimelineViewportCorrection();
            } else {
              this.updateStickyHeaderPosition();
            }

            ticking = false;
          });
          ticking = true;
        }
      };

      const viewport = window.visualViewport ?? null;

      window.addEventListener('scroll', listener, { passive: true });
      region.addEventListener('scroll', listener, { passive: true });
      viewport?.addEventListener('scroll', listener, { passive: true });
      window.addEventListener('resize', listener, { passive: true });
      viewport?.addEventListener('resize', listener, { passive: true });

      this.destroyRef.onDestroy(() => {
        this.intersectionObserver?.disconnect();

        window.removeEventListener('scroll', listener);
        region.removeEventListener('scroll', listener);
        viewport?.removeEventListener('scroll', listener);
        window.removeEventListener('resize', listener);
        viewport?.removeEventListener('resize', listener);
      });

      this.updateCachedStickyTop();
      this.measureTableDimensions();

      if (supportsScrollTimeline) {
        this.updateScrollTimelineViewportCorrection();
      } else {
        this.updateStickyHeaderPosition();
      }
    });
  }

  /**
   * Tracks whether the table is near the viewport so the sticky-header scroll
   * work is skipped while it is off-screen, and recalculates its dimensions the
   * moment it scrolls back into view.
   */
  private observeStickyHeaderVisibility(region: HTMLElement): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.isTableVisible = true;

      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasVisible = this.isTableVisible;

        this.isTableVisible = entry.isIntersecting;

        if (this.isTableVisible && !wasVisible) {
          this.updateCachedStickyTop();
          this.measureTableDimensions();

          if (browserSupportsScrollTimeline()) {
            this.updateScrollTimelineViewportCorrection();
          } else {
            this.updateStickyHeaderPosition();
          }
        }
      },
      {
        rootMargin: '100px 0px 100px 0px'
      }
    );

    this.intersectionObserver.observe(region);
  }

  private updateStickyHeaderPosition(): void {
    const region = this.tableRegionRef()?.nativeElement;

    if (!region) {
      return;
    }

    if (!this.stickyHeader()) {
      const headerCells =
        this.cachedHeaderCells.length > 0
          ? this.cachedHeaderCells
          : Array.from(region.querySelectorAll<HTMLTableCellElement>('thead th'));

      for (const cell of headerCells) {
        cell.style.transform = '';
      }

      return;
    }

    const headerCells =
      this.cachedHeaderCells.length > 0
        ? this.cachedHeaderCells
        : Array.from(region.querySelectorAll<HTMLTableCellElement>('thead th'));

    this.cachedHeaderCells = headerCells as HTMLTableCellElement[];

    if (this.isRegionScrollable) {
      for (const cell of headerCells) {
        cell.style.transform = '';
      }

      return;
    }

    if (browserSupportsScrollTimeline()) {
      for (const cell of headerCells) {
        if (cell.style.transform) {
          cell.style.transform = '';
        }
      }

      return;
    }

    // Read the header's live viewport position every frame rather than deriving
    // it from a cached page offset. On mobile engines `window.scrollY` lags behind
    // compositor-driven momentum scrolling and ignores the visual-viewport shift
    // caused by the dynamic URL bar, which left the translated header detached from
    // the top of the viewport. Measuring the live rect and compensating for
    // `visualViewport.offsetTop` keeps the header docked.
    const tableEl = this.cachedTableEl ?? region.querySelector<HTMLTableElement>('table');
    const visualOffsetTop = readVisualViewportOffsetTop();
    const rectTop = (tableEl ? tableEl.getBoundingClientRect().top : this.tablePageTop - window.scrollY) - visualOffsetTop;

    let translateY = 0;

    if (rectTop < this.cachedStickyTop) {
      const maxTranslateY = Math.max(0, this.tableHeight - this.theadHeight);

      translateY = Math.min(Math.max(0, this.cachedStickyTop - rectTop), maxTranslateY);
    }

    const transformValue = translateY > 0 ? `translate3d(0, ${translateY}px, 0)` : '';

    for (const cell of headerCells) {
      cell.style.transform = transformValue;
    }
  }

  private measureRegionViewportWidth(): void {
    const region = this.tableRegionRef()?.nativeElement;

    if (!region) {
      return;
    }

    const width = region.clientWidth;

    if (width > 0 && width !== this.regionViewportWidth()) {
      this.regionViewportWidth.set(width);
    }
  }

  private buildTableSummary(): string {
    const summaryContext = this.getSummaryContext();
    const formatter = this.resolvedAccessibilityText().tableSummary;

    return formatter?.(summaryContext) ?? '';
  }

  private getStateTemplateBaseContext(): {
    table: Table<TData>;
    visibleRowsValue: number;
    totalRowsValue: number;
    visibleColumnsValue: number;
    filtered: boolean;
  } {
    return {
      table: this.table,
      visibleRowsValue: this.renderedVisibleRowCount(),
      totalRowsValue: this.stateTotalRowCount(),
      visibleColumnsValue: this.visibleColumnCount(),
      filtered: this.isFiltered()
    };
  }

  private getSummaryContext(): NatTableAccessibilitySummaryContext {
    const visibleRows = this.renderedVisibleRowCount();
    const totalRows = this.stateTotalRowCount();
    const visibleColumns = this.visibleColumnCount();
    const pageIndex = this.renderedPageIndex();
    const page = pageIndex + 1;
    const pageCount = this.renderedPageCount();

    return {
      visibleRowsValue: visibleRows,
      visibleRowsText: this.formatAccessibilityNumber(visibleRows),
      totalRowsValue: totalRows,
      totalRowsText: this.formatAccessibilityNumber(totalRows),
      visibleColumnsValue: visibleColumns,
      visibleColumnsText: this.formatAccessibilityNumber(visibleColumns),
      pageIndex,
      pageValue: page,
      pageText: this.formatAccessibilityNumber(page),
      pageCountValue: pageCount,
      pageCountText: this.formatAccessibilityNumber(pageCount),
      filterState: this.isFiltered() ? 'filtered' : 'unfiltered',
      paginationState: this.enablePagination() ? 'enabled' : 'disabled'
    };
  }

  private isFiltered(): boolean {
    const state = this.mergedState();

    return !!state.globalFilter.trim() || state.columnFilters.length > 0;
  }

  private captureAccessibilitySnapshot(): TableAccessibilitySnapshot {
    const state = this.mergedState();

    return {
      dataStatus: this.resolvedDataStatus(),
      sortingKey: serializeSorting(state.sorting),
      globalFilter: state.globalFilter.trim(),
      columnFiltersKey: serializeColumnFilters(state.columnFilters),
      rowSelectionKey: serializeRowSelection(state.rowSelection),
      selectedRowCount: Object.values(state.rowSelection).filter(Boolean).length,
      pagination: {
        ...state.pagination,
        pageIndex: this.renderedPageIndex()
      },
      pageCount: this.renderedPageCount(),
      visibleRows: this.renderedVisibleRowCount(),
      totalRows: this.stateTotalRowCount(),
      columns: this.allLeafColumns().map((column) => ({
        id: column.id,
        label: resolveColumnLabel(column),
        visible: column.getIsVisible()
      }))
    };
  }

  private describeAccessibilityChange(previous: TableAccessibilitySnapshot, next: TableAccessibilitySnapshot): string | null {
    if (previous.dataStatus !== next.dataStatus) {
      return this.describeDataStatusChange(next);
    }

    if (previous.sortingKey !== next.sortingKey) {
      return this.describeSortingChange(next);
    }

    if (previous.globalFilter !== next.globalFilter || previous.columnFiltersKey !== next.columnFiltersKey) {
      return this.describeFilteringChange(next);
    }

    if (!hasSameColumnVisibility(previous.columns, next.columns)) {
      return this.describeColumnVisibilityChange(previous.columns, next.columns);
    }

    if (previous.rowSelectionKey !== next.rowSelectionKey) {
      return this.describeSelectionChange(next);
    }

    if (previous.pagination.pageSize !== next.pagination.pageSize) {
      return this.describePageSizeChange(next);
    }

    if (previous.pagination.pageIndex !== next.pagination.pageIndex) {
      return this.describePageChange(next);
    }

    return null;
  }

  private describeDataStatusChange(snapshot: TableAccessibilitySnapshot): string {
    if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.loading) {
      return this.resolvedLoadingState();
    }

    if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.error) {
      return this.resolvedErrorState();
    }

    if (snapshot.visibleRows === 0) {
      return this.resolvedEmptyState();
    }

    return '';
  }

  private describeSortingChange(snapshot: TableAccessibilitySnapshot): string {
    const sortingState = this.mergedState().sorting;
    const formatter = this.resolvedAccessibilityText().sortingChange;
    const entry = sortingState.at(0);
    const columnLabel = entry ? (snapshot.columns.find((column) => column.id === entry.id)?.label ?? entry.id) : null;
    const sortState = entry ? sortDirection(entry.desc) : 'none';
    const sortedColumns = sortingState.map((sortEntry) => ({
      id: sortEntry.id,
      label: snapshot.columns.find((column) => column.id === sortEntry.id)?.label ?? sortEntry.id,
      sortState: sortDirection(sortEntry.desc)
    }));
    const context: NatTableAccessibilitySortingAnnouncementContext = {
      columnId: entry?.id ?? null,
      columnLabel,
      sortState,
      sortedColumns
    };

    return formatter?.(context) ?? '';
  }

  private describeFilteringChange(snapshot: TableAccessibilitySnapshot): string {
    const formatter = this.resolvedAccessibilityText().filteringChange;
    const query = snapshot.globalFilter;
    const hasColumnFilters = !!snapshot.columnFiltersKey;
    const context: NatTableAccessibilityFilteringAnnouncementContext = {
      query: snapshot.globalFilter,
      filterState: resolveFilterState(!!query, hasColumnFilters),
      visibleRowsValue: snapshot.visibleRows,
      visibleRowsText: this.formatAccessibilityNumber(snapshot.visibleRows),
      totalRowsValue: snapshot.totalRows,
      totalRowsText: this.formatAccessibilityNumber(snapshot.totalRows)
    };

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describeColumnVisibilityChange(
    previous: readonly TableColumnAccessibilityState[],
    next: readonly TableColumnAccessibilityState[]
  ): string {
    const changedColumns = next.reduce<NatTableAccessibilityColumnVisibilityAnnouncementChange[]>((result, column) => {
      const previousColumn = previous.find((candidate) => candidate.id === column.id);

      if (previousColumn && previousColumn.visible !== column.visible) {
        result.push({
          id: column.id,
          label: column.label,
          visibilityState: column.visible ? 'visible' : 'hidden'
        });
      }

      return result;
    }, []);
    const visibleCount = next.filter((column) => column.visible).length;
    const formatter = this.resolvedAccessibilityText().columnVisibilityChange;
    const context: NatTableAccessibilityColumnVisibilityAnnouncementContext = {
      changedColumns,
      visibleColumnsValue: visibleCount,
      visibleColumnsText: this.formatAccessibilityNumber(visibleCount),
      totalColumnsValue: next.length,
      totalColumnsText: this.formatAccessibilityNumber(next.length)
    };

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describeSelectionChange(snapshot: TableAccessibilitySnapshot): string {
    const formatter = this.resolvedAccessibilityText().selectionChange;
    const count = snapshot.selectedRowCount;
    const total = snapshot.totalRows;
    const context: NatTableAccessibilitySelectionAnnouncementContext = {
      selectedCountValue: count,
      selectedCountText: this.formatAccessibilityNumber(count),
      totalRowsValue: total,
      totalRowsText: this.formatAccessibilityNumber(total)
    };

    return formatter?.(context) ?? '';
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

  private getPaginationAnnouncementContext(snapshot: TableAccessibilitySnapshot): NatTableAccessibilityPaginationAnnouncementContext {
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
      visibleRowsText: this.formatAccessibilityNumber(snapshot.visibleRows)
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
}
