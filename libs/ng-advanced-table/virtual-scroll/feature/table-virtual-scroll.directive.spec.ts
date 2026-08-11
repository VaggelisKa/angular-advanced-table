import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTable } from 'ng-advanced-table';

import { NatTableVirtualScroll } from './table-virtual-scroll.directive';
import {
  VirtualScrollHost,
  VirtualScrollUnsupportedFeaturesHost,
  alignEngineGeometry,
  buildVirtualRows,
  prepareRegionGeometry,
  regionOf,
  scrollRegionTo
} from '../test-helpers/virtual-scroll-hosts.helper';
import type { VirtualRow } from '../test-helpers/virtual-scroll-hosts.helper';

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

const dataRows = (fixture: ComponentFixture<unknown>): HTMLTableRowElement[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLTableRowElement>('tbody tr.data-row'));

const gapRows = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-testid="nat-table-virtual-row-gap"]'));

const firstAriaRowIndex = (fixture: ComponentFixture<unknown>): string | null =>
  dataRows(fixture)[0]?.getAttribute('aria-rowindex') ?? null;

const directiveOf = (fixture: ComponentFixture<unknown>): NatTableVirtualScroll<VirtualRow> =>
  fixture.debugElement
    .query(By.directive(NatTableVirtualScroll))
    .injector.get(NatTableVirtualScroll) as NatTableVirtualScroll<VirtualRow>;

const tableOf = (fixture: ComponentFixture<unknown>): NatTable<VirtualRow> =>
  fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<VirtualRow>;

const settle = async (fixture: ComponentFixture<unknown>): Promise<void> => {
  await fixture.whenStable();
  fixture.detectChanges();
};

