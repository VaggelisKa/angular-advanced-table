import type { Signal } from '@angular/core';
import { DestroyRef, ElementRef, Injectable, afterNextRender, afterRenderEffect, inject, isDevMode, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost, NatTableVirtualItem } from 'ng-advanced-table';

import { NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT } from '../utils/table-virtualization.util';

/** Development diagnostics for the fixed-row virtualization contract. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualValidationService<TData extends RowData = RowData> {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private readonly destroyRef = inject(DestroyRef);
  private readonly regionResizeRevision = signal(0);
  private regionResizeObserver: ResizeObserver | null = null;
  private rowHeight: Signal<number> | null = null;
  private items: Signal<readonly NatTableVirtualItem[]> | null = null;

  public constructor() {
    // Every check here is a development diagnostic. Production builds register
    // nothing, so the scroll hot path never pays for the render-effect wakeups
    // or the per-window DOM measurements they perform.
    if (!isDevMode()) {
      return;
    }

    afterNextRender(() => this.observeRegionSize());
    this.registerBoundedRegionValidationEffect();
    this.registerRowHeightValidationEffect();
    this.destroyRef.onDestroy(() => this.regionResizeObserver?.disconnect());
  }

  public connect(rowHeight: Signal<number>, items: Signal<readonly NatTableVirtualItem[]>): void {
    this.rowHeight = rowHeight;
    this.items = items;
  }

  private observeRegionSize(): void {
    const region = this.state.tableRegionRef()?.nativeElement;

    if (!region || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.regionResizeObserver = new ResizeObserver(() => this.regionResizeRevision.update((revision) => revision + 1));
    this.regionResizeObserver.observe(region);
  }

  private registerBoundedRegionValidationEffect(): void {
    let hasWarned = false;

    afterRenderEffect({
      earlyRead: () => {
        const rowCount = this.state.bodyRows().length;
        const region = this.state.tableRegionRef()?.nativeElement;

        this.regionResizeRevision();

        return region ? { clientHeight: region.clientHeight, rowCount, scrollHeight: region.scrollHeight } : null;
      },
      write: (measurementsSignal) => {
        const measurements = measurementsSignal();

        if (
          hasWarned ||
          !measurements ||
          measurements.clientHeight <= 0 ||
          measurements.scrollHeight > measurements.clientHeight + 1 ||
          measurements.rowCount <= NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT
        ) {
          return;
        }

        hasWarned = true;
        console.warn(
          '[ng-advanced-table] natTableVirtualize requires a bounded table region. Set `--nat-table-height` or `--nat-table-max-height`.'
        );
      }
    });
  }

  /**
   * The fixed-height contract covers every body `<tr>` the engine sizes: data
   * rows and sub-header rows alike, since both occupy one composite slot on
   * the fixed row grid.
   */
  private registerRowHeightValidationEffect(): void {
    let hasWarned = false;

    afterRenderEffect({
      earlyRead: () => {
        const expectedHeight = this.rowHeight?.() ?? 0;

        this.items?.();

        for (const selector of ['tr.data-row', 'tr.sub-header-row']) {
          const row = this.elementRef.nativeElement.querySelector<HTMLTableRowElement>(selector);
          const actualHeight = row?.getBoundingClientRect().height ?? 0;

          if (actualHeight > 0 && Math.abs(actualHeight - expectedHeight) > 1) {
            return { actualHeight, expectedHeight };
          }
        }

        return null;
      },
      write: (mismatchSignal) => {
        const mismatch = mismatchSignal();

        if (hasWarned || !mismatch) {
          return;
        }

        hasWarned = true;
        console.warn(
          `[ng-advanced-table] natTableVirtualize expected ${mismatch.expectedHeight}px rows but measured ${mismatch.actualHeight}px. ` +
            'Keep cell and sub-header content within the configured fixed row height.'
        );
      }
    });
  }
}
