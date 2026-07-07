/* eslint-disable max-lines -- irreducible per-instance reactive store: a single @Injectable owns the signal graph + TanStack table instance; further splitting only relocates coupling into cross-service signal reads and Injector.get() cycles. Pure arithmetic (widths, resize math, const defaults) already extracted to utils/common. */
import { Directionality } from '@angular/cdk/bidi';
import type { ElementRef } from '@angular/core';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  FilterFn,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  Updater,
  VisibilityState
} from '@tanstack/angular-table';
import {
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/angular-table';

import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_INTL,
  formatNatTableNumber,
  mergeNatTableAccessibilityText,
  resolveNatTableIntl
} from 'ng-advanced-table/locale';

import { NatTableService } from './table.service';
import type { NatTableColumnMoveDirection } from '../common/column-meta.type';
import type {
  ColumnRenderStateContext,
  ColumnReorderKeyboardDirection,
  ColumnReorderZone,
  NatTableColumnReorderResult,
  TableColumnRenderState
} from '../common/column-render.type';
import type { NatTableRowIdGetter } from '../common/row.type';
import { DEFAULT_TABLE_STATE } from '../common/table-state.const';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableBodyState, NatTableDataStatus } from '../common/table-status.type';
import {
  clampColumnSizingWidths,
  clampWidth,
  computeKeyboardResizeWidth,
  getColumnResizeBounds
} from '../resize/utils/column-resize.util';
import { getColumnDefLeafIds, getUserColumnSizing, readColumnEntry } from '../utils/column-def.util';
import {
  accumulatePinnedOffsets,
  getColumnMoveTargetIndex,
  getColumnZone,
  hasSameStringOrder,
  moveItemInArrayCopy,
  normalizeColumnOrder,
  normalizeColumnPinning,
  replaceIdsInSlots,
  resolvePinnedZoneColumns
} from '../utils/column-order.util';
import { buildColumnRenderState } from '../utils/column-render-state.util';
import { computeFillFlexWidths, computeIntrinsicWidths } from '../utils/column-width.util';
import { genericGlobalFilter } from '../utils/global-filter.util';
import { isColumnResizable } from '../utils/interaction.util';
import { normalizeDataStatus, normalizeRowSelection, resolveDefaultRowId } from '../utils/row-state.util';
import { normalizeSortingState } from '../utils/sorting.util';
import { firstPageUpdater, resolveSeedState, resolveUpdater } from '../utils/state-seed.util';

// ─── Constants ───

let nextTableId = 0;

