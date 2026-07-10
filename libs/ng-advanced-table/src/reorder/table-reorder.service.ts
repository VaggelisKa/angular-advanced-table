import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable, Injector, afterNextRender, inject } from '@angular/core';

import type { Column, HeaderGroup, RowData } from '@tanstack/angular-table';

import type { ColumnReorderKeyboardDirection, ColumnReorderZone } from '../common/column-render.type';
import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableState } from '../domain-logic/table.state';
import { readColumnEntry } from '../utils/column-def.util';
import { getHeaderRowColumnIds } from '../utils/column-label.util';
import { getColumnZone, moveItemInArrayCopy } from '../utils/column-order.util';
import { isColumnReorderable, resolveDraggedColumnId, scrollElementHorizontallyIntoView } from '../utils/interaction.util';

/**
 * Per-table service that manages column-reorder logic and scroll-into-view behavior.
 *
 * After a column is reordered (drag-drop or keyboard), this service applies
 * the state change, announces the move for screen readers, and scrolls the
 * moved header into the visible viewport.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance service, provided by NatTable (providers: [...]), not root.
@Injectable()
export class NatTableReorderService<TData extends RowData = RowData> {
  private readonly injector = inject(Injector);
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly a11yService = inject<NatTableA11yService<TData>>(NatTableA11yService);

  // ─── Template-facing helpers ───

  public isLeafHeaderRow(headerGroup: HeaderGroup<TData>): boolean {
    return headerGroup.id === this.state.leafHeaderRowId();
  }

  public isReorderingEnabled(): boolean {
    return this.state.enableReordering();
  }

  public hasReorderableColumns(): boolean {
    return this.state.hasReorderableColumns();
  }

  public canReorderHeader(column: Column<TData, unknown>): boolean {
    return (
      isColumnReorderable(column, this.isReorderingEnabled()) && this.state.getVisibleZoneColumnIds(getColumnZone(column)).length > 1
    );
  }

  // ─── Drag-drop reorder ───

  public onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void {
    try {
      if (!this.isLeafHeaderRow(headerGroup)) return;

      const rowColumnIds = getHeaderRowColumnIds<TData>(headerGroup);
      const movingColumnId = resolveDraggedColumnId(event, rowColumnIds);

      if (!movingColumnId) {
        return;
      }

      const movingColumn = this.state.table.getColumn(movingColumnId);

      if (!movingColumn || !isColumnReorderable(movingColumn, this.isReorderingEnabled())) {
        return;
      }

      const zone = this.state.getColumnZoneById(movingColumnId);

      if (!zone) {
        return;
      }

      const nextVisibleZoneOrder = this.resolveDropZoneOrder(event, rowColumnIds, zone, movingColumnId);

      if (!nextVisibleZoneOrder) {
        return;
      }

      const result = this.state.applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder);

      if (!result) return;

      this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
      this.scrollHeaderIntoView(movingColumnId);
    } finally {
      this.restoreDraggedHeaderPinnedOffset(event);
    }
  }

  /**
   * CDK hides the dragged header mid-drag by stomping its inline `left` and
   * restores it to `''` before emitting `dropped`. Angular rewrites the
   * `[style.left.px]` host binding only when its value changes, so a rejected
   * (no-op) drop would leave a pinned header without its sticky offset — it
   * then scrolls away with the center columns. Re-apply it on every drop.
   */
  private restoreDraggedHeaderPinnedOffset(event: CdkDragDrop<string[]>): void {
    const draggedColumnId = typeof event.item.data === 'string' ? event.item.data : null;

    if (!draggedColumnId) return;

    const headerElement = this.getHeaderElement(draggedColumnId);
    const left = readColumnEntry(this.state.columnRenderStates(), draggedColumnId)?.left ?? null;

    if (headerElement && left !== null) {
      headerElement.style.left = `${left}px`;
    }
  }

  /**
   * Resolves the moving column's next in-zone order at drop time.
   *
   * CDK's `event.currentIndex` comes from live clientRects, which the sticky
   * pinned headers skew under horizontal scroll — wrongly rejecting valid
   * in-zone drops (issue #288). So prefer the drop point: slot the moving column
   * among its same-zone neighbors by their header centers. Fall back to
   * `currentIndex` when no geometry is available (jsdom / synthetic unit-test
   * events with no drop point). Returns `null` to reject the drop.
   */
  private resolveDropZoneOrder(
    event: CdkDragDrop<string[]>,
    rowColumnIds: readonly string[],
    zone: ColumnReorderZone,
    movingColumnId: string
  ): string[] | null {
    const neighborIds = rowColumnIds.filter((id) => id !== movingColumnId && this.state.getColumnZoneById(id) === zone);
    // CDK types `dropPoint` as always-present, but synthetic unit-test events omit it.
    const dropX = (event as { readonly dropPoint?: { readonly x: number } }).dropPoint?.x;

    if (typeof dropX === 'number' && Number.isFinite(dropX)) {
      const centers = neighborIds.map((id) => this.getHeaderCenterX(id));

      // Use geometry whenever the layout is real (at least one neighbor has a
      // laid-out rect). Only pure jsdom, where every center is null, falls
      // through to the CDK index path — a degenerate rect in a real browser
      // must not re-trigger the scroll-skew bug (#288).
      if (!centers.every((center) => center === null)) {
        const rightOfDrop = centers.findIndex((center) => center !== null && dropX < center);
        const nextOrder = [...neighborIds];

        nextOrder.splice(rightOfDrop === -1 ? neighborIds.length : rightOfDrop, 0, movingColumnId);

        return nextOrder;
      }
    }

    if (!this.state.isDropIndexWithinZone(rowColumnIds, zone, event.currentIndex)) {
      return null;
    }

    return moveItemInArrayCopy(rowColumnIds, event.previousIndex, event.currentIndex).filter(
      (id) => this.state.getColumnZoneById(id) === zone
    );
  }

  /** Viewport-x center of a column's header cell, or `null` when it has no laid-out rect (jsdom). */
  private getHeaderCenterX(columnId: string): number | null {
    const rect = this.getHeaderElement(columnId)?.getBoundingClientRect();

    return rect && rect.width > 0 ? rect.left + rect.width / 2 : null;
  }

  // ─── Keyboard reorder ───

  /**
   * Handles the keyboard reorder portion of a header keydown.
   * Returns `true` if the event was handled (reorder occurred), `false` otherwise.
   */
  public handleKeyboardReorder(
    event: KeyboardEvent,
    column: Column<TData, unknown>,
    directionDelta: ColumnReorderKeyboardDirection
  ): boolean {
    if (!isColumnReorderable(column, this.isReorderingEnabled())) return false;

    const zone = getColumnZone(column);
    const visibleZoneColumnIds = this.state.getVisibleZoneColumnIds(zone);
    const currentIndex = visibleZoneColumnIds.indexOf(column.id);

    if (currentIndex === -1 || visibleZoneColumnIds.length < 2) return false;

    event.preventDefault();
    event.stopPropagation();

    const result = this.state.moveColumnByDelta(column.id, directionDelta);

    if (result) {
      this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
    }

    this.scrollHeaderIntoView(column.id);

    return true;
  }

  // ─── Scroll into view ───

  /**
   * Scroll a column header into view after reordering.
   */
  public scrollHeaderIntoView(columnId: string): void {
    afterNextRender(
      {
        write: () => {
          const scrollContainer = this.state.tableRegionRef()?.nativeElement ?? null;
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
    const tableRegion = this.state.tableRegionRef()?.nativeElement;

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
}
