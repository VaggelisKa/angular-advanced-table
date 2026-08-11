import { DestroyRef, ElementRef, Injectable, afterRenderEffect, computed, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost } from 'ng-advanced-table';

import { NatTableVirtualLayoutService } from './table-virtual-layout.service';
import type { NatTableVirtualNavigationRequest, NatTableVirtualizerController } from '../common/table-virtualization.type';
import { scrollNatTableCellHorizontallyIntoView } from '../utils/horizontal-scroll.util';
import { resolveNatTableVirtualNavigation } from '../utils/table-virtual-keyboard.util';

type PendingVirtualFocus = {
  readonly rowIndex: NatTableVirtualNavigationRequest['rowIndex'] | null;
  readonly columnId: NatTableVirtualNavigationRequest['columnId'];
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
  private readonly focusedRowId = signal<string | null>(null);
  private readonly focusedColumnId = signal<string | null>(null);
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
    const focusedRowId = this.focusedRowId();

    return focusedRowId === null ? null : (this.rowIndexById().get(focusedRowId) ?? null);
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

  public resetForRowModelChange(): boolean {
    const controller = this.controller();
    const rowId = this.focusedRowId();
    const columnId = this.focusedColumnId();

    this.pendingFocus.set(null);

    if (!controller || rowId === null || columnId === null) {
      this.focusedRowId.set(null);
      this.focusedColumnId.set(null);

      return false;
    }

    const nextRowIndex = this.rowIndexById().get(rowId);

    if (nextRowIndex !== undefined) {
      this.pendingFocus.set({ rowIndex: nextRowIndex, columnId });
      controller.scrollToIndex(nextRowIndex, { align: 'auto' });

      return true;
    }

    this.pendingFocus.set({ rowIndex: null, columnId });
    this.focusedRowId.set(null);
    this.focusedColumnId.set(null);

    return false;
  }

  private readonly onFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    const row = target instanceof Element ? target.closest<HTMLTableRowElement>('tr.data-row[data-row-id]') : null;
    const cell = target instanceof Element ? target.closest<HTMLElement>('[ngGridCell][data-column-id]') : null;

    this.focusedRowId.set(row?.dataset['rowId'] ?? null);
    this.focusedColumnId.set(row && cell ? (cell.dataset['columnId'] ?? null) : null);
  };

  private readonly onFocusOut = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget;

    if (!(relatedTarget instanceof Node) || !this.elementRef.nativeElement.contains(relatedTarget)) {
      this.focusedRowId.set(null);
      this.focusedColumnId.set(null);
    }
  };

  // eslint-disable-next-line complexity -- capture handler validates DOM focus, mounted range, viewport, and key intent before interception.
  private readonly onKeydownCapture = (event: KeyboardEvent): void => {
    const controller = this.controller();
    const target = event.target instanceof HTMLElement ? event.target : null;
    const cell = target?.closest<HTMLElement>('[ngGridCell][data-column-id]') ?? null;
    const isGridFocusTarget = target !== null && cell !== null && (target === cell || this.state.isDelegatedCellControl(cell, target));

    if (!controller || !cell || !isGridFocusTarget || event.defaultPrevented) {
      return;
    }

    const row = cell.closest<HTMLTableRowElement>('tr.data-row[data-row-index]');
    const rowIndexValue = row?.dataset['rowIndex'];
    const currentRowIndex = rowIndexValue === undefined ? null : Number(rowIndexValue);
    const rowHeight = controller.rowHeight();
    const regionHeight = this.state.tableRegionRef()?.nativeElement.clientHeight ?? rowHeight;
    const stickyOverlayHeight = this.state.stickyHeader() ? this.layout.stickyOverlayHeight() : 0;
    const request = resolveNatTableVirtualNavigation({
      event,
      currentRowIndex: Number.isInteger(currentRowIndex) ? currentRowIndex : null,
      currentColumnId: cell.dataset['columnId'] ?? '',
      lastColumnId: this.state.visibleColumns().at(-1)?.id,
      mountedRowIndexes: new Set(controller.items().map((item) => item.index)),
      rowCount: this.state.bodyRows().length,
      rowsPerPage: Math.max(1, Math.floor((regionHeight - stickyOverlayHeight) / rowHeight))
    });

    if (!request) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.pendingFocus.set(request);
    controller.scrollToIndex(request.rowIndex, { align: request.align });
  };

  private registerPendingFocusEffect(): void {
    afterRenderEffect(() => {
      const controller = this.controller();
      const pendingFocus = this.pendingFocus();

      controller?.items();

      if (!pendingFocus) {
        return;
      }

      const cells = this.resolvePendingFocusCells(pendingFocus);
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

  private resolvePendingFocusCells(pendingFocus: PendingVirtualFocus): HTMLElement[] {
    const host = this.elementRef.nativeElement;

    if (pendingFocus.rowIndex === null) {
      return [...host.querySelectorAll<HTMLElement>('thead [ngGridCell][data-column-id]')];
    }

    const row = [...host.querySelectorAll<HTMLTableRowElement>('tr.data-row')].find(
      (candidate) => Number(candidate.dataset['rowIndex']) === pendingFocus.rowIndex
    );

    return row ? [...row.querySelectorAll<HTMLElement>('[ngGridCell][data-column-id]')] : [];
  }
}
