import { DestroyRef, Injectable, afterNextRender, afterRenderEffect, inject } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableState } from './table.state';
import { hasSameWidths } from '../utils/table-utils';

/**
 * Per-table service that manages header-cell ResizeObserver lifecycle and
 * viewport-width measurement. Writes measured widths back to the store
 * so the authoritative column-width layout stays in sync.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance service, provided by NatTable (providers: [...]), not root.
@Injectable()
export class NatTableHeaderMeasurementService<TData extends RowData = RowData> {
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly destroyRef = inject(DestroyRef);

  private headerResizeObserver: ResizeObserver | null = null;

  public constructor() {
    this.destroyRef.onDestroy(() => this.headerResizeObserver?.disconnect());

    afterNextRender(() => this.initializeHeaderObservation());

    afterRenderEffect(() => {
      this.state.visibleColumnIds();
      this.reattachHeaderObservers();
    });
  }

  // ─── ResizeObserver lifecycle ───

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
    const region = this.state.tableRegionRef()?.nativeElement;

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
    const region = this.state.tableRegionRef()?.nativeElement;

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

    if (hasSameWidths(this.state.measuredHeaderWidths(), next)) {
      return;
    }

    this.state.measuredHeaderWidths.set(next);
  }

  private measureRegionViewportWidth(): void {
    const region = this.state.tableRegionRef()?.nativeElement;

    if (!region) {
      return;
    }

    const width = region.clientWidth;

    if (width > 0 && width !== this.state.regionViewportWidth()) {
      this.state.regionViewportWidth.set(width);
    }
  }
}
