import { DestroyRef, ElementRef, Injectable, afterRenderEffect, computed, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableVirtualLayoutService } from './table-virtual-layout.service';
import { isNatTableDelegatedCellControl } from '../../cell-interaction/utils/cell-interaction.util';
import { NatTableState } from '../../domain-logic/table.state';
import type { NatTableVirtualNavigationRequest, NatTableVirtualizerController } from '../common/table-virtualization.type';
import { resolveNatTableVirtualNavigation } from '../utils/table-virtual-keyboard.util';

type PendingVirtualFocus = Pick<NatTableVirtualNavigationRequest, 'rowIndex' | 'columnId'>;

/** Keeps roving grid focus stable while body rows enter and leave the DOM. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualFocusService<TData extends RowData = RowData> {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly layout = inject<NatTableVirtualLayoutService<TData>>(NatTableVirtualLayoutService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly controller = signal<NatTableVirtualizerController | null>(null);
  private readonly focusedRowId = signal<string | null>(null);
  private readonly pendingFocus = signal<PendingVirtualFocus | null>(null);

  public readonly focusedLogicalIndex = computed(() => {
    const focusedRowId = this.focusedRowId();

    if (focusedRowId === null) {
      return null;
    }

    const index = this.state.bodyRows().findIndex((row) => row.id === focusedRowId);

    return index === -1 ? null : index;
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

  public reset(): void {
    this.pendingFocus.set(null);
    this.focusedRowId.set(null);
  }

  private readonly onFocusIn = (event: FocusEvent): void => {
    const target = event.target;
    const row = target instanceof Element ? target.closest<HTMLTableRowElement>('tr.data-row[data-row-id]') : null;

    this.focusedRowId.set(row?.dataset['rowId'] ?? null);
  };

  private readonly onFocusOut = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget;

    if (!(relatedTarget instanceof Node) || !this.elementRef.nativeElement.contains(relatedTarget)) {
      this.focusedRowId.set(null);
    }
  };

  // eslint-disable-next-line complexity -- capture handler validates DOM focus, mounted range, viewport, and key intent before interception.
  private readonly onKeydownCapture = (event: KeyboardEvent): void => {
    const controller = this.controller();
    const target = event.target instanceof HTMLElement ? event.target : null;
    const cell = target?.closest<HTMLElement>('[ngGridCell][data-column-id]') ?? null;
    const isGridFocusTarget = target !== null && cell !== null && (target === cell || isNatTableDelegatedCellControl(cell, target));

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

      const row = [...this.elementRef.nativeElement.querySelectorAll<HTMLTableRowElement>('tr.data-row')].find(
        (candidate) => Number(candidate.dataset['rowIndex']) === pendingFocus.rowIndex
      );
      const cells = row ? [...row.querySelectorAll<HTMLElement>('[ngGridCell][data-column-id]')] : [];
      const cell = cells.find((candidate) => candidate.dataset['columnId'] === pendingFocus.columnId) ?? cells.at(0);

      if (cell) {
        cell.focus({ preventScroll: true });
        this.pendingFocus.set(null);
      }
    });
  }
}
