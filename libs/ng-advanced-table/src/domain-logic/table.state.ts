/* eslint-disable max-lines -- residual per-instance reactive hub: owns the 9-slice controlled/internal signal graph + the single TanStack table instance + the resize/reorder orchestration that all reads `this.table`. Splitting that orchestration into separate injectables would recreate a DI cycle (TanStack `meta` -> reorder/resize methods -> read `this.table` -> store), and the clamp-on-write knot (`updateState` -> `clampColumnSizing` -> `table.getColumn`) binds the mutation path to live table geometry across any such boundary. Already extracted: pure arithmetic (widths, resize/sizing math, const defaults) to utils/common, the controlled/internal merge rule to `controlledSlice`, the TanStack-instance construction to `table-instance.factory`, and intl + a11y-text derivation to `NatTableIntlService` / `NatTableA11yService`. */
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
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  Updater,
  VisibilityState
} from '@tanstack/angular-table';

import { createNatTableInstance } from './table-instance.factory';
import { NatTableIntlService } from './table-intl.service';
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
import { getColumnDefLeafIds, getUserColumnSizing, readColumnEntry, someLeafColumnDef } from '../utils/column-def.util';
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
import { controlledSlice } from '../utils/controlled-slice.util';
import { isColumnReorderable, isColumnResizable } from '../utils/interaction.util';
import { normalizeDataStatus, normalizeRowSelection } from '../utils/row-state.util';
import { normalizeSortingState } from '../utils/sorting.util';
import { resolveSeedState, resolveUpdater } from '../utils/state-seed.util';

// ─── Constants ───

let nextTableId = 0;

