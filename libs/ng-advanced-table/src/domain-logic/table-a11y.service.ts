/* eslint-disable max-lines -- cohesive a11y service: live announcements, snapshot capture, state-change diffing, per-feature describe methods, and ARIA multiselectable management. */
import { Injectable, afterRenderEffect, computed, effect, inject, isDevMode, signal, untracked } from '@angular/core';

import type { Column, PaginationState, RowData } from '@tanstack/angular-table';

import { NatTableService } from './table.service';
import { NatTableState } from './table.state';
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
  NatTableDataStatus,
  TableColumnAccessibilityState
} from '../common/table.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table.type';
import { validateKeybindings } from '../utils/keybindings';
import {
  hasSameColumnVisibility,
  resolveColumnLabel,
  resolveFilterState,
  serializeColumnFilters,
  serializeRowSelection,
  serializeSorting,
  sortDirection
} from '../utils/table-utils';

type TableAccessibilitySnapshot = {
  readonly dataStatus: NatTableDataStatus;
  readonly sortingKey: string;
  readonly globalFilter: string;
  readonly columnFiltersKey: string;
  readonly rowSelectionKey: string;
  readonly selectedRowCount: number;
  readonly pagination: PaginationState;
  readonly pageCount: number;
  readonly visibleRows: number;
  readonly totalRows: number;
  readonly columns: TableColumnAccessibilityState[];
};

