import { DestroyRef, Injectable, afterNextRender, afterRenderEffect, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableState } from '../../domain-logic/table.state';

type VirtualLayoutMeasurements = {
  readonly bodyOffset: number;
  readonly stickyOverlayHeight: number;
};

/** Measures native table offsets needed by the headless virtualizer. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualLayoutService<TData extends RowData = RowData> {
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly destroyRef = inject(DestroyRef);
  private resizeObserver: ResizeObserver | null = null;

  public readonly bodyOffset = signal(0);
  public readonly stickyOverlayHeight = signal(0);

  public constructor() {
    afterRenderEffect({
      earlyRead: () => {
        this.state.resolvedCaption();
        this.state.headerGroups();

        return this.readMeasurements();
      },
      write: (measurements) => this.applyMeasurements(measurements())
    });

    afterNextRender(() => this.observeLayout());
    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

  private observeLayout(): void {
    const region = this.state.tableRegionRef()?.nativeElement;
    const table = region?.querySelector('table');
    const header = table?.querySelector('thead');

    if (!region || !table || !header || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.applyMeasurements(this.readMeasurements()));
    this.resizeObserver.observe(region);
    this.resizeObserver.observe(header);

    const caption = table.querySelector('caption');

    if (caption) {
      this.resizeObserver.observe(caption);
    }
  }

  private readMeasurements(): VirtualLayoutMeasurements | null {
    const region = this.state.tableRegionRef()?.nativeElement;
    const table = region?.querySelector('table');
    const body = table?.querySelector('tbody');
    const header = table?.querySelector('thead');

    if (!region || !body || !header) {
      return null;
    }

    const regionRect = region.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const firstHeaderCell = header.querySelector<HTMLElement>('th');
    const stickyTop = firstHeaderCell ? Number.parseFloat(getComputedStyle(firstHeaderCell).top) || 0 : 0;

    return {
      bodyOffset: Math.max(0, bodyRect.top - regionRect.top - region.clientTop + region.scrollTop),
      stickyOverlayHeight: Math.max(0, headerRect.height + stickyTop)
    };
  }

  private applyMeasurements(measurements: VirtualLayoutMeasurements | null): void {
    if (measurements) {
      this.bodyOffset.set(measurements.bodyOffset);
      this.stickyOverlayHeight.set(measurements.stickyOverlayHeight);
    }
  }
}
