/* eslint-disable max-lines -- a11y service residual (194 code lines): DI + the liveMessage signal + snapshot capture that must read live signals + the tableSummary computed + five effect/afterRenderEffect registrations that must run in the constructor injection context, plus the thin announce* capture-then-delegate call sites. All pure announcement/summary/context formatting was extracted to the table-announcement, table-pagination-announcement, and table-summary utils. */
import { Injectable, afterRenderEffect, computed, effect, inject, isDevMode, signal, untracked } from '@angular/core';

import type { Column, RowData } from '@tanstack/angular-table';

import { NatTableIntlService } from './table-intl.service';
import { NatTableService } from './table.service';
import { NatTableState } from './table.state';
import type { TableAccessibilitySnapshot } from '../common/table-a11y.type';
import { validateKeybindings } from '../hotkey-a11y/utils/keybindings.util';
import { resolveColumnLabel } from '../utils/column-label.util';
import { serializeRowSelection } from '../utils/row-state.util';
import { serializeColumnFilters, serializeSorting } from '../utils/sorting.util';
import { describeAccessibilityChange } from '../utils/table-announcement.util';
import { buildColumnReorderContext, buildColumnResizeContext, getSummaryContext } from '../utils/table-summary.util';

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
  private readonly intlService = inject<NatTableIntlService<TData>>(NatTableIntlService);

  private lastAccessibilitySnapshot: TableAccessibilitySnapshot | null = null;
  private previousResizingColumnId: string | null = null;

  /** Text written to the live region for screen-reader announcements. */
  public readonly liveMessage = signal('');

  /** Whether announcements are enabled (gate signal from NatTableService). */
  public readonly enableAnnouncements = this.natTableService.enableAnnouncements;

  /** Table summary string for `aria-describedby`. */
  public readonly tableSummary = computed(() => this.buildTableSummary());

  // ─── ARIA element ids ───

  public readonly tableCaptionId = computed(() => `${this.state.tableElementId()}-caption`);
  public readonly tableSummaryId = computed(() => `${this.state.tableElementId()}-summary`);
  public readonly tableDescriptionId = computed(() => `${this.state.tableElementId()}-description`);
  public readonly tableKeyboardInstructionsId = computed(() => `${this.state.tableElementId()}-instructions`);

  // ─── Resolved a11y text ───

  public readonly resolvedDescription = computed(() => this.intlService.resolvedAccessibilityText().description ?? '');
  public readonly resolvedEmptyState = computed(() => this.intlService.resolvedAccessibilityText().emptyState ?? '');
  public readonly resolvedLoadingState = computed(() => this.intlService.resolvedAccessibilityText().loadingState ?? '');
  public readonly resolvedErrorState = computed(() => this.intlService.resolvedAccessibilityText().errorState ?? '');

  // ─── ARIA attribute computeds ───

  public readonly resolvedKeyboardInstructions = computed(() => {
    const text = this.intlService.resolvedAccessibilityText();
    const instructions = (text.keyboardInstructions ?? '').trim();
    const reorderInstructions = text.reorderKeyboardInstructions?.trim() ?? '';
    const resizeInstructions = text.resizeKeyboardInstructions?.trim() ?? '';
    const parts = [instructions];

    if (this.state.hasReorderableColumns()) {
      parts.push(reorderInstructions);
    }

    if (this.state.hasResizableColumns()) {
      parts.push(resizeInstructions);
    }

    return parts.filter((value) => !!value).join(' ');
  });

  public readonly tableAriaLabel = computed(() => {
    if (this.state.resolvedCaption()) {
      return null;
    }

    const name = this.state.accessibleName()?.trim();

    return name === undefined || name === '' ? null : name;
  });

  public readonly tableAriaLabelledBy = computed(() => (this.state.resolvedCaption() ? this.tableCaptionId() : null));

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
    return this.intlService.formatAccessibilityNumber(value);
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

    const formatter = this.intlService.resolvedAccessibilityText().columnReorder;
    const context = buildColumnReorderContext(
      {
        columnId: movingColumnId,
        label,
        zone,
        positionValue: nextIndex + 1,
        totalValue: nextVisibleZoneOrder.length
      },
      (value) => this.formatAccessibilityNumber(value)
    );

    this.announce(formatter?.(context) ?? '');
  }

  /**
   * Announce a column resize. Called by the resize service when a pointer
   * resize ends or by keyboard resize.
   */
  public announceColumnResize(column: Column<TData, unknown>, width: number): void {
    const label = resolveColumnLabel(column);
    const formatter = this.intlService.resolvedAccessibilityText().columnResize;
    const { min } = this.state.getResizeBounds(column);
    const { max } = this.state.getResizeFitBounds(column);
    const context = buildColumnResizeContext(
      {
        columnId: column.id,
        label,
        widthValue: width,
        min,
        max
      },
      (value) => this.formatAccessibilityNumber(value)
    );

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

      const message = describeAccessibilityChange(
        previousSnapshot,
        snapshot,
        () => this.intlService.resolvedAccessibilityText(),
        (value) => this.formatAccessibilityNumber(value)
      );

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
    const summaryContext = getSummaryContext(
      {
        visibleRows: this.state.renderedVisibleRowCount(),
        totalRows: this.state.stateTotalRowCount(),
        visibleColumns: this.state.visibleColumnCount(),
        pageIndex: this.state.renderedPageIndex(),
        pageCount: this.state.renderedPageCount(),
        isFiltered: this.state.isFiltered(),
        paginationEnabled: this.state.enablePagination()
      },
      (value) => this.formatAccessibilityNumber(value)
    );
    const formatter = this.intlService.resolvedAccessibilityText().tableSummary;

    return formatter?.(summaryContext) ?? '';
  }

  // ─── Snapshot capture ───

  private captureAccessibilitySnapshot(): TableAccessibilitySnapshot {
    const state = this.state.mergedState();

    return {
      dataStatus: this.state.resolvedDataStatus(),
      sorting: state.sorting,
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
