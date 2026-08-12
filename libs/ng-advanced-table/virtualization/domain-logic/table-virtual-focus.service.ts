import { DestroyRef, ElementRef, Injectable, afterRenderEffect, computed, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_BODY_STATE, NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost } from 'ng-advanced-table';

import { NatTableVirtualLayoutService } from './table-virtual-layout.service';
import type { NatTableVirtualNavigationRequest, NatTableVirtualizerController } from '../common/table-virtualization.type';
import { readNatTableActiveBodyFocus } from '../utils/active-body-focus.util';
import { scrollNatTableCellHorizontallyIntoView } from '../utils/horizontal-scroll.util';
import { resolveNatTablePendingFocusCells } from '../utils/pending-focus-cell.util';
import { findOwnedNatTableCell, findOwnedNatTableDataRow } from '../utils/table-ownership.util';
import { resolveNatTableVirtualNavigation } from '../utils/table-virtual-keyboard.util';

type PendingVirtualFocus = {
  readonly rowIndex: NatTableVirtualNavigationRequest['rowIndex'] | null;
  readonly columnId: NatTableVirtualNavigationRequest['columnId'];
  readonly preferHeader?: boolean;
};

/** Keeps roving grid focus stable while body rows enter and leave the DOM. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualFocusService<TData extends RowData = RowData> {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private readonly layout = inject<NatTableVirtualLayoutService<TData>>(NatTableVirtualLayoutService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly controller = signal<NatTableVirtualizerController | null>(null);
  /**
   * Last body row the grid's roving tabstop landed on, kept while focus stays
   * anywhere inside the table host. It survives focus moving to in-table
   * chrome (header cells, in-cell controls), so the Aria grid's remembered
   * cell is still in the DOM when focus returns.
   */
  private readonly retainedRowId = signal<string | null>(null);
  private readonly pendingFocus = signal<PendingVirtualFocus | null>(null);

  /**
   * Logical index by row id, rebuilt only when the row model changes. Lazy:
   * `focusedLogicalIndex` reads it only while a row is focused, so a table the
   * user never focuses never builds the map — and each focus move while
   * navigating costs one lookup instead of an O(n) scan.
   */
  private readonly rowIndexById = computed(() => {
    const indexById = new Map<string, number>();

    this.state.bodyRows().forEach((row, index) => indexById.set(row.id, index));

    return indexById;
  });

  public readonly focusedLogicalIndex = computed(() => {
    const retainedRowId = this.retainedRowId();

    return retainedRowId === null ? null : (this.rowIndexById().get(retainedRowId) ?? null);
  });

  public constructor() {
    const host = this.elementRef.nativeElement;

    host.addEventListener('keydown', this.onKeydownCapture, true);
    host.addEventListener('focusin', this.onFocusIn);
    host.addEventListener('focusout', this.onFocusOut);

    this.destroyRef.onDestroy(() => {
      host.removeEventListener('keydown', this.onKeydownCapture, true);
      host.removeEventListener('focusin', this.onFocusIn);
      host.removeEventListener('focusout', this.onFocusOut);
    });

    this.registerPendingFocusEffect();
  }

  public connect(controller: NatTableVirtualizerController): void {
    this.controller.set(controller);
  }

  /** Captures body focus before a row-model or state-row transition. */
  public prepareRowModelReset(): number | null {
    const controller = this.controller();

    this.pendingFocus.set(null);

    const activeFocus = readNatTableActiveBodyFocus(this.elementRef.nativeElement, this.state.visibleColumns().at(0)?.id);

    if (!controller || !activeFocus) {
      this.retainedRowId.set(null);

      return null;
    }

    const { columnId, rowId } = activeFocus;
    const targetIndex = this.resolveResetTargetIndex(rowId);
    const targetRowId = targetIndex === null ? null : (this.state.bodyRows()[targetIndex]?.id ?? null);

    this.retainedRowId.set(targetRowId);
    this.pendingFocus.set({ rowIndex: targetIndex, columnId });

    return targetIndex;
  }

  private resolveResetTargetIndex(rowId: string | null): number | null {
    if (this.state.bodyState() !== NAT_TABLE_BODY_STATE.rows || this.state.bodyRows().length === 0) {
      return null;
    }

    return rowId === null ? 0 : (this.rowIndexById().get(rowId) ?? 0);
  }

  private readonly onFocusIn = (event: FocusEvent): void => {
    const row = findOwnedNatTableDataRow(this.elementRef.nativeElement, event.target);

    if (row) {
      this.retainedRowId.set(row.dataset['rowId'] ?? null);
    }
  };

  private readonly onFocusOut = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget;

    if (!(relatedTarget instanceof Node) || !this.elementRef.nativeElement.contains(relatedTarget)) {
      this.retainedRowId.set(null);
    }
  };

  // eslint-disable-next-line complexity -- capture handler validates DOM focus, mounted range, viewport, and key intent before interception.
  private readonly onKeydownCapture = (event: KeyboardEvent): void => {
    const controller = this.controller();
    const target = event.target instanceof HTMLElement ? event.target : null;
    const cell = findOwnedNatTableCell(this.elementRef.nativeElement, target);
    const isGridFocusTarget = target !== null && cell !== null && (target === cell || this.state.isDelegatedCellControl(cell, target));

    if (!controller || !cell || !isGridFocusTarget || event.defaultPrevented) {
      return;
    }

    // Ownership-scoped: a bare `closest` walks straight out of this table when
    // the focused cell sits in the header, and an enclosing table's data row
    // would hand the header cell that row's index instead of `null`.
    const row = findOwnedNatTableDataRow(this.elementRef.nativeElement, cell);
    const rowIndexValue = row?.dataset['rowIndex'];
    const currentRowIndex = rowIndexValue === undefined ? null : Number(rowIndexValue);
    const request = resolveNatTableVirtualNavigation({
      event,
      currentRowIndex: Number.isInteger(currentRowIndex) ? currentRowIndex : null,
      currentColumnId: cell.dataset['columnId'] ?? '',
      firstColumnId: this.state.visibleColumns().at(0)?.id,
      lastColumnId: this.state.visibleColumns().at(-1)?.id,
      mountedRowIndexes: new Set(controller.items().map((item) => item.index)),
      rowCount: this.state.bodyRows().length,
      rowsPerPage: this.resolveRowsPerPage(controller),
      subHeaderOffsets: this.state.subHeaderRowOffsets()
    });

    if (!request) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.pendingFocus.set({ ...request, preferHeader: request.rowIndex === null });

    if (request.rowIndex === null) {
      controller.scrollToOffset(0);
    } else {
      controller.scrollToIndex(request.rowIndex, { align: request.align });
    }
  };

  private resolveRowsPerPage(controller: NatTableVirtualizerController): number {
    const rowHeight = controller.rowHeight();
    const region = this.state.tableRegionRef()?.nativeElement;

    if (!region) {
      return 1;
    }

    const bodyStart = Math.max(0, this.layout.bodyOffset() - region.scrollTop);
    const stickyOverlay = this.state.stickyHeader() ? this.layout.stickyOverlayHeight() : 0;
    const visibleBodyHeight = region.clientHeight - Math.max(bodyStart, stickyOverlay);

    return Math.max(1, Math.floor(visibleBodyHeight / rowHeight));
  }

  private registerPendingFocusEffect(): void {
    afterRenderEffect(() => {
      const controller = this.controller();
      const pendingFocus = this.pendingFocus();

      controller?.items();

      if (!pendingFocus) {
        return;
      }

      const cells = resolveNatTablePendingFocusCells(this.elementRef.nativeElement, pendingFocus);
      const cell = cells.find((candidate) => candidate.dataset['columnId'] === pendingFocus.columnId) ?? cells.at(0);

      if (cell) {
        cell.focus({ preventScroll: true });
        const region = this.state.tableRegionRef()?.nativeElement;

        if (region) {
          scrollNatTableCellHorizontallyIntoView(region, cell);
        }

        this.pendingFocus.set(null);
      }
    });
  }
}
