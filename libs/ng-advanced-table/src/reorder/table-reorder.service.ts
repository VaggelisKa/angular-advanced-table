import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable, Injector, afterNextRender, inject } from '@angular/core';

import type { Column, HeaderGroup, RowData } from '@tanstack/angular-table';

import type { ColumnReorderKeyboardDirection } from '../common/column-render.type';
import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableState } from '../domain-logic/table.state';
import { getHeaderRowColumnIds } from '../utils/column-label.util';
import { getColumnZone, moveItemInArrayCopy } from '../utils/column-order.util';
import { resolveDraggedColumnId, scrollElementHorizontallyIntoView } from '../utils/interaction.util';

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

  public canReorderHeader(column: Column<TData, unknown>): boolean {
    return this.state.getVisibleZoneColumnIds(getColumnZone(column)).length > 1;
  }

  // ─── Drag-drop reorder ───

  public onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void {
    if (!this.isLeafHeaderRow(headerGroup) || event.previousIndex === event.currentIndex) {
      return;
    }

    const rowColumnIds = getHeaderRowColumnIds<TData>(headerGroup);
    const movingColumnId = resolveDraggedColumnId(event, rowColumnIds);

    if (!movingColumnId) {
      return;
    }

    const zone = this.state.getColumnZoneById(movingColumnId);

    if (!zone || !this.state.isDropIndexWithinZone(rowColumnIds, zone, event.currentIndex)) {
      return;
    }

    const reorderedRowColumnIds = moveItemInArrayCopy(rowColumnIds, event.previousIndex, event.currentIndex);
    const nextVisibleZoneOrder = reorderedRowColumnIds.filter((columnId) => this.state.getColumnZoneById(columnId) === zone);

    const result = this.state.applyVisibleZoneReorder(zone, movingColumnId, nextVisibleZoneOrder);

    if (result) {
      this.a11yService.announceColumnReorder(result.movingColumnId, result.zone, result.nextVisibleZoneOrder);
    }

    this.scrollHeaderIntoView(movingColumnId);
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