/**
 * Per-table state store that owns TanStack table creation, all internal state
 * signals, column width resolution, resize/reorder state logic, and derived
 * computeds. Intl resolution and a11y-text/ARIA derivation are delegated to the
 * sibling `NatTableIntlService` / `NatTableA11yService`; the controlled/internal
 * merge rule lives in `controlledSlice`.
 *
 * The `NatTable` component and its companion directives consume this store's
 * signals for rendering and delegate user actions to its methods.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable (providers: [NatTableState]), not root.
@Injectable()
export class NatTableState<TData extends RowData = RowData> {
  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly directionality = inject(Directionality, { optional: true });
  private readonly intlService = inject<NatTableIntlService<TData>>(NatTableIntlService);

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
  public readonly columnResizeMode = computed(() => this.natTableService.columnResizeMode());
  public readonly columnSizingMode = computed(() => this.natTableService.columnSizingMode());
  public readonly resizingEnabled = computed(() => this.natTableService.enableColumnResizing());
  public readonly enableReordering = computed(() => this.natTableService.enableReordering());
  public readonly enableSorting = computed(() => this.natTableService.enableSorting());
  public readonly enablePinning = computed(() => this.natTableService.enablePinning());
  public readonly isFixedLayout = computed(() => this.columnSizingMode() === 'fixed');
  public readonly direction = computed(() => this.natTableService.direction());

  // ─── Controlled/internal state slices ───

  public readonly resizeSeedSizing = signal<ColumnSizingState>({});
  public readonly hasSeededInitialState = signal(false);

  private readonly sorting = controlledSlice<SortingState>(() => this.state().sorting, DEFAULT_TABLE_STATE.sorting, {
    read: (value) => normalizeSortingState(value, this.enableMultiSort()),
    write: (value) => normalizeSortingState(value, this.enableMultiSort())
  });

  private readonly globalFilter = controlledSlice(() => this.state().globalFilter, DEFAULT_TABLE_STATE.globalFilter, {
    read: (value) => (this.enableGlobalFilter() ? value : '')
  });

  private readonly columnFilters = controlledSlice<ColumnFiltersState>(
    () => this.state().columnFilters,
    DEFAULT_TABLE_STATE.columnFilters
  );

  private readonly columnVisibility = controlledSlice<VisibilityState>(
    () => this.state().columnVisibility,
    DEFAULT_TABLE_STATE.columnVisibility
  );

  private readonly columnOrder = controlledSlice<ColumnOrderState>(() => this.state().columnOrder, DEFAULT_TABLE_STATE.columnOrder, {
    read: (value) => normalizeColumnOrder(value, this.allLeafColumnIds()),
    write: (value) => normalizeColumnOrder(value, this.allLeafColumnIds())
  });

  private readonly columnPinning = controlledSlice<ColumnPinningState>(
    () => this.state().columnPinning,
    DEFAULT_TABLE_STATE.columnPinning,
    {
      read: (value) => normalizeColumnPinning(value, this.allLeafColumnIds()),
      write: (value) => normalizeColumnPinning(value, this.allLeafColumnIds())
    }
  );

  private readonly columnSizing = controlledSlice<ColumnSizingState>(
    () => this.state().columnSizing,
    DEFAULT_TABLE_STATE.columnSizing,
    {
      read: (resolved) => {
        const seed = this.resizeSeedSizing();

        let merged: ColumnSizingState | null = null;

        for (const columnId of Object.keys(seed)) {
          if (!(columnId in resolved)) {
            (merged ??= { ...resolved })[columnId] = seed[columnId];
          }
        }

        return merged ?? resolved;
      },
      write: (value) => this.clampColumnSizing(value)
    }
  );

  private readonly rowSelection = controlledSlice<RowSelectionState>(
    () => this.state().rowSelection,
    DEFAULT_TABLE_STATE.rowSelection,
    {
      read: (value) => normalizeRowSelection(value, this.selectionMode() === 'multiple'),
      write: (value) => normalizeRowSelection(value, this.selectionMode() === 'multiple')
    }
  );

  private readonly pagination = controlledSlice<PaginationState>(() => this.state().pagination, DEFAULT_TABLE_STATE.pagination);

  // ─── Stable DOM id ───

  public readonly tableElementId = signal(`nat-table-${nextTableId++}`);

  // ─── Intl/locale (delegated; the TanStack factory reads localeId) ───

  public readonly localeId = this.intlService.localeId;

  // ─── Derived column state ───

  public readonly allLeafColumnIds = computed(() => getColumnDefLeafIds(this.columnDefs()));
  public readonly userColumnSizing = computed(() => getUserColumnSizing(this.columnDefs()));

  // ─── Merged state ───

  public readonly mergedState = computed<NatTableUserState>(() => ({
    sorting: this.sorting.merged(),
    globalFilter: this.globalFilter.merged(),
    columnFilters: this.columnFilters.merged(),
    columnVisibility: this.columnVisibility.merged(),
    columnOrder: this.columnOrder.merged(),
    columnPinning: this.columnPinning.merged(),
    columnSizing: this.columnSizing.merged(),
    rowSelection: this.rowSelection.merged(),
    pagination: this.pagination.merged()
  }));

  // ─── Resolved status computeds ───

  public readonly resolvedDataStatus = computed(() => normalizeDataStatus(this.dataStatus()));
  public readonly resolvedCaption = computed(() => this.caption()?.trim() ?? '');
  public readonly resolvedDirection = computed<'ltr' | 'rtl'>(() => this.direction() ?? this.directionality?.value ?? 'ltr');

  // ─── TanStack table instance ───

  public readonly table: Table<TData> = createNatTableInstance(this);

  // ─── Derived TanStack computeds ───

  public readonly headerGroups = computed(() => this.table.getHeaderGroups());
  public readonly bodyRows = computed(() => this.table.getRowModel().rows);
  public readonly allLeafColumns = computed(() => this.table.getAllLeafColumns());
  public readonly hasResizableColumns = computed(() =>
    this.allLeafColumns().some((column) => isColumnResizable(column, this.resizingEnabled()))
  );

  public readonly hasReorderableColumns = computed(() =>
    someLeafColumnDef(this.columnDefs(), (column) => column.meta?.reorderable ?? this.enableReordering())
  );

  // Physical left-to-right render order: pinned zones follow their `columnPinning`
  // array order, which `getVisibleLeafColumns()` ignores (it stays in `columnOrder`).
  // The `<colgroup>` maps `<col>` widths to columns by position, so it must match the
  // header/body order or a reordered pinned column resizes its neighbor (issue #273).
  public readonly visibleColumns = computed(() => [
    ...this.table.getLeftVisibleLeafColumns(),
    ...this.table.getCenterVisibleLeafColumns(),
    ...this.table.getRightVisibleLeafColumns()
  ]);

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

  // ─── Layout class computed ───

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
   * Commit info from the in-progress pointer/touch resize drag. Set by
   * `applyColumnSizingChange`, read by the a11y service to announce the final
   * width on drag end, and cleared by the resize service at the start of a new
   * drag. The a11y service only reads it — it never mutates this field.
   */
  public resizeCommit: { readonly columnId: string; readonly width: number } | null = null;

  /** Clears the pending resize commit. Called by the resize service when a new pointer resize starts. */
  public clearResizeCommit(): void {
    this.resizeCommit = null;
  }

  public getResizeBounds(column: Column<TData, unknown>): { readonly min: number; readonly max: number | null } {
    return getColumnResizeBounds(column, this.userColumnSizing());
  }

  public getResizeFitBounds(column: Column<TData, unknown>): { readonly min: number; readonly max: number | null } {
    const { min, max: ownMax } = this.getResizeBounds(column);
    const fit = this.getViewportFitMax(column, this.regionViewportWidth());

    if (fit === null) return { min, max: ownMax };

    const cappedMax = ownMax !== null ? Math.min(ownMax, fit) : fit;

    return { min, max: Math.max(Math.round(cappedMax), min) };
  }

  /**
   * Viewport cap on a column's resize, or `null` when no cap applies (the column may grow to
   * its own maxSize and scroll). Fixed layout caps only pinned columns (see getPinnedFixedFitMax);
   * fill/flex caps every column so the table fills the region without overflowing (getFillFitMax).
   */
  private getViewportFitMax(column: Column<TData, unknown>, region: number): number | null {
    if (region <= 0) return null;

    if (this.isFixedLayout()) {
      return column.getIsPinned() !== false ? this.getPinnedFixedFitMax(column, region) : null;
    }

    return this.getFillFitMax(column, region);
  }

  /**
   * Largest width a pinned column may take in fixed layout while all pinned columns still fit
   * within the viewport AND leave a scrollable strip for the non-pinned columns. Never below the
   * column's current width, so an already-overflowing pin set doesn't force a shrink.
   *
   * A pinned column is sticky: growing it past the viewport pushes the following pinned columns'
   * sticky offsets beyond the viewport edge (an empty band opens on the left). And if the pinned
   * columns cover the entire viewport, the sticky cells hide the non-pinned columns for good —
   * no amount of scrolling can reveal them. So reserve room for the widest non-pinned column (up
   * to half the viewport) so it can be scrolled fully into view. Non-pinned columns themselves
   * keep growing and scrolling freely — fixed mode's intended overflow.
   */
  private getPinnedFixedFitMax(column: Column<TData, unknown>, region: number): number {
    const widths = this.resolvedColumnWidths();
    let sumOtherPinned = 0;
    let widestNonPinned = 0;

    for (const other of this.visibleColumns()) {
      if (other.id === column.id) continue;

      if (other.getIsPinned() === false) {
        widestNonPinned = Math.max(widestNonPinned, widths[other.id] ?? this.getColumnEffectiveWidth(other));
      } else {
        sumOtherPinned += widths[other.id] ?? this.getColumnEffectiveWidth(other);
      }
    }

    const nonPinnedReserve = Math.min(widestNonPinned, region / 2);
    const current = widths[column.id] ?? this.getColumnEffectiveWidth(column);

    return Math.max(current, region - sumOtherPinned - nonPinnedReserve);
  }

  /**
   * Largest width a column may take in fill/flex layout: the viewport minus what the other
   * columns can yield (their minimums when unsized in fill flex, otherwise their current
   * widths), so the table fills the region without overflowing. Never below the column's
   * current width.
   */
  private getFillFitMax(column: Column<TData, unknown>, region: number): number {
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

    return Math.max(current, region - sumOthers);
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
    if (!isColumnResizable(column, this.resizingEnabled())) return null;

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
    const column = this.table.getColumn(columnId);

    if (!column || !isColumnReorderable(column, this.enableReordering())) return false;

    const zone = this.getColumnZoneById(columnId);

    if (!zone) return false;

    const visibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);

    return getColumnMoveTargetIndex(visibleZoneColumnIds, columnId, directionDelta) !== null;
  }

  public moveColumnByDelta(columnId: string, directionDelta: ColumnReorderKeyboardDirection): NatTableColumnReorderResult | null {
    const column = this.table.getColumn(columnId);

    if (!column || !isColumnReorderable(column, this.enableReordering())) return null;

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
    const movingColumn = this.table.getColumn(movingColumnId);

    if (!movingColumn || !isColumnReorderable(movingColumn, this.enableReordering())) return null;

    const currentState = this.mergedState();
    const currentVisibleZoneColumnIds = this.getVisibleZoneColumnIds(zone);

    if (!currentVisibleZoneColumnIds.length || hasSameStringOrder(currentVisibleZoneColumnIds, nextVisibleZoneOrder)) {
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

    // `zone` narrows to 'left' | 'right' here because the center branch above returns.
    const currentPinnedZoneOrder = currentState.columnPinning[zone] ?? [];
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
    // visibleColumns() is pin-aware (left/center/right zone getters); TanStack's
    // getVisibleLeafColumns() orders pinned columns by columnOrder, not by the
    // columnPinning arrays, so after a pinned reorder it reports the stale order
    // and the next reorder in that zone is wrongly rejected as a no-op.
    return this.visibleColumns()
      .filter((column) => getColumnZone(column) === zone)
      .map((column) => column.id);
  }

  // ─── State management ───

  public seedInitialState(initialState: Partial<NatTableUserState>): void {
    const seed = resolveSeedState(initialState, DEFAULT_TABLE_STATE);

    this.sorting.seed(normalizeSortingState(seed.sorting, this.enableMultiSort()));
    this.globalFilter.seed(this.enableGlobalFilter() ? seed.globalFilter : '');
    this.columnFilters.seed(seed.columnFilters);
    this.columnVisibility.seed(seed.columnVisibility);
    this.columnOrder.seed(seed.columnOrder);
    this.columnPinning.seed(seed.columnPinning);
    this.columnSizing.seed(seed.columnSizing);
    this.rowSelection.seed(normalizeRowSelection(seed.rowSelection, this.selectionMode() === 'multiple'));
    this.pagination.seed(seed.pagination);
    this.hasSeededInitialState.set(true);

    this.natTableService.notifyStateChange(this.mergedState());
  }

  public updateState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void {
    const nextState: NatTableUserState = {
      sorting: this.sorting.resolve(updaters.sorting),
      globalFilter: this.globalFilter.resolve(updaters.globalFilter),
      columnFilters: this.columnFilters.resolve(updaters.columnFilters),
      columnVisibility: this.columnVisibility.resolve(updaters.columnVisibility),
      columnOrder: this.columnOrder.resolve(updaters.columnOrder),
      columnPinning: this.columnPinning.resolve(updaters.columnPinning),
      columnSizing: this.columnSizing.resolve(updaters.columnSizing),
      rowSelection: this.rowSelection.resolve(updaters.rowSelection),
      pagination: this.pagination.resolve(updaters.pagination)
    };

    this.sorting.commit(nextState.sorting);
    this.globalFilter.commit(nextState.globalFilter);
    this.columnFilters.commit(nextState.columnFilters);
    this.columnVisibility.commit(nextState.columnVisibility);
    this.columnOrder.commit(nextState.columnOrder);
    this.columnPinning.commit(nextState.columnPinning);
    this.columnSizing.commit(nextState.columnSizing);
    this.rowSelection.commit(nextState.rowSelection);
    this.pagination.commit(nextState.pagination);

    this.natTableService.notifyStateChange(nextState);
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
