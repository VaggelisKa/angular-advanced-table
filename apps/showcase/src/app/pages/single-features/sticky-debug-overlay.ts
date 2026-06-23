import { Component, DestroyRef, NgZone, ViewEncapsulation, afterNextRender, inject } from '@angular/core';

import { collectStickyMetrics, formatStickyMetrics } from './sticky-debug-metrics';
import type { StickyMetrics } from './sticky-debug-metrics';

/**
 * Diagnostic-only overlay (enabled via `?stickydebug=1`) that appends a fixed
 * readout to `document.body` to escape any transformed showcase ancestor that
 * breaks `position: fixed`. Showcase-only; never ship in the library.
 */
@Component({
  selector: 'app-sticky-debug-overlay',
  template: '',
  styleUrl: './sticky-debug-overlay.css',
  encapsulation: ViewEncapsulation.None
})
export class StickyDebugOverlay {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  public constructor() {
    afterNextRender(() => {
      if (typeof location === 'undefined' || !new URLSearchParams(location.search).has('stickydebug')) {
        return;
      }

      this.ngZone.runOutsideAngular(() => this.mount());
    });
  }

  private mount(): void {
    const container = document.createElement('div');

    container.className = 'sticky-debug';
    container.dataset['testid'] = 'sticky-debug-overlay';

    const readout = document.createElement('pre');

    readout.className = 'sticky-debug__readout';
    readout.textContent = 'starting…';

    const resetButton = document.createElement('button');

    resetButton.type = 'button';
    resetButton.className = 'sticky-debug__reset';
    resetButton.textContent = 'reset peak';

    container.append(readout, resetButton);
    document.body.appendChild(container);

    let peak: StickyMetrics | null = null;
    const reset = (): void => {
      peak = null;
    };

    resetButton.addEventListener('click', reset);

    let rafId = 0;
    const tick = (): void => {
      const metrics = collectStickyMetrics();

      if (Number.isFinite(metrics.diff) && Math.abs(metrics.diff) > Math.abs(peak?.diff ?? 0)) {
        peak = metrics;
      }

      readout.textContent = formatStickyMetrics(metrics, peak);
      rafId = window.requestAnimationFrame(tick);
    };

    tick();

    this.destroyRef.onDestroy(() => {
      window.cancelAnimationFrame(rafId);
      resetButton.removeEventListener('click', reset);
      container.remove();
    });
  }
}
