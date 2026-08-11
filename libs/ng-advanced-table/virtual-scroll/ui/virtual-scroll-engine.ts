import { CdkVirtualScrollViewport, VIRTUAL_SCROLLABLE } from '@angular/cdk/scrolling';
import { Component, DestroyRef, afterNextRender, inject, viewChild } from '@angular/core';

/**
 * Headless host for the CDK virtual-scroll engine.
 *
 * The real `CdkVirtualScrollViewport` runs here with the table's scroll
 * region provided as its `VIRTUAL_SCROLLABLE`, so CDK owns scroll auditing,
 * range calculation (via the provided `VIRTUAL_SCROLL_STRATEGY`), data-length
 * tracking, and `scrollToIndex` — while rendering nothing itself.
 *
 * The viewport element cannot wrap the `<table>`: CDK offsets rendered
 * content with a `translateY` on its content wrapper, and a transformed
 * ancestor dislocates the sticky `<thead>`. Instead the component sits
 * zero-height, in flow, at the top of the region's scrolled content — which
 * makes `measureViewportOffset()` zero, so the viewport's scroll offset is
 * exactly the region's `scrollTop`, which under a sticky header is exactly
 * the row-space offset (the header's height cancels against the rows
 * starting below it). The table renders the spacer geometry through the core
 * row-window contract; the viewport's internal spacer stays clipped and
 * inert.
 *
 * The one CDK gap covered here: `checkViewportSize` only re-runs on window
 * resize, so a `ResizeObserver` on the region keeps the engine honest when
 * the container resizes without the window.
 */
@Component({
  selector: 'nat-table-virtual-scroll-engine',
  template: '<cdk-virtual-scroll-viewport />',
  styles: `
    :host {
      display: block;
      height: 0;
    }

    cdk-virtual-scroll-viewport {
      display: block;
      height: 0;
      overflow: hidden;
    }
  `,
  imports: [CdkVirtualScrollViewport],
  host: { 'aria-hidden': 'true', 'data-testid': 'nat-table-virtual-scroll-engine' }
})
export class NatTableVirtualScrollEngine {
  public readonly viewport = viewChild.required(CdkVirtualScrollViewport);

  private readonly scrollable = inject(VIRTUAL_SCROLLABLE);
  private readonly destroyRef = inject(DestroyRef);

  public constructor() {
    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const observer = new ResizeObserver(() => this.viewport().checkViewportSize());

      observer.observe(this.scrollable.getElementRef().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