class FakeResizeObserver implements ResizeObserver {
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

describe('FEATURE: NatTableVirtualScroll (CDK engine)', () => {
  let fixture: ComponentFixture<VirtualScrollHost>;
  let host: VirtualScrollHost;
  let region: HTMLElement;

  beforeEach(async () => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);

    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(VirtualScrollHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    region = regionOf(fixture);
    prepareRegionGeometry(region, 400);
    await settle(fixture);
    alignEngineGeometry(region);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('GIVEN: a 200-row table virtualized at 40px rows in a 400px region', () => {
    describe('WHEN: the engine boots', () => {
      it('THEN: it mounts the CDK headless viewport as the first scrolled element of the region', () => {
        const engine = region.querySelector('[data-testid="nat-table-virtual-scroll-engine"]');

        expect(engine).not.toBeNull();
        expect(region.firstElementChild).toBe(engine);
        expect(engine?.querySelector('cdk-virtual-scroll-viewport')).not.toBeNull();
      });

      it('THEN: it mounts the CDK-computed initial window instead of all 200 rows', async () => {
        await vi.waitFor(() => {
          expect(dataRows(fixture).length).toBeGreaterThan(0);
          expect(dataRows(fixture).length).toBeLessThan(30);
        });
        expect(gapRows(fixture)).toHaveLength(1);
      });

      it('THEN: it reports the full logical grid through aria-rowcount', () => {
        const table = region.querySelector('table');

        expect(table?.getAttribute('aria-rowcount')).toBe('201');
      });
    });

    describe('WHEN: the region resizes without a window resize', () => {
      it('THEN: it re-measures the viewport through a ResizeObserver on the region', async () => {
        // The core header-measurement service observes the region too; the
        // engine's observer is any of the instances watching the region.
        const regionObservers = FakeResizeObserver.instances.filter((observer) => observer.observed.includes(region));

        expect(regionObservers.length).toBeGreaterThan(0);

        await vi.waitFor(() => {
          fixture.detectChanges();
          expect(dataRows(fixture).length).toBeLessThan(20);
        });

        Object.defineProperty(region, 'clientHeight', { value: 800, configurable: true });

        for (const observer of regionObservers) {
          observer.trigger();
        }

        await vi.waitFor(() => {
          fixture.detectChanges();
          expect(dataRows(fixture).length).toBeGreaterThan(20);
        });
      });
    });

    describe('WHEN: ArrowUp lands a mounted row under the sticky header', () => {
      it('THEN: it nudges the scroll position to reveal the row below the header overlay', async () => {
        scrollRegionTo(region, 4000);

        await vi.waitFor(() => {
          fixture.detectChanges();
          expect(Number(firstAriaRowIndex(fixture))).toBeGreaterThan(90);
        });

        const thead = region.querySelector('thead') as HTMLElement;
        const headerCell = region.querySelector('thead th') as HTMLElement;

        headerCell.style.position = 'sticky';
        thead.getBoundingClientRect = (): DOMRect => fakeDomRect({ height: 40 });

        const middleCell = dataRows(fixture)[5].cells[0];

        middleCell.focus();
        await settle(fixture);

        const scrollTopBefore = region.scrollTop;

        middleCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));

        await vi.waitFor(() => {
          expect(region.scrollTop).toBe(scrollTopBefore - 40);
        });
      });
    });

    describe('WHEN: the region scrolls to the middle', () => {
      it('THEN: it moves the window and sizes the leading gap in row space', async () => {
        scrollRegionTo(region, 4000);

        await vi.waitFor(() => {
          fixture.detectChanges();
          expect(Number(firstAriaRowIndex(fixture))).toBeGreaterThan(90);
        });

        const leadingGap = gapRows(fixture)[0];
        const mountedStart = Number(firstAriaRowIndex(fixture)) - 2;

        expect(leadingGap.style.height).toBe(`${mountedStart * 40}px`);
      });
    });

    describe('WHEN: the focused row scrolls out of the window', () => {
      it('THEN: it keeps the focused row mounted and releases it once focus leaves the table', async () => {
        const focusedCell = dataRows(fixture)[2].cells[0];

        focusedCell.focus();
        await settle(fixture);
        scrollRegionTo(region, 4000);

        await vi.waitFor(() => {
          fixture.detectChanges();
          expect(Number(dataRows(fixture).at(-1)?.getAttribute('aria-rowindex'))).toBeGreaterThan(90);
        });

        expect(dataRows(fixture).some((row) => row.getAttribute('aria-rowindex') === '4')).toBe(true);

        focusedCell.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
        await settle(fixture);

        expect(dataRows(fixture).some((row) => row.getAttribute('aria-rowindex') === '4')).toBe(false);
      });
    });

    describe('WHEN: the row order changes (sort)', () => {
      it('THEN: it scrolls back to the top', async () => {
        scrollRegionTo(region, 4000);
        await settle(fixture);

        tableOf(fixture).patchState({ sorting: [{ id: 'throughput', desc: true }] });
        await settle(fixture);

        expect(region.scrollTop).toBe(0);
      });
    });

    describe('WHEN: rows are appended without reordering', () => {
      it('THEN: it keeps the scroll position', async () => {
        scrollRegionTo(region, 4000);
        await settle(fixture);

        host.rows.set([...host.rows(), ...buildVirtualRows(50, 'appended')]);
        await settle(fixture);

        expect(region.scrollTop).toBe(4000);
      });
    });

    describe('WHEN: a vertical key targets an unmounted row', () => {
      it('THEN: it pre-scrolls and hands focus to the target row cell (Ctrl+End)', async () => {
        const startCell = dataRows(fixture)[1].cells[1];

        startCell.focus();
        await settle(fixture);

        const keydown = new KeyboardEvent('keydown', { key: 'End', ctrlKey: true, bubbles: true, cancelable: true });

        startCell.dispatchEvent(keydown);

        expect(keydown.defaultPrevented).toBe(true);
        expect(region.scrollTop).toBe(199 * 40);

        scrollRegionTo(region, region.scrollTop);

        await vi.waitFor(() => {
          fixture.detectChanges();
          const active = document.activeElement as HTMLElement | null;

          expect(active?.closest('tr')?.getAttribute('aria-rowindex')).toBe('201');
        });
      });

      it('THEN: it leaves mounted-target arrow moves to the aria grid without pre-scrolling', async () => {
        const startCell = dataRows(fixture)[1].cells[0];

        startCell.focus();
        await settle(fixture);

        startCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));

        expect(region.scrollTop).toBe(0);
      });
    });

    describe('WHEN: the directive is destroyed', () => {
      it('THEN: it removes the engine and returns the table to full rendering on the next instance', () => {
        fixture.destroy();

        expect(document.querySelector('[data-testid="nat-table-virtual-scroll-engine"]')).toBeNull();
      });
    });

    describe('WHEN: the imperative API is used', () => {
      it('THEN: scrollToIndex lands the row at the top of the row viewport', async () => {
        directiveOf(fixture).scrollToIndex(50);

        expect(region.scrollTop).toBe(2000);

        scrollRegionTo(region, region.scrollTop);

        await vi.waitFor(() => {
          fixture.detectChanges();
          expect(Number(firstAriaRowIndex(fixture)) - 2).toBeLessThanOrEqual(50);
          expect(Number(dataRows(fixture).at(-1)?.getAttribute('aria-rowindex')) - 2).toBeGreaterThanOrEqual(50);
        });
      });
    });
  });

  describe('GIVEN: a virtualized table combined with unsupported features', () => {
    describe('WHEN: sub-headers and per-row render events are configured alongside virtualization', () => {
      it('THEN: it warns in dev mode about both incompatibilities', async () => {
        const warnings = vi.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const unsupportedFixture = TestBed.createComponent(VirtualScrollUnsupportedFeaturesHost);

        unsupportedFixture.detectChanges();
        prepareRegionGeometry(regionOf(unsupportedFixture), 400);
        await unsupportedFixture.whenStable();
        unsupportedFixture.detectChanges();

        const messages = warnings.mock.calls.map((call) => String(call[0]));

        expect(messages.some((message) => message.includes('sub-header rows are not supported'))).toBe(true);
        expect(messages.some((message) => message.includes('per-row render events are suppressed'))).toBe(true);

        warnings.mockRestore();
        unsupportedFixture.destroy();
      });
    });
  });
});
