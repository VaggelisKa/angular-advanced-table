import type { ElementRef } from '@angular/core';
import { Component, DestroyRef, Injector, afterNextRender, inject, signal, viewChildren } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

import { COLUMNS, DEMO_DATA } from './sticky-header-showcase.data';

type NativeProxyDragState = {
  frame: HTMLElement;
  mode: 'horizontal' | 'pending' | 'vertical';
  pointerId: number;
  scroller: HTMLElement;
  startScrollLeft: number;
  startX: number;
  startY: number;
};

@Component({
  selector: 'app-sticky-header-showcase',
  imports: [NatTable, NatTableSurface],
  templateUrl: './sticky-header-showcase.html',
  styleUrl: './sticky-header-showcase.css'
})
export class StickyHeaderShowcasePage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly nativeProxyFrames = viewChildren<ElementRef<HTMLElement>>('nativeProxyFrame');
  private nativeProxyDragState: NativeProxyDragState | null = null;

  protected readonly data = DEMO_DATA;
  protected readonly columns = COLUMNS;
  protected readonly stickyHeaderEnabled = signal(true);
  protected readonly tableIds = [1, 2, 3];

  public constructor() {
    afterNextRender(
      () => {
        const refresh = (): void => this.refreshNativeProxyScrollers();

        refresh();
        globalThis.requestAnimationFrame(refresh);
        globalThis.addEventListener('resize', refresh, { passive: true });
        this.destroyRef.onDestroy(() => globalThis.removeEventListener('resize', refresh));
      },
      { injector: this.injector }
    );
  }

  protected toggleStickyHeader(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.stickyHeaderEnabled.set(target.checked);
    }
  }

  protected refreshNativeProxyScroll(event: Event): void {
    const frame = this.resolveNativeProxyFrame(event);

    if (frame) {
      this.syncNativeProxyFrame(frame);
    }
  }

  protected syncNativeProxyScroll(event: Event): void {
    const frame = this.resolveNativeProxyFrame(event);

    if (frame) {
      this.syncNativeProxyFrame(frame);
    }
  }

  protected startNativeProxyDrag(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const frame = this.resolveNativeProxyFrame(event);

    if (!frame) {
      return;
    }

    this.syncNativeProxyFrame(frame);

    const scroller = this.getNativeProxyScroller(frame);

    if (!scroller) {
      return;
    }

    this.nativeProxyDragState = {
      frame,
      mode: 'pending',
      pointerId: event.pointerId,
      scroller,
      startScrollLeft: scroller.scrollLeft,
      startX: event.clientX,
      startY: event.clientY
    };
  }

  protected moveNativeProxyDrag(event: PointerEvent): void {
    const state = this.nativeProxyDragState;

    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (state.mode === 'pending') {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX < 6 && absY < 6) {
        return;
      }

      state.mode = absX > absY ? 'horizontal' : 'vertical';

      if (state.mode === 'horizontal') {
        this.captureNativeProxyPointer(state.frame, event.pointerId);
      }
    }

    if (state.mode === 'vertical') {
      return;
    }

    event.preventDefault();
    state.scroller.scrollLeft = state.startScrollLeft - deltaX;
    this.syncNativeProxyFrame(state.frame);
  }

  protected endNativeProxyDrag(event: PointerEvent): void {
    const state = this.nativeProxyDragState;

    if (!state || event.pointerId !== state.pointerId) {
      return;
    }

    this.releaseNativeProxyPointer(state.frame, event.pointerId);

    this.nativeProxyDragState = null;
  }

  protected scrollNativeProxyWheel(event: WheelEvent): void {
    const frame = this.resolveNativeProxyFrame(event);

    if (!frame) {
      return;
    }

    const scroller = this.getNativeProxyScroller(frame);

    if (!scroller) {
      return;
    }

    const delta = event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;

    if (Math.abs(delta) < 0.5) {
      return;
    }

    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const nextScrollLeft = Math.min(Math.max(0, scroller.scrollLeft + delta), maxScrollLeft);

    if (maxScrollLeft > 0) {
      event.preventDefault();
    }

    if (nextScrollLeft === scroller.scrollLeft) {
      return;
    }

    scroller.scrollLeft = nextScrollLeft;
    this.syncNativeProxyFrame(frame);
  }

  private refreshNativeProxyScrollers(): void {
    for (const frame of this.nativeProxyFrames()) {
      this.syncNativeProxyFrame(frame.nativeElement);
    }
  }

  private resolveNativeProxyFrame(event: Event): HTMLElement | null {
    const target = event.currentTarget;

    return target instanceof HTMLElement ? target.closest<HTMLElement>('[data-native-proxy-frame]') : null;
  }

  private getNativeProxyScroller(frame: HTMLElement): HTMLElement | null {
    return frame.querySelector<HTMLElement>('.native-proxy-scrollbar');
  }

  private captureNativeProxyPointer(frame: HTMLElement, pointerId: number): void {
    try {
      if (!frame.hasPointerCapture(pointerId)) {
        frame.setPointerCapture(pointerId);
      }
    } catch {
      // Pointer capture can fail if the browser has already claimed the gesture.
    }
  }

  private releaseNativeProxyPointer(frame: HTMLElement, pointerId: number): void {
    try {
      if (frame.hasPointerCapture(pointerId)) {
        frame.releasePointerCapture(pointerId);
      }
    } catch {
      // Ignore stale pointer IDs after cancellation.
    }
  }

  private syncNativeProxyFrame(frame: HTMLElement): void {
    const table = frame.querySelector<HTMLElement>('.sticky-strategy-native-proxy .data-table');
    const scroller = this.getNativeProxyScroller(frame);
    const track = frame.querySelector<HTMLElement>('.native-proxy-scrollbar-track');

    if (!table || !scroller || !track) {
      return;
    }

    const frameWidth = Math.ceil(frame.getBoundingClientRect().width);
    const tableWidth = Math.ceil(
      Math.max(table.scrollWidth, table.offsetWidth, table.getBoundingClientRect().width)
    );
    const scrollWidth = Math.max(frameWidth, tableWidth);
    const maxScrollLeft = Math.max(0, scrollWidth - scroller.clientWidth);

    track.style.inlineSize = `${scrollWidth}px`;

    if (scroller.scrollLeft > maxScrollLeft) {
      scroller.scrollLeft = maxScrollLeft;
    }

    table.style.setProperty('--nat-showcase-proxy-scroll-x', `${-scroller.scrollLeft}px`);
  }
}
