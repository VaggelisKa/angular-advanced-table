import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  ElementRef,
  Injectable,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  afterRenderEffect,
  inject,
  signal
} from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost } from 'ng-advanced-table';

import { queryOwnedNatTableElements } from '../utils/table-ownership.util';

type VirtualLayoutMeasurements = {
  readonly bodyOffset: number;
  readonly stickyOverlayHeight: number;
  readonly viewportHeight: number;
};

/** Measures native table offsets and the scrollport needed by the windowing engine. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualLayoutService<TData extends RowData = RowData> {
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private resizeObserver: ResizeObserver | null = null;
  private observedCaption: Element | null = null;
  private viewportFrame: number | null = null;

  /** Distance from the region's scroll origin to the top of `<tbody>`, in CSS pixels. */
  public readonly bodyOffset = signal(0);
  /** Height of the sticky header overlay covering the top of the scrollport. */
  public readonly stickyOverlayHeight = signal(0);
  /** Client height of the scrollable table region. */
  public readonly viewportHeight = signal(0);

  public constructor() {
    afterRenderEffect({
      earlyRead: () => {
        this.state.resolvedCaption();
        // A primitive on purpose: the header-group array changes identity on
        // unrelated state changes, and size-only changes are covered by the
        // ResizeObserver.
        this.state.headerRowCount();
        this.state.stickyHeader();

        return this.readMeasurements();
      },
      write: (measurements) => {
        this.syncCaptionObservation();
        this.applyMeasurements(measurements());
      }
    });

    afterNextRender(() => {
      this.observeLayout();
      this.observeViewport();
    });

    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

  /**
   * Imperative re-measure for window resets that must not wait a render.
   * Unlike the render-effect path this can run during server rendering, where
   * the DOM implements no layout — so it must bail outside the browser.
   */
  public measure(): void {
    if (!this.isBrowser) {
      return;
    }

    this.applyMeasurements(this.readMeasurements());
  }

  /**
   * Window resizes and orientation changes may move the region without
   * resizing it, which the region-scoped ResizeObserver cannot see. Both
   * events are observed passively outside the Angular zone and coalesced to
   * one re-measure per animation frame. Runs from `afterNextRender`, so the
   * cleanup it registers only ever exists where `window` does.
   */
  private observeViewport(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onViewportChange, { passive: true });
      window.addEventListener('orientationchange', this.onViewportChange, { passive: true });
    });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.onViewportChange);
      window.removeEventListener('orientationchange', this.onViewportChange);

      if (this.viewportFrame !== null) {
        cancelAnimationFrame(this.viewportFrame);
        this.viewportFrame = null;
      }
    });
  }

  private readonly onViewportChange = (): void => {
    if (this.viewportFrame !== null) {
      return;
    }

    this.viewportFrame = requestAnimationFrame(() => {
      this.viewportFrame = null;
      this.measure();
    });
  };

  private observeLayout(): void {
    const region = this.state.tableRegionRef()?.nativeElement;
    const table = region?.querySelector('table');
    const header = table?.querySelector('thead');

    if (!region || !table || !header || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.measure());
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
    // Ownership-scoped, unlike the measurements below: those read elements
    // this table always renders, so its own come first in document order. A
    // caption sits behind `@if`, so an absent one would resolve to a nested
    // table's — a node that mounts and unmounts as rows scroll.
    const caption = queryOwnedNatTableElements(this.elementRef.nativeElement, 'table caption').at(0) ?? null;

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
      stickyOverlayHeight: Math.max(0, headerRect.height + stickyTop),
      viewportHeight: region.clientHeight
    };
  }

  private applyMeasurements(measurements: VirtualLayoutMeasurements | null): void {
    if (measurements) {
      this.bodyOffset.set(measurements.bodyOffset);
      this.stickyOverlayHeight.set(measurements.stickyOverlayHeight);
      this.viewportHeight.set(measurements.viewportHeight);
    }
  }
}