/**
 * Per-table state store that owns TanStack table creation, all internal state
 * signals, column width resolution, resize/reorder state logic, and derived
 * computeds.
 *
 * The `NatTable` component and its companion directives consume this store's
 * signals for rendering and delegate user actions to its methods.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable (providers: [NatTableState]), not root.
@Injectable()
export class NatTableState<TData extends RowData = RowData> {
  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly directionality = inject(Directionality, { optional: true });

  // ─── Input bridging signals (written by the NatTable component) ───

  /** The row data signal, set from the component's required input. */
  public readonly data = signal<readonly TData[]>([]);
  /** The column definitions signal, set from the component's required input. */
  public readonly columnDefs = signal<readonly ColumnDef<TData, unknown>[]>([]);
  /** Data lifecycle status, set from the component's input. */
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  /** Optional error payload, set from the component's input. */
  public readonly error = signal<unknown>(null);
  /** Whether row selection is enabled, set from the component's input. */
  public readonly enableRowSelection = signal(false);
  /** Selection cardinality, set from the component's input. */
  public readonly selectionMode = signal<'single' | 'multiple'>('multiple');
  /** Optional global filter function override. */
  public readonly globalFilterFn = signal<FilterFn<TData> | undefined>(undefined);
  /** Optional row id resolver. */
  public readonly getRowId = signal<NatTableRowIdGetter<TData> | undefined>(undefined);
  /** Accessible name when no caption. */
  public readonly accessibleName = signal<string | undefined>(undefined);
  /** Visible table caption. */
  public readonly caption = signal<string | undefined>(undefined);
  /** Whether to emit row render timing events. */
  public readonly emitRowRenderEvents = signal(false);

  // ─── Service-derived computeds ───

  public readonly initialState = computed(() => this.natTableService.surfaceInitialState());
  public readonly state = computed(() => this.natTableService.state());
  public readonly enablePagination = computed(() => this.natTableService.hasPagination());
  public readonly enableGlobalFilter = computed(() => this.natTableService.hasSearch());
  public readonly manualPagination = computed(() => this.natTableService.manualPagination());
  public readonly manualSorting = computed(() => this.natTableService.manualSorting());
  public readonly manualFiltering = computed(() => this.natTableService.manualFiltering());
  public readonly manualPageCount = computed(() => this.natTableService.manualPageCount());
  public readonly enableAnnouncements = computed(() => this.natTableService.enableAnnouncements());
  public readonly stickyHeader = computed(() => this.natTableService.stickyHeader());
  public readonly enableMultiSort = computed(() => this.natTableService.enableMultiSort());
  public readonly locale = computed(() => this.natTableService.locale());
  public readonly accessibilityText = computed(() => this.natTableService.accessibilityText());
  public readonly columnResizeMode = computed(() => this.natTableService.columnResizeMode());
  public readonly columnSizingMode = computed(() => this.natTableService.columnSizingMode());
  public readonly enableReordering = computed(() => this.natTableService.enableReordering());
  public readonly isFixedLayout = computed(() => this.columnSizingMode() === 'fixed');
  public readonly direction = computed(() => this.natTableService.direction());

  // ─── Internal state signals ───

  private readonly internalSorting = signal<SortingState>(DEFAULT_TABLE_STATE.sorting);
  private readonly internalGlobalFilter = signal(DEFAULT_TABLE_STATE.globalFilter);
  private readonly internalColumnFilters = signal<ColumnFiltersState>(DEFAULT_TABLE_STATE.columnFilters);
  private readonly internalColumnVisibility = signal<VisibilityState>(DEFAULT_TABLE_STATE.columnVisibility);
  private readonly internalColumnOrder = signal<ColumnOrderState>(DEFAULT_TABLE_STATE.columnOrder);
  private readonly internalColumnPinning = signal<ColumnPinningState>(DEFAULT_TABLE_STATE.columnPinning);
  private readonly internalColumnSizing = signal<ColumnSizingState>(DEFAULT_TABLE_STATE.columnSizing);
  public readonly resizeSeedSizing = signal<ColumnSizingState>({});
  private readonly internalRowSelection = signal<RowSelectionState>(DEFAULT_TABLE_STATE.rowSelection);
  private readonly internalPagination = signal<PaginationState>(DEFAULT_TABLE_STATE.pagination);
  public readonly hasSeededInitialState = signal(false);

  // ─── Stable DOM id ───

  public readonly tableElementId = signal(`nat-table-${nextTableId++}`);

  // ─── ARIA element ids ───

  public readonly tableCaptionId = computed(() => `${this.tableElementId()}-caption`);
  public readonly tableSummaryId = computed(() => `${this.tableElementId()}-summary`);
  public readonly tableDescriptionId = computed(() => `${this.tableElementId()}-description`);
  public readonly tableKeyboardInstructionsId = computed(() => `${this.tableElementId()}-instructions`);

  // ─── Intl/locale ───

  private readonly tableIntlConfig = inject(NAT_TABLE_INTL);
  public readonly localeId = computed(() => this.locale() ?? NAT_EN_LOCALE_ID);
  private readonly tableIntl = computed(() => resolveNatTableIntl(this.tableIntlConfig, this.localeId()));
  public readonly resolvedAccessibilityText = computed(() =>
    mergeNatTableAccessibilityText(this.tableIntl().accessibilityText, this.accessibilityText())
  );

  // ─── Derived column state ───

  public readonly allLeafColumnIds = computed(() => getColumnDefLeafIds(this.columnDefs()));
  public readonly userColumnSizing = computed(() => getUserColumnSizing(this.columnDefs()));

  private readonly resolvedColumnOrder = computed(() =>
    normalizeColumnOrder(this.state().columnOrder ?? this.internalColumnOrder(), this.allLeafColumnIds())
  );

  private readonly resolvedColumnPinning = computed(() =>
    normalizeColumnPinning(this.state().columnPinning ?? this.internalColumnPinning(), this.allLeafColumnIds())
  );

  private readonly resolvedColumnSizing = computed<ColumnSizingState>(() => {
    const resolved = this.state().columnSizing ?? this.internalColumnSizing();
    const seed = this.resizeSeedSizing();

    let merged: ColumnSizingState | null = null;

    for (const columnId of Object.keys(seed)) {
      if (!(columnId in resolved)) {
        (merged ??= { ...resolved })[columnId] = seed[columnId];
      }
    }

    return merged ?? resolved;
  });

  // ─── Merged state ───

  public readonly mergedState = computed<NatTableUserState>(() => ({
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

  // ─── Resolved a11y text / status computeds ───

  public readonly resolvedDescription = computed(() => this.resolvedAccessibilityText().description ?? '');
  public readonly resolvedEmptyState = computed(() => this.resolvedAccessibilityText().emptyState ?? '');
  public readonly resolvedLoadingState = computed(() => this.resolvedAccessibilityText().loadingState ?? '');
  public readonly resolvedErrorState = computed(() => this.resolvedAccessibilityText().errorState ?? '');
  public readonly resolvedDataStatus = computed(() => normalizeDataStatus(this.dataStatus()));
  public readonly resolvedCaption = computed(() => this.caption()?.trim() ?? '');
  public readonly resolvedDirection = computed<'ltr' | 'rtl'>(() => this.direction() ?? this.directionality?.value ?? 'ltr');

  // ─── TanStack table instance ───

  public readonly table: Table<TData> = createAngularTable<TData>(() => ({
    data: this.data() as TData[],
    columns: this.columnDefs() as ColumnDef<TData, unknown>[],
    state: this.mergedState(),
    pageCount: this.manualPagination() ? this.manualPageCount() : undefined,
    manualPagination: this.manualPagination(),
    manualSorting: this.manualSorting(),
    manualFiltering: this.manualFiltering(),
    enableMultiSort: this.enableMultiSort(),
    isMultiSortEvent: (event) => this.enableMultiSort() && (event as { readonly shiftKey?: boolean }).shiftKey === true,
    enableColumnPinning: true,
    enableColumnOrdering: this.enableReordering(),
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

  // ─── Derived TanStack computeds ───

  public readonly headerGroups = computed(() => this.table.getHeaderGroups());
  public readonly bodyRows = computed(() => this.table.getRowModel().rows);
  public readonly allLeafColumns = computed(() => this.table.getAllLeafColumns());
  public readonly hasResizableColumns = computed(() => this.allLeafColumns().some((column) => isColumnResizable(column)));
  public readonly visibleColumns = computed(() => this.table.getVisibleLeafColumns());
  public readonly leafHeaderRowId = computed(() => this.table.getHeaderGroups().at(-1)?.id ?? null);

  public readonly visibleColumnCount = computed(() => this.visibleColumns().length);
  public readonly visibleRowCount = computed(() => this.bodyRows().length);
  public readonly totalRowCount = computed(() => this.data().length);
  public readonly resolvedPageCount = computed(() => {
    if (this.manualPagination()) {
      return this.manualPageCount() ?? 1;
    }

    return this.enablePagination() ? Math.max(this.table.getPageCount(), 1) : 1;
  });

  public readonly visibleColumnIds = computed(() =>
    this.visibleColumns()
      .map((column) => column.id)
      .join('|')
  );

  public readonly emptyStateColSpan = computed(() => Math.max(this.visibleColumnCount(), 1));
  public readonly tableAriaBusy = computed(() => (this.resolvedDataStatus() === NAT_TABLE_DATA_STATUS.loading ? 'true' : null));

  public readonly bodyState = computed<NatTableBodyState>(() => {
    const dataStatus = this.resolvedDataStatus();

    if (dataStatus === NAT_TABLE_DATA_STATUS.error) {
      return NAT_TABLE_BODY_STATE.error;
    }

    if (dataStatus === NAT_TABLE_DATA_STATUS.loading && this.totalRowCount() === 0) {
      return NAT_TABLE_BODY_STATE.loading;
    }

    return this.visibleRowCount() > 0 ? NAT_TABLE_BODY_STATE.rows : NAT_TABLE_BODY_STATE.empty;
  });

  public readonly renderedVisibleRowCount = computed(() =>
    this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.visibleRowCount() : 0
  );

  public readonly stateTotalRowCount = computed(() => {
    const bodyState = this.bodyState();

    return bodyState === NAT_TABLE_BODY_STATE.loading || bodyState === NAT_TABLE_BODY_STATE.error ? 0 : this.totalRowCount();
  });

  public readonly renderedPageIndex = computed(() =>
    this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.mergedState().pagination.pageIndex : 0
  );

  public readonly renderedPageCount = computed(() => (this.bodyState() === NAT_TABLE_BODY_STATE.rows ? this.resolvedPageCount() : 1));

  // ─── DOM context (written by the component, read by services) ───

  /** Scrollable wrapper around the rendered `<table>`. Set by the component after render. */
  public readonly tableRegionRef = signal<ElementRef<HTMLElement> | undefined>(undefined);

  // ─── ARIA attribute computeds ───

  public readonly resolvedKeyboardInstructions = computed(() => {
    const text = this.resolvedAccessibilityText();
    const instructions = (text.keyboardInstructions ?? '').trim();
    const reorderInstructions = text.reorderKeyboardInstructions?.trim() ?? '';
    const resizeInstructions = text.resizeKeyboardInstructions?.trim() ?? '';
    const parts = [instructions];

    if (this.enableReordering()) {
      parts.push(reorderInstructions);
    }

    if (this.hasResizableColumns()) {
      parts.push(resizeInstructions);
    }

    return parts.filter((value) => !!value).join(' ');
  });

  public readonly tableAriaLabel = computed(() => {
    if (this.resolvedCaption()) {
      return null;
    }

    const name = this.accessibleName()?.trim();

    return name === undefined || name === '' ? null : name;
  });

  public readonly tableAriaLabelledBy = computed(() => (this.resolvedCaption() ? this.tableCaptionId() : null));

  public readonly tableClassMap = computed(() =>
    ['data-table', this.stickyHeader() && 'has-sticky-header', this.usesAuthoritativeLayout() && 'is-fixed-layout']
      .filter(Boolean)
      .join(' ')
  );

  // ─── Header measurement signals (written by the header-measurement service) ───

  public readonly measuredHeaderWidths = signal<Record<string, number>>({});
  public readonly regionViewportWidth = signal<number>(0);

  // ─── Column width resolution ───

  /**
   * Fill layout with at least one resizable column and a measured region. The table
   * then renders authoritative widths (a colgroup under `table-layout: fixed`) that
   * sum to the region, so resizing a column is pixel-exact while the other columns
   * flex to keep the table filled.
   */
  private readonly isFillFlexLayout = computed(
    () => !this.isFixedLayout() && this.hasResizableColumns() && this.regionViewportWidth() > 0
  );

  /**
   * Authoritative widths drive the layout: either explicit `fixed` sizing mode or
   * fill flex. Renders the colgroup and switches the table to `table-layout: fixed`.
   */
  public readonly usesAuthoritativeLayout = computed(() => this.isFixedLayout() || this.isFillFlexLayout());

  /**
   * Per-column widths used for sticky pinned offsets, the colgroup, and the keyboard
   * resize base.
   */
  public readonly resolvedColumnWidths = computed<Record<string, number>>(() => {
    const visibleColumns = this.visibleColumns();
    const columnSizing = this.mergedState().columnSizing;
    const clamp = (column: Column<TData, unknown>, width: number): number => this.clampColumnWidth(column, width);

    if (this.isFillFlexLayout()) {
      return computeFillFlexWidths(visibleColumns, columnSizing, {
        container: this.regionViewportWidth(),
        clamp,
        getBounds: (column) => this.getResizeBounds(column),
        getColumn: (columnId) => this.table.getColumn(columnId)
      });
    }

    return computeIntrinsicWidths(visibleColumns, columnSizing, {
      measured: this.measuredHeaderWidths(),
      userSizing: this.userColumnSizing(),
      usesAuthoritativeLayout: this.usesAuthoritativeLayout(),
      clamp
    });
  });

  public readonly fixedLayoutTableWidth = computed(() => {
    const widths = this.resolvedColumnWidths();

    return this.visibleColumns().reduce((total, column) => total + (widths[column.id] ?? 0), 0);
  });

  // ─── Column render state ───

  public readonly columnRenderStates = computed<Record<string, TableColumnRenderState>>(() => {
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

  // ─── Render cycle tracking ───

  public readonly renderCycleToken = signal(0);
  public readonly renderCycleStartedAt = signal(0);

  // ─── Resize state (no DOM) ───

  /**
   * Commit info from the in-progress pointer/touch resize drag, used by the
   * resize directive for announcing the final width on drag end.
   */
  public resizeCommit: { readonly columnId: string; readonly width: number } | null = null;

  public getResizeBounds(column: Column<TData, unknown>): { readonly min: number; readonly max: number | null } {
    return getColumnResizeBounds(column, this.userColumnSizing());
  }

  public getResizeFitBounds(column: Column<TData, unknown>): { readonly min: number; readonly max: number | null } {
    const { min, max: ownMax } = this.getResizeBounds(column);
    const region = this.regionViewportWidth();

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

  public clampColumnWidth(column: Column<TData, unknown>, width: number): number {
    return clampWidth(width, this.getResizeBounds(column));
  }

  public clampColumnSizing(sizing: ColumnSizingState): ColumnSizingState {
    return clampColumnSizingWidths(
      sizing,
      (columnId) => this.table.getColumn(columnId),
      (column, width) => this.clampColumnWidth(column, width)
    );
  }

  public getColumnEffectiveWidth(column: Column<TData, unknown>): number {
    return this.clampColumnWidth(column, this.resolvedColumnWidths()[column.id] ?? column.getSize());
  }

  /**
   * Seed an auto-sized column's `columnSizing` entry with its real rendered
   * width before a pointer resize begins.
   */
  public seedColumnSizingFromMeasuredWidth(column: Column<TData, unknown>): void {
    const alreadyResized = readColumnEntry(this.mergedState().columnSizing, column.id) !== undefined;
    const explicitlySized = readColumnEntry(this.userColumnSizing(), column.id)?.hasSize === true;

    if (alreadyResized || (explicitlySized && !this.isFillFlexLayout())) {
      return;
    }

    const measuredWidth = this.getColumnEffectiveWidth(column);

    this.updateState({
      columnSizing: (current) => ({ ...current, [column.id]: measuredWidth })
    });

    this.resizeSeedSizing.set({ [column.id]: measuredWidth });

    // Flush the seed synchronously so the TanStack resize handler reads it.
    this.table.getState();
  }

  /**
   * Resize `column` by one keyboard step. Returns the new width for
   * announcement by the caller, or null if no change occurred.
   */
  public resizeColumnFromKey(
    event: KeyboardEvent,
    column: Column<TData, unknown>
  ): { readonly width: number; readonly changed: boolean } | null {
    if (!isColumnResizable(column)) return null;

    const { min, max } = this.getResizeFitBounds(column);
    const current = this.getColumnEffectiveWidth(column);
    const clamped = computeKeyboardResizeWidth({
      key: event.key,
      current,
      min,
      max,
      isRtl: this.resolvedDirection() === 'rtl'
    });

    if (clamped === null) {
      return null;
    }

    event.preventDefault();
    event.stopPropagation();

    if (clamped === current) {
      return { width: current, changed: false };
    }

    this.updateState({
      columnSizing: (currentSizing) => ({ ...currentSizing, [column.id]: clamped })
    });

    return { width: clamped, changed: true };
  }

  /**
   * Commit a column-sizing change from TanStack's pointer/touch resize handler.
   */
  public applyColumnSizingChange(updater: Updater<ColumnSizingState>): void {
    const resizingColumnId = this.table.getState().columnSizingInfo.isResizingColumn;

    if (typeof resizingColumnId !== 'string') {
      this.updateState({ columnSizing: updater });

      return;
    }

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

  // ─── Reorder state (no DOM) ───

  public canMoveColumn(columnId: string, direction: NatTableColumnMoveDirection): boolean {
    return this.canMoveColumnByDelta(columnId, direction === 'left' ? -1 : 1);
  }

  public moveColumn(columnId: string, direction: NatTableColumnMoveDirection): NatTableColumnReorderResult | null {
    return this.moveColumnByDelta(columnId, direction === 'left' ? -1 : 1);
  }

  public canMoveColumnByDelta(columnId: string, directionDelta: ColumnReorderKeyboardDirection): boolean {
    if (!this.enableReordering()) return false;

    const zone = this.getColumnZoneById(columnId);

    if (!zone) return false;

    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);

    return getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta) !== null;
  }

  public moveColumnByDelta(columnId: string, directionDelta: ColumnReorderKeyboardDirection): NatTableColumnReorderResult | null {
    if (!this.enableReordering()) return null;

    const zone = this.getColumnZoneById(columnId);

    if (!zone) return null;

    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
    const currentIndex = visibleZoneColumnIds.indexOf(columnId);
    const nextIndex = getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta);

    if (nextIndex === null) return null;

    const nextVisibleZoneOrder = moveItemInArrayCopy(visibleZoneColumnIds, currentIndex, nextIndex);

    return this.applyVisibleZoneReorder(zone, columnId, nextVisibleZoneOrder);
  }

  public applyVisibleZoneReorder(
    zone: ColumnReorderZone,
    movingColumnId: string,
    nextVisibleZoneOrder: readonly string[]
  ): NatTableColumnReorderResult | null {
    if (!this.enableReordering()) {
      return null;
    }

    const currentState = this.mergedState();
    const currentVisibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);
    const movingColumn = this.table.getColumn(movingColumnId);

    if (
      !movingColumn ||
      !currentVisibleZoneColumnIds.length ||
      hasSameStringOrder(currentVisibleZoneColumnIds, nextVisibleZoneOrder)
    ) {
      return null;
    }

    const result: NatTableColumnReorderResult = { movingColumnId, zone, nextVisibleZoneOrder };

    if (zone === 'center') {
      const nextColumnOrder = replaceIdsInSlots(currentState.columnOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));

      if (hasSameStringOrder(currentState.columnOrder, nextColumnOrder)) {
        return null;
      }

      this.updateState({ columnOrder: nextColumnOrder });

      return result;
    }

    const currentPinnedZoneOrder = (zone === 'left' ? currentState.columnPinning.left : currentState.columnPinning.right) ?? [];
    const nextPinnedZoneOrder = replaceIdsInSlots(currentPinnedZoneOrder, nextVisibleZoneOrder, new Set(currentVisibleZoneColumnIds));

    if (hasSameStringOrder(currentPinnedZoneOrder, nextPinnedZoneOrder)) {
      return null;
    }

    this.updateState({
      columnPinning: {
        ...currentState.columnPinning,
        [zone]: nextPinnedZoneOrder
      }
    });

    return result;
  }

  public isDropIndexWithinZone(rowColumnIds: readonly string[], zone: ColumnReorderZone, currentIndex: number): boolean {
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

  public getColumnZoneById(columnId: string): ColumnReorderZone | null {
    const column = this.table.getColumn(columnId);

    return column ? getColumnZone(column) : null;
  }

  public getVisibleZoneColumnIds(zone: ColumnReorderZone): string[] {
    return this.table
      .getVisibleLeafColumns()
      .filter((column) => getColumnZone(column) === zone)
      .map((column) => column.id);
  }

  // ─── State management ───

  public seedInitialState(initialState: Partial<NatTableUserState>): void {
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

    this.natTableService.notifyStateChange(this.mergedState());
  }

  public patchState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void {
    this.updateState(updaters);
  }

  public updateState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void {
    const currentState = this.mergedState();
    const nextState: NatTableUserState = {
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

  private commitInternalState(nextState: NatTableUserState): void {
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

  // ─── Template state contexts ───

  public getStateTemplateBaseContext(): {
    readonly table: Table<TData>;
    readonly visibleRowsValue: number;
    readonly totalRowsValue: number;
    readonly visibleColumnsValue: number;
    readonly filtered: boolean;
  } {
    return {
      table: this.table,
      visibleRowsValue: this.renderedVisibleRowCount(),
      totalRowsValue: this.stateTotalRowCount(),
      visibleColumnsValue: this.visibleColumnCount(),
      filtered: this.isFiltered()
    };
  }

  public isFiltered(): boolean {
    const state = this.mergedState();

    return !!state.globalFilter.trim() || state.columnFilters.length > 0;
  }

  public formatAccessibilityNumber(value: number): string {
    return formatNatTableNumber(this.tableIntl(), value, undefined, this.localeId());
  }

  // ─── Private helpers ───

  private resolveRowId(row: TData, index: number, parent?: Row<TData>): string {
    const getRowIdFn = this.getRowId();

    return getRowIdFn ? getRowIdFn(row, index, parent) : resolveDefaultRowId(row, index, parent);
  }

  // ─── Lifecycle effects (seed + render cycle) ───

  /**
   * Self-seeding effect: applies the initial state when it becomes available.
   * Must be called in the injection context (constructor or field initializer).
   */
  public registerSeedEffect(): void {
    effect(() => {
      if (this.hasSeededInitialState()) {
        return;
      }

      this.seedInitialState(this.initialState());
    });
  }

  /**
   * Bumps the render-cycle token when `bodyRows()` changes, enabling
   * row-render event timing. Pure state → state transform.
   */
  public registerRenderCycleEffect(): void {
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
}
