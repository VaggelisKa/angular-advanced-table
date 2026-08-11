import { CdkVirtualScrollableElement } from '@angular/cdk/scrolling';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';

import type { NatTableRegionScrollableHandle } from '../common/virtual-scroll-internals.type';

/**
 * Adapts the table's existing scroll region into the CDK virtual-scroll
 * `VIRTUAL_SCROLLABLE` contract.
 *
 * `CdkVirtualScrollableElement` is exactly the right behavior — audited
 * scroll events, viewport measurement, and `scrollTo` on an arbitrary
 * element — but it is written to be applied declaratively in a template,
 * which is impossible here: the region `<div>` lives inside `NatTable`'s own
 * template. So the class is instantiated against a synthetic `ElementRef` of
 * the region, and the lifecycle Angular would normally drive is invoked
 * explicitly. Only public CDK API is touched.
 *
 * The caller owns teardown: invoke the returned `destroy` when the directive
 * that created it goes away.
 */
export function createTableRegionScrollable(region: HTMLElement, parentInjector: Injector): NatTableRegionScrollableHandle {
  const injector = Injector.create({
    providers: [{ provide: ElementRef, useValue: new ElementRef(region) }],
    parent: parentInjector
  });

  const scrollable = runInInjectionContext(injector, () => new CdkVirtualScrollableElement());

  scrollable.ngOnInit();

  return { scrollable, destroy: () => scrollable.ngOnDestroy() };
}
