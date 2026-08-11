import type { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLLABLE, VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Injector, createComponent } from '@angular/core';

import { createTableRegionScrollable } from './table-region-scrollable';
import { NatTableVirtualScrollEngine } from './virtual-scroll-engine';
import type { NatTableVirtualScrollEngineConfig, NatTableVirtualScrollEngineHandle } from '../common/virtual-scroll-internals.type';

/**
 * Boots the headless CDK engine inside the table's scroll region.
 *
 * Composes only public CDK and Angular APIs: a stock
 * `FixedSizeVirtualScrollStrategy`, the region adapted as the
 * `VIRTUAL_SCROLLABLE`, and a dynamically created
 * `NatTableVirtualScrollEngine` whose template hosts the real
 * `CdkVirtualScrollViewport`. The viewport's rendered-range stream is the
 * factory's one output; the returned handle scopes teardown and live option
 * updates to exactly what was created here.
 */
export function createVirtualScrollEngine(config: NatTableVirtualScrollEngineConfig): NatTableVirtualScrollEngineHandle {
  const { region, injector, environmentInjector, applicationRef, options, repeater, onRenderedRange } = config;
  const strategy = new FixedSizeVirtualScrollStrategy(options.rowHeight, options.minBufferPx, options.maxBufferPx);
  const scrollableHandle = createTableRegionScrollable(region, injector);
  const engineRef = createComponent(NatTableVirtualScrollEngine, {
    environmentInjector,
    elementInjector: Injector.create({
      providers: [
        { provide: VIRTUAL_SCROLL_STRATEGY, useValue: strategy },
        { provide: VIRTUAL_SCROLLABLE, useValue: scrollableHandle.scrollable }
      ],
      parent: injector
    })
  });

  // The engine must sit in flow at the top of the scrolled content so the
  // viewport's measured offset within the scrollable is zero.
  region.insertBefore(engineRef.location.nativeElement, region.firstChild);
  applicationRef.attachView(engineRef.hostView);
  engineRef.changeDetectorRef.detectChanges();

  const viewport = engineRef.instance.viewport();
  const rangeSubscription = viewport.renderedRangeStream.subscribe(onRenderedRange);

  viewport.attach(repeater);

  return {
    viewport: (): CdkVirtualScrollViewport => engineRef.instance.viewport(),
    syncOptions: (next): void => strategy.updateItemAndBufferSize(next.rowHeight, next.minBufferPx, next.maxBufferPx),
    destroy: (): void => {
      const engineElement = engineRef.location.nativeElement as HTMLElement;

      rangeSubscription.unsubscribe();
      engineRef.destroy();
      engineElement.remove();
      scrollableHandle.destroy();
    }
  };
}
