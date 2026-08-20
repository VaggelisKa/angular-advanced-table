import { DestroyRef, Injectable, NgZone, effect, inject, signal, untracked } from '@angular/core';
import type { Signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost } from 'ng-advanced-table';

import { NatTableVirtualLayoutService } from './table-virtual-layout.service';
import type { NatTableVirtualRange, NatTableVirtualizationOptions } from '../common/table-virtualization.type';
import { computeNatTableRowWindow } from '../utils/row-window.util';
import { resolveNatTableScrollTarget } from '../utils/scroll-target.util';
import {
  NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT,
  createInitialVirtualRange,
  opensSubHeaderGroup
} from '../utils/table-virtualization.util';

/**
 * Drives the mounted row window from the table region's scroll state, using
 * the library's own overscan windowing algorithm over the existing scroll
 * container.
 *
 * A dedicated virtual-scroll viewport element is deliberately not introduced:
 * a content-wrapper `translateY` offset would put the sticky `<thead>` and
 * sticky pinned cells inside a per-frame-transformed ancestor — the exact
 * geometry native table spacer rows avoid. Scroll events are observed with one
 * passive listener registered outside the Angular zone and coalesced to
 * animation frames, so windowing work never outruns paint.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualScrollEngine<TData extends RowData = RowData> {
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private readonly layout = inject<NatTableVirtualLayoutService<TData>>(NatTableVirtualLayoutService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private options: Signal<Required<NatTableVirtualizationOptions>> | null = null;
  /** Logical rows the window spans — the remote total under remote windowing, else the row model. */
  private logicalRowCount: Signal<number> | null = null;
  private observedRegion: HTMLElement | null = null;
  private scrollFrame: number | null = null;

  private readonly mountedRange = signal<NatTableVirtualRange>({ start: 0, end: NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT });

  /** The mounted half-open row-index window. May exceed a shrunken row model until the next update. */
  public readonly range = this.mountedRange.asReadonly();

  public constructor() {
    this.destroyRef.onDestroy(() => this.detachScrollListener());
  }

  /** Wires the engine to the normalized directive options and logical row count and starts tracking. */
  public connect(options: Signal<Required<NatTableVirtualizationOptions>>, logicalRowCount: Signal<number>): void {
    this.options = options;
    this.logicalRowCount = logicalRowCount;
    this.registerRegionAttachmentEffect();
    this.registerRangeUpdateEffect();
  }

  /** Re-measures layout and recomputes the window in one imperative step. */
  public measure(): void {
    this.layout.measure();
    this.updateRange();
  }

  public scrollToIndex(index: number, align: 'start' | 'end' | 'auto'): void {
    const region = this.state.tableRegionRef()?.nativeElement;
    const options = this.options;

    if (!region || !options) {
      return;
    }

    const rowHeight = untracked(options).rowHeight;
    const subHeaderOffsets = untracked(this.state.subHeaderRowOffsets);
    // A group-opening row travels with the sub-header row above it: target the
    // two-slot block so 'start' reveals the sub-header, not just the data row.
    const opensGroup = opensSubHeaderGroup(subHeaderOffsets, index);
    const slot = index + (subHeaderOffsets[index] ?? 0) - (opensGroup ? 1 : 0);
    const target = resolveNatTableScrollTarget({
      align,
      scrollTop: region.scrollTop,
      rowTop: untracked(this.layout.bodyOffset) + slot * rowHeight,
      rowHeight: (opensGroup ? 2 : 1) * rowHeight,
      stickyOverlayHeight: untracked(this.state.stickyHeader) ? untracked(this.layout.stickyOverlayHeight) : 0,
      viewportHeight: untracked(this.layout.viewportHeight)
    });

    if (target !== null) {
      // scrollTop assignment instead of scrollTo(): identical instant-scroll
      // semantics in browsers, but also safe on server DOMs that implement no
      // scrolling API.
      region.scrollTop = target;
      this.updateRange();
    }
  }

  public scrollToOffset(offset: number): void {
    const region = this.state.tableRegionRef()?.nativeElement;

    if (!region) {
      return;
    }

    region.scrollTop = Math.max(0, offset);
    this.updateRange();
  }

  private registerRegionAttachmentEffect(): void {
    effect(() => {
      const region = this.state.tableRegionRef()?.nativeElement ?? null;

      untracked(() => this.attachScrollListener(region));
    });
  }

  private registerRangeUpdateEffect(): void {
    effect(() => {
      // Everything that moves the window besides raw scrolling: the logical
      // extent (which tracks the row model outside remote windowing), the
      // sub-header slots, the measured geometry, and the directive options.
      this.logicalRowCount?.();
      this.state.subHeaderRowOffsets();
      this.layout.viewportHeight();
      this.layout.bodyOffset();
      this.options?.();

      untracked(() => this.updateRange());
    });
  }

  private attachScrollListener(region: HTMLElement | null): void {
    if (region === this.observedRegion) {
      return;
    }

    this.detachScrollListener();
    this.observedRegion = region;

    if (!region) {
      return;
    }

    this.ngZone.runOutsideAngular(() => region.addEventListener('scroll', this.onScroll, { passive: true }));
  }

  private detachScrollListener(): void {
    this.observedRegion?.removeEventListener('scroll', this.onScroll);
    this.observedRegion = null;

    if (this.scrollFrame !== null) {
      cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = null;
    }
  }

  private readonly onScroll = (): void => {
    if (this.scrollFrame !== null) {
      return;
    }

    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = null;
      this.updateRange();
    });
  };

  private updateRange(): void {
    const options = this.options;
    const region = this.state.tableRegionRef()?.nativeElement;

    if (!options || !region) {
      return;
    }

    const { rowHeight, overscan } = untracked(options);
    const rowCount = this.logicalRowCount === null ? untracked(this.state.bodyRows).length : untracked(this.logicalRowCount);
    const viewportSize = untracked(this.layout.viewportHeight);

    // Unmeasured region (first paint, SSR): keep the initial mount instead of
    // collapsing the window to nothing.
    const next =
      viewportSize <= 0
        ? createInitialVirtualRange(rowCount)
        : computeNatTableRowWindow({
            scrollOffset: Math.max(0, region.scrollTop - untracked(this.layout.bodyOffset)),
            viewportSize,
            rowHeight,
            rowCount,
            currentRange: untracked(this.mountedRange),
            overscan,
            subHeaderOffsets: untracked(this.state.subHeaderRowOffsets)
          });
    const current = untracked(this.mountedRange);

    if (next.start !== current.start || next.end !== current.end) {
      this.mountedRange.set(next);
    }
  }
}