/**
 * Cross-cutting accessibility service for the table.
 *
 * Owns the live-region text signal, all `announce*()` methods that format
 * and push screen-reader announcements, snapshot capture, state-change diffing,
 * and ARIA multiselectable management.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable (providers: [NatTableA11yService]), not root.
@Injectable()
export class NatTableA11yService<TData extends RowData = RowData> {
  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly state = inject<NatTableState<TData>>(NatTableState);

  private lastAccessibilitySnapshot: TableAccessibilitySnapshot | null = null;
  private previousResizingColumnId: string | null = null;

  /** Text written to the live region for screen-reader announcements. */
  public readonly liveMessage = signal('');

  /** Whether announcements are enabled (gate signal from NatTableService). */
  public readonly enableAnnouncements = this.natTableService.enableAnnouncements;

  /** Table summary string for `aria-describedby`. */
  public readonly tableSummary = computed(() => this.buildTableSummary());

  public constructor() {
    this.registerAnnouncementEffect();
    this.registerResizeAnnouncementEffect();
    this.registerAriaMultiSelectableEffect();
    this.registerAccessibleNameValidationEffect();
    this.registerKeybindingValidationEffect();
  }

  // ─── Announce helpers ───

  /**
   * Low-level announce: clears the live region, then sets the message on the
   * next microtask so the browser re-reads the region even when the text is
   * identical to the previous announcement.
   */
  public announce(message: string): void {
    this.liveMessage.set('');
    queueMicrotask(() => this.liveMessage.set(message));
  }

  /**
   * Format a number for screen-reader readout using the resolved locale.
   */
  public formatAccessibilityNumber(value: number): string {
    return this.state.formatAccessibilityNumber(value);
  }

  /**
   * Announce a column reorder. Called by `NatTableReorderService` and
   * companion header-action controls after applying the column order change.
   */
  public announceColumnReorder(
    movingColumnId: string,
    zone: 'left' | 'center' | 'right',
    nextVisibleZoneOrder: readonly string[]
  ): void {
    const movingColumn = this.state.table.getColumn(movingColumnId);

    if (!movingColumn) return;

    const label = resolveColumnLabel(movingColumn);
    const nextIndex = nextVisibleZoneOrder.indexOf(movingColumnId);

    if (nextIndex === -1) {
      return;
    }

    const formatter = this.state.resolvedAccessibilityText().columnReorder;
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

  /**
   * Announce a column resize. Called by the resize service when a pointer
   * resize ends or by keyboard resize.
   */
  public announceColumnResize(column: Column<TData, unknown>, width: number): void {
    const label = resolveColumnLabel(column);
    const formatter = this.state.resolvedAccessibilityText().columnResize;
    const { min } = this.state.getResizeBounds(column);
    const { max } = this.state.getResizeFitBounds(column);
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

  // ─── State-change announcement effect ───

  private registerAnnouncementEffect(): void {
    effect(() => {
      if (!this.state.hasSeededInitialState()) {
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

  // ─── Resize-end announcement effect ───

  private registerResizeAnnouncementEffect(): void {
    effect(() => {
      const resizingColumnId = this.state.table.getState().columnSizingInfo.isResizingColumn || null;

      untracked(() => this.handleResizeEnd(resizingColumnId));
    });
  }

  private handleResizeEnd(resizingColumnId: string | null): void {
    const previous = this.previousResizingColumnId;

    this.previousResizingColumnId = resizingColumnId;

    if (!previous || resizingColumnId || !this.enableAnnouncements()) {
      return;
    }

    const commit = this.state.resizeCommit;

    this.state.resizeCommit = null;

    if (commit?.columnId !== previous) {
      return;
    }

    const column = this.state.table.getColumn(previous);

    if (column) {
      this.announceColumnResize(column, commit.width);
    }
  }

  // ─── ARIA multiselectable ───

  /**
   * Sets `aria-multiselectable` imperatively on the `<table>` element.
   * Written via `afterRenderEffect` because `ngGrid` clobbers template bindings.
   */
  private registerAriaMultiSelectableEffect(): void {
    afterRenderEffect(() => {
      const multiSelectable = this.state.enableRowSelection() && this.state.selectionMode() === 'multiple';
      const table = this.state.tableRegionRef()?.nativeElement.querySelector('table');

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

  // ─── Summary ───

  private buildTableSummary(): string {
    const summaryContext = this.getSummaryContext();
    const formatter = this.state.resolvedAccessibilityText().tableSummary;

    return formatter?.(summaryContext) ?? '';
  }

  private getSummaryContext(): NatTableAccessibilitySummaryContext {
    const visibleRows = this.state.renderedVisibleRowCount();
    const totalRows = this.state.stateTotalRowCount();
    const visibleColumns = this.state.visibleColumnCount();
    const pageIndex = this.state.renderedPageIndex();
    const page = pageIndex + 1;
    const pageCount = this.state.renderedPageCount();

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
      filterState: this.state.isFiltered() ? 'filtered' : 'unfiltered',
      paginationState: this.state.enablePagination() ? 'enabled' : 'disabled'
    };
  }

  // ─── Snapshot and diffing ───

  private captureAccessibilitySnapshot(): TableAccessibilitySnapshot {
    const state = this.state.mergedState();

    return {
      dataStatus: this.state.resolvedDataStatus(),
      sortingKey: serializeSorting(state.sorting),
      globalFilter: state.globalFilter.trim(),
      columnFiltersKey: serializeColumnFilters(state.columnFilters),
      rowSelectionKey: serializeRowSelection(state.rowSelection),
      selectedRowCount: Object.values(state.rowSelection).filter(Boolean).length,
      pagination: {
        ...state.pagination,
        pageIndex: this.state.renderedPageIndex()
      },
      pageCount: this.state.renderedPageCount(),
      visibleRows: this.state.renderedVisibleRowCount(),
      totalRows: this.state.stateTotalRowCount(),
      columns: this.state.allLeafColumns().map((column) => ({
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

  // ─── Per-change-type describe methods ───

  private describeDataStatusChange(snapshot: TableAccessibilitySnapshot): string {
    if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.loading) {
      return this.state.resolvedLoadingState();
    }

    if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.error) {
      return this.state.resolvedErrorState();
    }

    if (snapshot.visibleRows === 0) {
      return this.state.resolvedEmptyState();
    }

    return '';
  }

  private describeSortingChange(snapshot: TableAccessibilitySnapshot): string {
    const sortingState = this.state.mergedState().sorting;
    const formatter = this.state.resolvedAccessibilityText().sortingChange;
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
    const formatter = this.state.resolvedAccessibilityText().filteringChange;
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
    const formatter = this.state.resolvedAccessibilityText().columnVisibilityChange;
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
    const formatter = this.state.resolvedAccessibilityText().selectionChange;
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
    const formatter = this.state.resolvedAccessibilityText().pageSizeChange;
    const context = this.getPaginationAnnouncementContext(snapshot);

    if (formatter) {
      return formatter(context);
    }

    return '';
  }

  private describePageChange(snapshot: TableAccessibilitySnapshot): string {
    const formatter = this.state.resolvedAccessibilityText().pageChange;
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

  // ─── Dev-mode validation effects ───

  private registerAccessibleNameValidationEffect(): void {
    afterRenderEffect(() => {
      if (!isDevMode() || this.state.resolvedCaption() || this.state.accessibleName()?.trim()) {
        return;
      }

      console.warn('[ng-advanced-table] <nat-table> requires either `caption` or `accessibleName` for an accessible name.');
    });
  }

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
}
