import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';

import { NatTable, NatTableService } from 'ng-advanced-table';
import type { ColumnDef } from 'ng-advanced-table';

import type { NatTableVirtualScrollOptions } from '../common/virtual-scroll-options.type';
import { NatTableVirtualScroll } from '../feature/table-virtual-scroll.directive';

export class FakeResizeObserver implements ResizeObserver {
  public static instances: FakeResizeObserver[] = [];

  public readonly observed: Element[] = [];

  public constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  public observe(element: Element): void {
    this.observed.push(element);
  }

  public unobserve(element: Element): void {
    this.observed.splice(this.observed.indexOf(element), 1);
  }

  public disconnect(): void {
    this.observed.length = 0;
  }

  public trigger(): void {
    this.callback([], this);
  }
}

export type VirtualRow = {
  readonly id: string;
  readonly name: string;
  readonly throughput: number;
};

export const buildVirtualRows = (count: number, idPrefix = 'row'): VirtualRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${idPrefix}-${index}`,
    name: `Service ${index}`,
    throughput: (index * 37) % 1000
  }));

export const virtualColumns: ColumnDef<VirtualRow, unknown>[] = [
  { accessorKey: 'name', header: 'Service', meta: { label: 'Service' } },
  { accessorKey: 'throughput', header: 'Throughput', meta: { label: 'Throughput' } }
];

/** Minimal stand-in for NatTableSurface: provides the sharing hub only. */
@Component({
  selector: 'test-virtual-scroll-surface',
  template: '<ng-content />',
  providers: [NatTableService]
})
export class TestVirtualScrollSurface {}

@Component({
  selector: 'test-virtual-scroll-host',
  imports: [NatTable, NatTableVirtualScroll, TestVirtualScrollSurface],
  template: `
    <test-virtual-scroll-surface>
      <nat-table [columns]="columns" [data]="rows()" [natTableVirtualScroll]="options()" accessibleName="Virtualized services" />
    </test-virtual-scroll-surface>
  `
})
export class VirtualScrollHost {
  public readonly rows = signal<VirtualRow[]>(buildVirtualRows(200));
  public readonly columns = virtualColumns;
  public readonly options = signal<NatTableVirtualScrollOptions>({ rowHeight: 40 });
}

@Component({
  selector: 'test-virtual-scroll-sub-header-host',
  imports: [NatTable, NatTableVirtualScroll, TestVirtualScrollSurface],
  template: `
    <test-virtual-scroll-surface>
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [natTableVirtualScroll]="{ rowHeight: 40 }"
        accessibleName="Virtualized services"
        emitRowRenderEvents
        subHeaderColumn="name" />
    </test-virtual-scroll-surface>
  `
})
export class VirtualScrollUnsupportedFeaturesHost {
  public readonly rows = signal<VirtualRow[]>(buildVirtualRows(10));
  public readonly columns = virtualColumns;
}

const fakeDomRect = (overrides: Partial<Omit<DOMRect, 'toJSON'>>): DOMRect => ({
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  toJSON: () => ({}),
  ...overrides
});

/** Makes the jsdom region measurable and scrollable for the CDK engine. */
export const prepareRegionGeometry = (region: HTMLElement, clientHeight: number): void => {
  Object.defineProperty(region, 'clientHeight', { value: clientHeight, configurable: true });

  let scrollTop = 0;

  Object.defineProperty(region, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = Math.max(0, value);
    }
  });

  // jsdom's Element.scrollTo is a layout-less stub; route it to the mocked
  // scrollTop so CdkScrollable.scrollTo behaves like a browser.
  region.scrollTo = ((options?: ScrollToOptions | number): void => {
    if (typeof options === 'object' && options.top !== undefined) {
      region.scrollTop = options.top;
    }
  }) as HTMLElement['scrollTo'];

  region.getBoundingClientRect = (): DOMRect => fakeDomRect({ bottom: clientHeight, height: clientHeight });
};

/**
 * jsdom rects are static zeros, so the headless viewport would appear to move
 * with the scroll offset instead of scrolling with the content. Pin its rect
 * to `-scrollTop` — where an in-flow element at the top of the scrolled
 * content really sits — so `measureViewportOffset()` stays zero like in a
 * browser.
 */
export const alignEngineGeometry = (region: HTMLElement): void => {
  const viewportElement = region.querySelector<HTMLElement>('cdk-virtual-scroll-viewport');

  if (!viewportElement) {
    throw new Error('Expected the headless CDK viewport to be mounted.');
  }

  viewportElement.getBoundingClientRect = (): DOMRect => fakeDomRect({ top: -region.scrollTop });
};

export const scrollRegionTo = (region: HTMLElement, scrollTop: number): void => {
  region.scrollTop = scrollTop;
  region.dispatchEvent(new Event('scroll'));
};

export const regionOf = (fixture: ComponentFixture<unknown>): HTMLElement => {
  const region = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="nat-table-region"]');

  if (!region) {
    throw new Error('Expected the nat-table region to be rendered.');
  }

  return region;
};
