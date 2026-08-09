import { DestroyRef, Injectable, afterNextRender, afterRenderEffect, computed, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost } from 'ng-advanced-table';

type VirtualLayoutMeasurements = {
  readonly bodyOffset: number;
  readonly stickyOverlayHeight: number;
};

/** Measures native table offsets needed by the headless virtualizer. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualLayoutService<TData extends RowData = RowData> {
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private readonly destroyRef = inject(DestroyRef);
  private resizeObserver: ResizeObserver | null = null;
  private observedCaption: Element | null = null;

  public readonly bodyOffset = signal(0);
  public readonly stickyOverlayHeight = signal(0);

  /**
   * Structural re-measure trigger. Deliberately a primitive: depending on the
   * `headerGroups()` array would re-run the measurement on every unrelated
   * state change (selection, column sizing), because TanStack hands out a new
   * array identity. Size-only changes are covered by the ResizeObserver.
   */
  private readonly headerRowCount = computed(() => this.state.headerGroups().length);

  public constructor() {
    afterRenderEffect({
      earlyRead: () => {
        this.state.resolvedCaption();
        this.headerRowCount();

        return this.readMeasurements();
      },
      write: (measurements) => {
        this.syncCaptionObservation();
        this.applyMeasurements(measurements());
      }
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
    this.syncCaptionObservation();
  }

  /**
   * The caption lives under `@if`, so toggling it replaces the node and would
   * leave the observer watching a detached element. The render effect above
   * re-runs on `resolvedCaption()` changes and re-targets the observer here.
   */
  private syncCaptionObservation(): void {
    const caption = this.state.tableRegionRef()?.nativeElement.querySelector('table caption') ?? null;

    if (!this.resizeObserver || caption === this.observedCaption) {
      return;
    }

    if (this.observedCaption) {
      this.resizeObserver.unobserve(this.observedCaption);
    }

    if (caption) {
      this.resizeObserver.observe(caption);
    }

    this.observedCaption = caption;
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
