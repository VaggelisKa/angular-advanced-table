import type { Signal } from '@angular/core';
import { DestroyRef, ElementRef, Injectable, afterNextRender, afterRenderEffect, inject, isDevMode, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost, NatTableVirtualItem } from 'ng-advanced-table';

import { NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT } from '../utils/table-virtualization.util';

/** Body row kinds the fixed-height contract covers, with the label used in the warning. */
const ROW_KINDS = [
  ['tr.data-row', 'data'],
  ['tr.sub-header-row', 'sub-header']
] as const;

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
  /** Logical rows the window spans — the remote total under remote windowing, else the row model. */
  private logicalRowCount: Signal<number> | null = null;

  public constructor() {
    // Not development-only: an unbounded region makes the window converge on
    // every row, and it is the failure most likely to surface only in
    // production. Two property reads behind a once-per-table latch.
    this.registerBoundedRegionValidationEffect();

    // The rest are development diagnostics: production builds register nothing,
    // so the scroll hot path never pays for the render-effect wakeups or the
    // per-window DOM measurements they perform.
    if (!isDevMode()) {
      return;
    }

    afterNextRender(() => this.observeRegionSize());
    this.registerRowHeightValidationEffect();
    this.destroyRef.onDestroy(() => this.regionResizeObserver?.disconnect());
  }

  public connect(rowHeight: Signal<number>, items: Signal<readonly NatTableVirtualItem[]>, logicalRowCount: Signal<number>): void {
    this.rowHeight = rowHeight;
    this.items = items;
    this.logicalRowCount = logicalRowCount;
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
        // The logical extent, not the loaded rows: under remote windowing an
        // unbounded region converges the window on the whole remote range —
        // exactly when this warning matters most — while the loaded window can
        // sit at or below the bootstrap count (even empty) and would suppress
        // it. Before `connect`, fall back to the row model.
        const rowCount = this.logicalRowCount === null ? this.state.bodyRows().length : this.logicalRowCount();
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
          '[ng-advanced-table] natTableVirtualize needs a bounded region; set --nat-table-height or --nat-table-max-height.'
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
    // Latched per row kind: one latch would report a data-row mismatch, get
    // fixed, then hide a sub-header one for the session. Only the first mounted
    // row of each kind is measured — this runs on every window move.
    const warnedKinds = new Set<string>();

    afterRenderEffect({
      earlyRead: () => {
        const expectedHeight = this.rowHeight?.() ?? 0;

        this.items?.();

        for (const [selector, label] of ROW_KINDS) {
          if (warnedKinds.has(label)) {
            continue;
          }

          const actualHeight = this.elementRef.nativeElement.querySelector(selector)?.getBoundingClientRect().height ?? 0;

          if (actualHeight > 0 && Math.abs(actualHeight - expectedHeight) > 1) {
            return { label, actualHeight, expectedHeight };
          }
        }

        return null;
      },
      write: (mismatchSignal) => {
        const mismatch = mismatchSignal();

        if (!mismatch || warnedKinds.has(mismatch.label)) {
          return;
        }

        warnedKinds.add(mismatch.label);
        console.warn(
          `[ng-advanced-table] natTableVirtualize expected ${mismatch.expectedHeight}px rows but measured ` +
            `${mismatch.actualHeight}px on a ${mismatch.label} row.`
        );
      }
    });
  }
}
