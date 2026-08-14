/* eslint-disable max-lines -- end-to-end directive contract: real windowing engine, DOM windowing, ARIA, focus, metrics, pagination, and development diagnostics. */
import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTable, NatTableService } from 'ng-advanced-table';
import type { NatTableDataStatus, NatTableRowActivateEvent, NatTableRowRenderedEvent } from 'ng-advanced-table';

import { NatTableVirtualize } from './table-virtualize.directive';
import type { NatTableVirtualRangeChange, NatTableVirtualizationOptions } from '../common/table-virtualization.type';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';

const stableRowId = (row: Row): string => row.id;

@Component({
  selector: 'test-virtual-table-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
    }
  `,
  template: `
    <button data-testid="outside-button" type="button">Outside</button>
    <nat-table
      [caption]="caption()"
      [columns]="columns"
      [data]="rows()"
      [dataStatus]="dataStatus()"
      [emitRowRenderEvents]="true"
      [getRowId]="getRowId"
      [natTableVirtualize]="options()"
      accessibleName="Virtual operations"
      (rowActivate)="onRowActivate($event)"
      (rowRendered)="onRowRendered($event)" />
  `
})
class VirtualTableHost {
  public readonly getRowId = stableRowId;
  public readonly rows = signal<Row[]>(buildRows(1000));
  public readonly caption = signal<string | undefined>(undefined);
  public readonly dataStatus = signal<NatTableDataStatus>('success');
  public readonly options = signal<NatTableVirtualizationOptions>({ rowHeight: 40 });
  public readonly rowActivateEvents: NatTableRowActivateEvent<Row>[] = [];
  public readonly rowRenderedEvents: NatTableRowRenderedEvent[] = [];
  protected readonly columns = columns;

  protected onRowRendered(event: NatTableRowRenderedEvent): void {
    this.rowRenderedEvents.push(event);
  }

  protected onRowActivate(event: NatTableRowActivateEvent<Row>): void {
    this.rowActivateEvents.push(event);
  }
}

@Component({
  selector: 'test-virtual-range-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
    }
  `,
  template: `
    <nat-table
      [columns]="columns"
      [data]="rows()"
      [natTableVirtualize]="{ rowHeight: 40 }"
      accessibleName="Virtual range operations"
      (virtualRangeChange)="rangeEvents.push($event)" />
  `
})
class VirtualRangeHost {
  public readonly rows = signal<Row[]>(buildRows(1000));
  public readonly rangeEvents: NatTableVirtualRangeChange[] = [];
  protected readonly columns = columns;
}

const CURSOR_PAGE_SIZE = 100;
/** Rows left below the mounted window before the container fetches the next page. */
const CURSOR_LOOKAHEAD = 20;

const isSameVirtualRange = (left: NatTableVirtualRangeChange, right: NatTableVirtualRangeChange): boolean =>
  left.startIndex === right.startIndex && left.endIndex === right.endIndex && left.count === right.count;

/**
 * A cursor-fetching container as the docs describe one: it owns the data and
 * appends each fetched page from its own `(virtualRangeChange)` handler. The
 * round trip is the contract under test — the append must not re-emit the
 * window that triggered it, or the handler re-enters itself on its own result.
 */
@Component({
  selector: 'test-cursor-fetch-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
    }
  `,
  template: `
    <nat-table
      [columns]="columns"
      [data]="rows()"
      [getRowId]="getRowId"
      [natTableVirtualize]="{ rowHeight: 40 }"
      accessibleName="Cursor fetched operations"
      (virtualRangeChange)="onRangeChange($event)" />
  `
})
class CursorFetchHost {
  public readonly getRowId = stableRowId;
  public readonly rows = signal<Row[]>(buildRows(CURSOR_PAGE_SIZE));
  public readonly rangeEvents: NatTableVirtualRangeChange[] = [];
  /** Row count loaded at the moment of each fetch, one entry per page fetched. */
  public readonly fetchedAt: number[] = [];
  protected readonly columns = columns;

  protected onRangeChange(range: NatTableVirtualRangeChange): void {
    this.rangeEvents.push(range);

    const loaded = this.rows().length;

    if (range.endIndex < loaded - CURSOR_LOOKAHEAD) {
      return;
    }

    this.fetchedAt.push(loaded);
    // buildRows is prefix-stable, so this is a true append of the next page.
    this.rows.set(buildRows(loaded + CURSOR_PAGE_SIZE));
  }
}

@Component({
  selector: 'test-ordinary-table-host',
  imports: [NatTable],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Ordinary operations" />`
})
class OrdinaryTableHost {
  protected readonly rows = buildRows(100);
  protected readonly columns = columns;
}

@Component({
  selector: 'test-sub-header-virtual-table-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
    }
  `,
  template: `
    <nat-table
      [columns]="columns"
      [data]="rows"
      [natTableVirtualize]="{ rowHeight: 40 }"
      accessibleName="Grouped virtual operations"
      subHeaderColumn="status" />
  `
})
class SubHeaderVirtualTableHost {
  protected readonly rows = buildRows(100);
  protected readonly columns = columns;
}

@Component({
  selector: 'test-dual-table-host',
  imports: [OrdinaryTableHost, VirtualTableHost],
  template: `
    <test-virtual-table-host />
    <test-ordinary-table-host />
  `
})
class DualTableHost {}

@Component({ selector: 'test-virtual-pager', template: '' })
class VirtualPager {
  public constructor() {
    const service = inject(NatTableService);
    const destroyRef = inject(DestroyRef);

    service.registerPagination();
    destroyRef.onDestroy(() => service.unregisterPagination());
  }
}

@Component({
  selector: 'test-paginated-virtual-table-host',
  imports: [NatTable, NatTableVirtualize, VirtualPager],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
    }
  `,
  template: `
    <test-virtual-pager />
    <nat-table
      [columns]="columns"
      [data]="rows"
      [natTableVirtualize]="{ rowHeight: 40 }"
      accessibleName="Paginated virtual operations" />
  `
})
class PaginatedVirtualTableHost {
  protected readonly rows = buildRows(100);
  protected readonly columns = columns;
}

@Component({
  selector: 'test-sticky-virtual-table-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
      --nat-table-sticky-top: 60px;
    }
  `,
  template: `
    <nat-table [columns]="columns" [data]="rows" [natTableVirtualize]="{ rowHeight: 40 }" accessibleName="Sticky virtual operations" />
  `
})
class StickyVirtualTableHost {
  private readonly tableService = inject(NatTableService);
  protected readonly rows = buildRows(100);
  protected readonly columns = columns;

  public constructor() {
    this.tableService.stickyHeader.set(false);
  }

  public enableStickyHeader(): void {
    this.tableService.stickyHeader.set(true);
  }
}

@Component({
  selector: 'test-virtual-geometry-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  styles: `
    nat-table {
      --nat-table-height: 200px;
    }
  `,
  template: `
    <nat-table
      [caption]="caption"
      [columns]="columns"
      [data]="rows"
      [natTableVirtualize]="{ rowHeight: 40 }"
      accessibleName="Virtual capacity planning" />
  `
})
class VirtualGeometryHost {
  protected readonly caption = 'Virtual capacity planning';
  protected readonly rows = buildRows(1000);
  protected readonly columns = columns;

  public constructor() {
    inject(NatTableService).stickyHeader.set(false);
  }
}

// Mutable so individual tests can grow the scrollport or collapse the
// scrollable overflow; reset before each test.
const geometry = { finalCellLeft: null as number | null, regionClientHeight: 200, regionScrollHeight: 40_040 };

const rect = (width: number, height: number, top = 0, left = 0): DOMRect => ({
  x: left,
  y: top,
  left,
  top,
  right: left + width,
  bottom: top + height,
  width,
  height,
  toJSON: () => ({})
});

const getRegionDimension = (element: Element, value: number): number =>
  element instanceof HTMLElement && element.dataset['testid'] === 'nat-table-region' ? value : 0;

const testRects = [
  { selector: '[data-testid="nat-table-region"]', value: (): DOMRect => rect(800, geometry.regionClientHeight) },
  { selector: 'caption', value: (): DOMRect => rect(800, 32) },
  { selector: 'thead', value: (): DOMRect => rect(800, 40) },
  { selector: 'tbody', value: (): DOMRect => rect(800, 40_000, 40) },
  { selector: 'tr.data-row', value: (): DOMRect => rect(800, 40) }
] as const;

const getFinalCellTestRect = (element: Element): DOMRect | null => {
  if (geometry.finalCellLeft === null) {
    return null;
  }

  return element.matches('tr[data-row-index="999"] [data-column-id="throughput"]') ? rect(160, 40, 0, geometry.finalCellLeft) : null;
};

const getCaptionHeight = (element: Element): number => (element.closest('table')?.querySelector('caption') ? 32 : 0);

const getBodyTestTop = (element: Element, region: HTMLElement | null): number => {
  if (!region) {
    return 40;
  }

  return getCaptionHeight(element) + 40 - region.scrollTop;
};

const getBodyTestRect = (element: Element): DOMRect | null => {
  if (!element.matches('tbody')) {
    return null;
  }

  const region = element.closest<HTMLElement>('[data-testid="nat-table-region"]');

  return rect(800, 40_000, getBodyTestTop(element, region));
};

const getConfiguredTestRect = (element: Element): DOMRect => {
  const match = testRects.find(({ selector }) => element.matches(selector));

  return match?.value() ?? rect(0, 0);
};

const getTestRect = (element: Element): DOMRect => {
  const specialRect = getFinalCellTestRect(element) ?? getBodyTestRect(element);

  if (specialRect) {
    return specialRect;
  }

  return getConfiguredTestRect(element);
};

const getStickyHeaderStyle = (element: Element): CSSStyleDeclaration => {
  const table = element.closest('table');

  if (table?.classList.contains('has-sticky-header')) {
    return { top: '60px' } as CSSStyleDeclaration;
  }

  return { top: 'auto' } as CSSStyleDeclaration;
};

const resolveScrollTop = (current: number, options: ScrollToOptions | number, y?: number): number => {
  const requested = typeof options === 'number' ? y : options.top;

  return requested ?? current;
};

const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');

/** Minimal ResizeObserver double: records observed elements, fires on demand. */
class TestResizeObserver {
  public static readonly instances: TestResizeObserver[] = [];
  public readonly observed = new Set<Element>();

  public constructor(private readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }

  public observe(element: Element): void {
    this.observed.add(element);
  }

  public unobserve(element: Element): void {
    this.observed.delete(element);
  }

  public disconnect(): void {
    this.observed.clear();
  }

  public emit(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

// Core's header-measurement service observes the region and `th` cells; the
// virtualization layout observer is the only one watching `thead` itself.
const findLayoutObserver = (thead: Element): TestResizeObserver => {
  const observer = TestResizeObserver.instances.find((candidate) => candidate.observed.has(thead));

  if (!observer) {
    throw new Error('Expected the layout service to observe the table header.');
  }

  return observer;
};

/** Waits for the engine's animation-frame-coalesced scroll handler to run. */
const nextAnimationFrame = async (): Promise<void> =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

/** Scrolls the table region the way a user does: scrollTop, scroll event, frame. */
const scrollRegion = async (fixture: ComponentFixture<unknown>, region: HTMLElement, top: number): Promise<void> => {
  region.scrollTop = top;
  region.dispatchEvent(new Event('scroll'));
  await nextAnimationFrame();
  await fixture.whenStable();
};

describe('FEATURE: opt-in NatTable row virtualization', () => {
  beforeEach(async () => {
    geometry.finalCellLeft = null;
    geometry.regionClientHeight = 200;
    geometry.regionScrollHeight = 40_040;

    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return getRegionDimension(this, geometry.regionClientHeight);
    });

    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return getRegionDimension(this, 800);
    });

    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return getRegionDimension(this, geometry.regionClientHeight);
    });

    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return getRegionDimension(this, 800);
    });

    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
      return getRegionDimension(this, geometry.regionScrollHeight);
    });

    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return getTestRect(this);
    });

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value(this: HTMLElement, options: ScrollToOptions | number, y?: number): void {
        this.scrollTop = resolveScrollTop(this.scrollTop, options, y);
        this.dispatchEvent(new Event('scroll'));
      }
    });

    await TestBed.configureTestingModule({
      imports: [
        DualTableHost,
        OrdinaryTableHost,
        PaginatedVirtualTableHost,
        StickyVirtualTableHost,
        SubHeaderVirtualTableHost,
        VirtualGeometryHost,
        VirtualTableHost
      ],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    TestResizeObserver.instances.length = 0;

    if (originalScrollTo) {
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
    }
  });

  describe('GIVEN: an ordinary table without the directive', () => {
    describe('WHEN: one hundred logical rows are rendered', () => {
      it('THEN: it keeps the existing render-all behavior', async () => {
        const fixture = TestBed.createComponent(OrdinaryTableHost);

        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(100);
        expect(queryAll(fixture, 'tbody tr.virtual-spacer-row')).toHaveLength(0);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: one thousand rows and the virtualize directive', () => {
    describe('WHEN: the initial virtual window is rendered', () => {
      it('THEN: it mounts a bounded native-table window with absolute ARIA row metadata', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const natTable = queryRequired(fixture, 'nat-table');
        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const spacers = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.virtual-spacer-row');
        const firstRow = renderedRows[0];

        expect(renderedRows).toHaveLength(10);
        expect(spacers).toHaveLength(1);
        expect(natTable.style.getPropertyValue('--sys-nat-table-virtual-row-height')).toBe('40px');
        expect(table.getAttribute('aria-rowcount')).toBe('1001');
        expect(queryRequired(fixture, 'thead tr').getAttribute('aria-rowindex')).toBe('1');
        expect(queryRequired(fixture, 'p[id$="-summary"]').textContent).toContain('1,000');
        expect(firstRow.getAttribute('aria-rowindex')).toBe(String(Number(firstRow.dataset['rowIndex']) + 2));
        expect(spacers.every((spacer) => spacer.getAttribute('aria-hidden') === 'true')).toBe(true);
        expect(spacers.every((spacer) => spacer.dataset['testid'] === 'nat-table-virtual-spacer')).toBe(true);
        expect(spacers.every((spacer) => !spacer.hasAttribute('ngGridRow'))).toBe(true);
        expect(table.querySelectorAll('tbody')).toHaveLength(1);
        expect(getComputedStyle(table).display).toBe('table');
        expect(renderedRows.every((row) => row.style.transform === '')).toBe(true);

        fixture.destroy();
      });
    });

    describe('WHEN: the scroll region moves to the middle of the dataset', () => {
      it('THEN: it replaces the mounted window without a global application tick', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const firstIndex = Number(renderedRows[0]?.dataset['rowIndex']);

        expect(firstIndex).toBeGreaterThan(40);
        expect(renderedRows.length).toBeLessThan(30);
        expect(renderedRows[0]?.getAttribute('aria-rowindex')).toBe(String(firstIndex + 2));

        fixture.destroy();
      });
    });

    describe('WHEN: two scroll events land in the same animation frame', () => {
      it('THEN: it coalesces them into one window update at the final offset', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        // Count the schedules: asserting only the final offset passes even with
        // the dedup guard deleted, because `updateRange` reads live `scrollTop`
        // and both frames would compute the same window.
        const schedule = vi.spyOn(globalThis, 'requestAnimationFrame');

        region.scrollTop = 4000;
        region.dispatchEvent(new Event('scroll'));
        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));

        expect(schedule).toHaveBeenCalledTimes(1);

        await nextAnimationFrame();
        await fixture.whenStable();

        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('44');

        fixture.destroy();
      });
    });

    describe('WHEN: Control End targets a row outside the mounted window', () => {
      it('THEN: it mounts, reveals, and focuses the final logical row and column', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        geometry.finalCellLeft = 900;

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const firstHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="name"]');

        firstHeader.focus();
        firstHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true, bubbles: true, cancelable: true }));
        await fixture.whenStable();

        const finalCell = queryRequired<HTMLElement>(
          fixture,
          'tbody tr[data-row-index="999"] [ngGridCell][data-column-id="throughput"]'
        );

        expect(document.activeElement).toBe(finalCell);
        expect(finalCell.closest('tr')?.getAttribute('aria-rowindex')).toBe('1001');
        expect(region.scrollLeft).toBe(260);

        fixture.destroy();
      });
    });

    describe('WHEN: Page Down is pressed below a sticky header', () => {
      it('THEN: it advances by the number of body rows visible below the sticky overlay', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const firstCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="region"]');

        firstCell.focus();
        firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        const targetCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="4"] [data-column-id="region"]');

        expect(document.activeElement).toBe(targetCell);

        fixture.destroy();
      });
    });

    describe('WHEN: Page Down is pressed below a caption and non-sticky header', () => {
      it('THEN: it advances by only the body rows visible in the remaining viewport', async () => {
        const fixture = TestBed.createComponent(VirtualGeometryHost);

        await fixture.whenStable();

        const firstCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="region"]');

        firstCell.focus();
        firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(document.activeElement).toBe(
          queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="3"] [data-column-id="region"]')
        );

        fixture.destroy();
      });
    });

    describe('WHEN: Arrow Down leaves the mounted window from a delegated cell button', () => {
      it('THEN: it preserves the grid column while mounting and focusing the next logical row', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const edgeRow = renderedRows.at(-1) as HTMLTableRowElement;
        const edgeIndex = Number(edgeRow.dataset['rowIndex']);
        const edgeCell = edgeRow.querySelector<HTMLElement>('[ngGridCell][data-column-id="region"]') as HTMLElement;

        edgeCell.innerHTML = '<button type="button" tabindex="-1" data-nat-table-managed-cell-widget>Open region</button>';

        const button = edgeCell.querySelector<HTMLButtonElement>('button') as HTMLButtonElement;

        button.focus();
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        const nextCell = queryRequired<HTMLElement>(
          fixture,
          `tbody tr[data-row-index="${edgeIndex + 1}"] [ngGridCell][data-column-id="region"]`
        );

        expect(document.activeElement).toBe(nextCell);

        fixture.destroy();
      });
    });

    describe('WHEN: Arrow Up targets an unmounted row above the window', () => {
      it('THEN: it scrolls the row under the sticky overlay and focuses it', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const topRow = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const topIndex = Number(topRow.dataset['rowIndex']);
        const topCell = topRow.querySelector<HTMLElement>('[ngGridCell][data-column-id="region"]') as HTMLElement;

        topCell.focus();
        topCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        const previousCell = queryRequired<HTMLElement>(
          fixture,
          `tbody tr[data-row-index="${topIndex - 1}"] [ngGridCell][data-column-id="region"]`
        );

        expect(document.activeElement).toBe(previousCell);

        fixture.destroy();
      });
    });

    describe('WHEN: Control Home is pressed from a mid-list body cell', () => {
      it('THEN: it focuses the first grid cell in the header', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const midCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="50"] [ngGridCell][data-column-id="region"]');

        midCell.focus();
        midCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', ctrlKey: true, bubbles: true, cancelable: true }));
        await fixture.whenStable();

        const firstCell = queryRequired<HTMLElement>(fixture, 'thead [ngGridCell][data-column-id="name"]');

        expect(document.activeElement).toBe(firstCell);
        expect(region.scrollTop).toBe(0);

        fixture.destroy();
      });
    });

    describe('WHEN: focus moves from a retained out-of-window row to a header cell', () => {
      it('THEN: it keeps the retained row mounted for the roving tabstop memory', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const firstCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [ngGridCell][data-column-id="name"]');

        firstCell.focus();
        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        expect(document.activeElement).toBe(firstCell);

        queryRequired<HTMLElement>(fixture, 'thead [ngGridCell][data-column-id="name"]').focus();
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr[data-row-index="0"]')).not.toBeNull();

        queryRequired<HTMLButtonElement>(fixture, '[data-testid="outside-button"]').focus();
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr[data-row-index="0"]')).toBeNull();

        fixture.destroy();
      });
    });

    describe('WHEN: the focused row scrolls out of the mounted window', () => {
      it('THEN: it keeps the row mounted until focus leaves the table', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const firstCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [ngGridCell][data-column-id="name"]');

        firstCell.focus();
        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const mountedIndexes = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row').map((row) =>
          Number(row.dataset['rowIndex'])
        );

        expect(mountedIndexes[0]).toBe(0);
        expect(mountedIndexes[1]).toBeGreaterThan(40);
        expect(document.activeElement).toBe(firstCell);

        queryRequired<HTMLButtonElement>(fixture, '[data-testid="outside-button"]').focus();
        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr[data-row-index="0"]')).toBeNull();

        fixture.destroy();
      });
    });

    describe('WHEN: data is replaced after scrolling', () => {
      it('THEN: it resets the virtual range and scroll position', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        host.rows.set(buildRows(120));
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: data with the same stable row IDs replaces an unfocused scrolled window', () => {
      it('THEN: it keeps the scroll position and mounted window in place', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const firstMountedIndex = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex'];

        host.rows.set(buildRows(1000));
        await fixture.whenStable();

        expect(region.scrollTop).toBe(2000);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe(firstMountedIndex);

        fixture.destroy();
      });
    });

    describe('WHEN: replacement row IDs differ only across embedded separator characters', () => {
      it('THEN: it recognizes the new identity sequence and resets the scrolled window', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;
        const initialRows = buildRows(1000);

        initialRows[0] = { ...initialRows[0], id: 'a\u0000b' };
        initialRows[1] = { ...initialRows[1], id: 'c' };
        host.rows.set(initialRows);
        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const replacementRows = buildRows(1000);

        replacementRows[0] = { ...replacementRows[0], id: 'a' };
        replacementRows[1] = { ...replacementRows[1], id: 'b\u0000c' };
        host.rows.set(replacementRows);
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: data with the same stable row IDs replaces a focused scrolled window', () => {
      it('THEN: it keeps the same logical cell focused and visible', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="50"] [data-column-id="region"]');
        const focusedRowId = focusedCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId'];

        focusedCell.focus();
        host.rows.set(buildRows(120));
        await fixture.whenStable();

        const restoredCell = queryRequired<HTMLElement>(fixture, `tbody tr[data-row-id="${focusedRowId}"] [data-column-id="region"]`);

        expect(document.activeElement).toBe(restoredCell);
        expect(region.scrollTop).toBe(2000);

        fixture.destroy();
      });
    });

    describe('WHEN: filter state changes without changing the resulting row IDs', () => {
      it('THEN: it still resets the virtual range and scroll position', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        await scrollRegion(fixture, region, 2000);

        const rowIdsBeforeFilter = table.table.getRowModel().rows.map((row) => row.id);

        table.table.setColumnFilters([{ id: 'status', value: ['Healthy', 'Pending', 'Alert'] }]);
        await fixture.whenStable();

        expect(table.table.getRowModel().rows.map((row) => row.id)).toStrictEqual(rowIdsBeforeFilter);
        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: filter state changes while a surviving body cell is focused', () => {
      it('THEN: it restores the same logical row and column without losing the keyboard position', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        await scrollRegion(fixture, region, 2000);

        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="50"] [data-column-id="region"]');
        const focusedRowId = focusedCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId'];

        focusedCell.focus();
        table.table.setColumnFilters([{ id: 'status', value: ['Healthy', 'Pending', 'Alert'] }]);
        await fixture.whenStable();

        const restoredCell = queryRequired<HTMLElement>(fixture, `tbody tr[data-row-id="${focusedRowId}"] [data-column-id="region"]`);

        expect(document.activeElement).toBe(restoredCell);
        expect(region.scrollTop).toBe(2000);

        fixture.destroy();
      });
    });

    describe('WHEN: filtering removes the focused logical row', () => {
      it('THEN: it moves focus predictably to the first surviving row in the same column', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        await scrollRegion(fixture, region, 2000);

        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="52"] [data-column-id="region"]');

        expect(focusedCell.closest<HTMLTableRowElement>('tr')?.textContent).toContain('Pending');

        focusedCell.focus();
        table.table.setColumnFilters([{ id: 'status', value: ['Healthy'] }]);
        await fixture.whenStable();

        expect(document.activeElement).toBe(queryRequired(fixture, 'tbody tr[data-row-index="0"] [data-column-id="region"]'));
        expect(region.scrollTop).toBe(0);

        fixture.destroy();
      });
    });

    describe('WHEN: the focused column is hidden', () => {
      it('THEN: it keeps focus on the same row at the nearest remaining visible column', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;
        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="region"]');

        focusedCell.focus();
        table.patchState({ columnVisibility: { region: false } });
        await fixture.whenStable();

        expect(document.activeElement).toBe(
          queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="status"]')
        );

        fixture.destroy();
      });
    });

    describe('WHEN: selection and column sizing change after scrolling', () => {
      it('THEN: it preserves the mounted window and scroll position', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        await scrollRegion(fixture, region, 2000);

        const firstMountedIndex = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex'];

        table.patchState({ rowSelection: { '5': true }, columnSizing: { name: 220 } });
        await fixture.whenStable();

        expect(region.scrollTop).toBe(2000);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe(firstMountedIndex);

        fixture.destroy();
      });
    });

    describe('WHEN: a row in a scrolled window is activated', () => {
      it('THEN: it emits the stable logical TanStack row identity', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const row = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');

        row.click();

        expect(host.rowActivateEvents.at(-1)?.row.id).toBe(row.dataset['rowId']);

        fixture.destroy();
      });
    });

    describe('WHEN: the mounted range changes with row metrics enabled', () => {
      it('THEN: it times the rows that actually mounted and stays silent for the rest', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const initialToken = Math.max(...host.rowRenderedEvents.map((event) => event.renderToken));
        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        host.rowRenderedEvents.length = 0;
        await scrollRegion(fixture, region, 2000);

        const mountedRowIds = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row').map((row) => row.dataset['rowId']);

        // Scrolling is not a new render cycle: the rows that stayed mounted did
        // not re-render, so only the freshly mounted ones report, and they
        // report inside the cycle the row model opened.
        expect(host.rowRenderedEvents.length).toBeGreaterThan(0);
        expect(host.rowRenderedEvents.every((event) => event.renderToken === initialToken)).toBe(true);
        expect(host.rowRenderedEvents.every((event) => mountedRowIds.includes(event.rowId))).toBe(true);
        expect(new Set(host.rowRenderedEvents.map((event) => event.rowId)).size).toBe(host.rowRenderedEvents.length);

        fixture.destroy();
      });
    });

    describe('WHEN: the row model is rebuilt with row metrics enabled', () => {
      it('THEN: it opens a new render cycle and re-times every mounted row', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const initialToken = Math.max(...host.rowRenderedEvents.map((event) => event.renderToken));

        host.rowRenderedEvents.length = 0;
        host.rows.set(buildRows(900));
        await fixture.whenStable();

        const mountedRowIds = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row').map((row) => row.dataset['rowId']);

        expect(host.rowRenderedEvents.every((event) => event.renderToken > initialToken)).toBe(true);
        expect(host.rowRenderedEvents.map((event) => event.rowId).sort()).toStrictEqual([...mountedRowIds].sort());

        fixture.destroy();
      });
    });

    describe('WHEN: the logical row model becomes empty', () => {
      it('THEN: it renders the ordinary empty-state row without virtual spacers', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();
        host.rows.set([]);
        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
        expect(queryAll(fixture, 'tbody tr.virtual-spacer-row')).toHaveLength(0);
        expect(queryRequired(fixture, 'tbody tr').getAttribute('aria-rowindex')).toBe('2');
        expect(queryRequired(fixture, 'table').getAttribute('aria-rowcount')).toBe('2');

        fixture.destroy();
      });
    });

    describe('WHEN: an error state replaces focused rows and then recovers', () => {
      it('THEN: it moves focus to the mounted state cell and back to the first data row', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();
        queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]').focus();

        host.dataStatus.set('error');
        await fixture.whenStable();

        expect(document.activeElement).toBe(queryRequired<HTMLElement>(fixture, 'tbody .error-state[ngGridCell]'));

        host.dataStatus.set('success');
        await fixture.whenStable();

        expect(document.activeElement).toBe(
          queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="name"]')
        );

        fixture.destroy();
      });
    });

    describe('WHEN: the browser viewport resizes to a taller region', () => {
      it('THEN: it re-measures through the window resize listener and mounts more rows', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(10);

        geometry.regionClientHeight = 400;
        window.dispatchEvent(new Event('resize'));
        // Resize handling is coalesced to the next animation frame.
        await new Promise((resolve) => setTimeout(resolve, 40));
        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(15);

        fixture.destroy();
      });
    });

    describe('WHEN: two viewport events land in the same animation frame', () => {
      it('THEN: it coalesces them into one re-measure at the final geometry', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(10);

        // Both events must share one frame: the row count alone is identical
        // whether or not the guard exists, since both re-measures read the same
        // geometry.
        const schedule = vi.spyOn(globalThis, 'requestAnimationFrame');

        geometry.regionClientHeight = 400;
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('orientationchange'));

        expect(schedule).toHaveBeenCalledTimes(1);

        await new Promise((resolve) => setTimeout(resolve, 40));
        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(15);

        fixture.destroy();
      });
    });

    describe('WHEN: the table is destroyed before a pending viewport frame runs', () => {
      it('THEN: it cancels the pending re-measure without touching the destroyed view', async () => {
        const cancel = vi.spyOn(window, 'cancelAnimationFrame');
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        window.dispatchEvent(new Event('resize'));
        fixture.destroy();

        expect(cancel).toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN: a layout observed through ResizeObserver', () => {
    describe('WHEN: the observed table region grows', () => {
      it('THEN: it re-measures and mounts more rows without a scroll event', async () => {
        vi.stubGlobal('ResizeObserver', TestResizeObserver);

        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(10);

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const observer = findLayoutObserver(queryRequired(fixture, 'thead'));

        expect(observer.observed.has(region)).toBe(true);

        geometry.regionClientHeight = 400;
        observer.emit();
        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(15);

        fixture.destroy();
      });
    });

    describe('WHEN: the table caption toggles', () => {
      it('THEN: it re-targets the observer to the replaced caption node', async () => {
        vi.stubGlobal('ResizeObserver', TestResizeObserver);

        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const observer = findLayoutObserver(queryRequired(fixture, 'thead'));

        host.caption.set('Virtual operations overview');
        await fixture.whenStable();

        const caption = queryRequired(fixture, 'table caption');

        expect(observer.observed.has(caption)).toBe(true);

        host.caption.set(undefined);
        await fixture.whenStable();

        expect(observer.observed.has(caption)).toBe(false);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a virtual table that starts with a non-sticky header and a sticky top offset', () => {
    describe('WHEN: the sticky header is enabled before paging from the keyboard', () => {
      it('THEN: it remeasures the rendered overlay and keeps the target below it', async () => {
        const nativeGetComputedStyle = window.getComputedStyle.bind(window);

        vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
          if (element.matches('thead th')) {
            return getStickyHeaderStyle(element);
          }

          return nativeGetComputedStyle(element, pseudoElement);
        });

        const fixture = TestBed.createComponent(StickyVirtualTableHost);

        await fixture.whenStable();

        const host = fixture.componentInstance;
        const firstCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="region"]');

        host.enableStickyHeader();
        await fixture.whenStable();

        firstCell.focus();
        firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(document.activeElement).toBe(queryRequired(fixture, 'tbody tr[data-row-index="2"] [data-column-id="region"]'));

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: development-mode diagnostics for the directive options', () => {
    describe('WHEN: the options contain non-finite or negative values', () => {
      it('THEN: it warns for each invalid option while normalizing them', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        expect(warn).not.toHaveBeenCalled();

        host.options.set({ rowHeight: 0, overscan: -1 });
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('rowHeight must be a finite number above zero'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('overscan must be a finite number at or above zero'));
        // The fallback height must keep the window bounded — a 1px grid would
        // mount roughly one row per viewport pixel.
        expect(queryAll(fixture, 'tbody tr.data-row').length).toBeLessThan(30);

        fixture.destroy();
      });
    });

    describe('WHEN: the overscan is configured with a fractional value', () => {
      it('THEN: it floors the overscan silently and keeps windowing', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        host.options.set({ rowHeight: 40, overscan: 5.7 });
        await fixture.whenStable();

        expect(warn).not.toHaveBeenCalled();
        expect(queryAll(fixture, 'tbody tr.data-row').length).toBeGreaterThan(0);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a configured row height that diverges from the rendered rows', () => {
    describe('WHEN: the mounted rows render at a different measured height', () => {
      it('THEN: it warns once with the expected and measured heights', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        expect(warn).not.toHaveBeenCalled();

        host.options.set({ rowHeight: 48 });
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('expected 48px rows but measured 40px'));

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a table region that does not scroll its content', () => {
    describe('WHEN: more rows than the initial window are supplied', () => {
      it('THEN: it warns that the region must be bounded', async () => {
        geometry.regionScrollHeight = 200;

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs a bounded region'));

        fixture.destroy();
      });
    });

    describe('WHEN: a small asynchronous dataset later grows beyond the bootstrap window', () => {
      it('THEN: it warns once the unbounded region can no longer virtualize the rows', async () => {
        geometry.regionScrollHeight = 200;

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;
        const boundedWarnings = (): unknown[][] =>
          warn.mock.calls.filter(([message]) => String(message).includes('needs a bounded region'));

        host.rows.set(buildRows(5));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(0);

        host.rows.set(buildRows(100));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        fixture.destroy();
      });
    });

    describe('WHEN: a bounded region later expands to fit all rows', () => {
      it('THEN: it revalidates the resized region and warns once', async () => {
        vi.stubGlobal('ResizeObserver', TestResizeObserver);

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(VirtualTableHost);
        const boundedWarnings = (): unknown[][] =>
          warn.mock.calls.filter(([message]) => String(message).includes('needs a bounded region'));

        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(0);

        geometry.regionScrollHeight = geometry.regionClientHeight;
        TestResizeObserver.instances.forEach((observer) => observer.emit());
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        TestResizeObserver.instances.forEach((observer) => observer.emit());
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: virtualization composed with automatic pagination', () => {
    describe('WHEN: the table advances to the next page', () => {
      it('THEN: it virtualizes the final page-local row model and resets its row indices', async () => {
        const fixture: ComponentFixture<PaginatedVirtualTableHost> = TestBed.createComponent(PaginatedVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        await scrollRegion(fixture, region, 160);

        table.table.nextPage();
        await fixture.whenStable();

        const firstRow = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableElement>(fixture, 'table').getAttribute('aria-rowcount')).toBe('11');
        expect(firstRow.dataset['rowIndex']).toBe('0');
        expect(firstRow.getAttribute('aria-rowindex')).toBe('2');
        expect(firstRow.textContent).toContain('Service 11');

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: virtualization combined with sub-header rows', () => {
    // One hundred rows grouped by status sort into Alert (33), Healthy (34),
    // and Pending (33), so the composite grid holds 103 fixed-height slots and
    // rows 0, 33, and 67 open the three sub-header groups.
    describe('WHEN: the grouped table renders its initial window', () => {
      it('THEN: it mounts the opening sub-header inside the window without warning', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture: ComponentFixture<SubHeaderVirtualTableHost> = TestBed.createComponent(SubHeaderVirtualTableHost);

        await fixture.whenStable();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const subHeaders = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.sub-header-row');
        const firstRow = renderedRows[0];

        // Header row + three sub-header grid rows + one hundred data rows.
        expect(table.getAttribute('aria-rowcount')).toBe('104');
        // The measured window is rows 0..8; hysteresis keeps the 10-row
        // bootstrap mount because it already covers the visible span.
        expect(renderedRows).toHaveLength(10);
        expect(subHeaders).toHaveLength(1);
        expect(subHeaders[0].nextElementSibling).toBe(firstRow);
        expect(subHeaders[0].getAttribute('aria-rowindex')).toBe('2');
        // Data and sub-header rows are both sized from the directive's row-height
        // property, not from a per-row inline height.
        expect(queryRequired(fixture, 'nat-table').style.getPropertyValue('--sys-nat-table-virtual-row-height')).toBe('40px');
        expect(subHeaders[0].style.height).toBe('');
        expect(firstRow.style.height).toBe('');
        expect(firstRow.getAttribute('aria-rowindex')).toBe('3');
        expect(warn).not.toHaveBeenCalled();

        fixture.destroy();
      });
    });

    describe('WHEN: the window settles inside a group away from its opening row', () => {
      it('THEN: it sizes the leading spacer for the unmounted sub-header slots', async () => {
        const fixture: ComponentFixture<SubHeaderVirtualTableHost> = TestBed.createComponent(SubHeaderVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        // Body-local slot 45 (40px thead offset): Healthy rows 38..52 mount,
        // and neither group-opening row 33 nor 67 is in the window.
        await scrollRegion(fixture, region, 1840);

        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const spacerCells = queryAll<HTMLTableCellElement>(fixture, 'tbody tr.virtual-spacer-row td');

        expect(queryAll(fixture, 'tbody tr.sub-header-row')).toHaveLength(0);
        expect(renderedRows[0].dataset['rowIndex']).toBe('38');
        // 38 data rows plus 2 sub-header slots above the window: 40 x 40px.
        expect(renderedRows[0].getAttribute('aria-rowindex')).toBe('42');
        expect(spacerCells).toHaveLength(2);
        expect(spacerCells[0].style.height).toBe('1600px');
        // 103 total slots x 40px = 4120px; the window ends after slot 55.
        expect(spacerCells[1].style.height).toBe(`${4120 - 55 * 40}px`);

        fixture.destroy();
      });
    });

    describe('WHEN: the window crosses a group boundary', () => {
      it('THEN: it mounts the sub-header with the group-opening row as one block', async () => {
        const fixture: ComponentFixture<SubHeaderVirtualTableHost> = TestBed.createComponent(SubHeaderVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        // Body-local slot 40: the window re-anchors at the Healthy opener 33.
        await scrollRegion(fixture, region, 1640);

        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const subHeaders = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.sub-header-row');
        const spacerCells = queryAll<HTMLTableCellElement>(fixture, 'tbody tr.virtual-spacer-row td');
        const openingRow = renderedRows[0];

        expect(openingRow.dataset['rowIndex']).toBe('33');
        expect(subHeaders).toHaveLength(1);
        expect(subHeaders[0].nextElementSibling).toBe(openingRow);
        // Data row 33 is grid row 37 (header + 33 rows + 2 sub-headers + 1);
        // its sub-header is the grid row above.
        expect(subHeaders[0].getAttribute('aria-rowindex')).toBe('36');
        expect(openingRow.getAttribute('aria-rowindex')).toBe('37');
        // The spacer stops at the sub-header's slot: (33 + 2 - 1) x 40px.
        expect(spacerCells[0].style.height).toBe('1360px');

        fixture.destroy();
      });
    });

    describe('WHEN: Page Down crosses a sub-header group boundary', () => {
      it('THEN: it advances by one viewport of composite grid rows', async () => {
        const fixture: ComponentFixture<SubHeaderVirtualTableHost> = TestBed.createComponent(SubHeaderVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 1280);

        const source = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="31"] [data-column-id="region"]');

        source.focus();
        source.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(document.activeElement).toBe(
          queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="34"] [data-column-id="region"]')
        );

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a virtualized table fed by incremental row fetching', () => {
    describe('WHEN: a page of rows is appended below a scrolled window', () => {
      it('THEN: it keeps the scroll position and the mounted window in place', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const mountedIndexesBeforeAppend = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row').map(
          (row) => row.dataset['rowIndex']
        );

        host.rows.set(buildRows(1200));
        await fixture.whenStable();

        expect(region.scrollTop).toBe(2000);
        expect(queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row').map((row) => row.dataset['rowIndex'])).toStrictEqual(
          mountedIndexesBeforeAppend
        );

        fixture.destroy();
      });
    });

    describe('WHEN: rows are appended repeatedly while the reader stays put', () => {
      it('THEN: it never yanks the reader back to the top of the dataset', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        for (const size of [1100, 1200, 1300]) {
          host.rows.set(buildRows(size));
          await fixture.whenStable();
        }

        expect(region.scrollTop).toBe(2000);
        expect(Number(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex'])).toBeGreaterThan(0);

        fixture.destroy();
      });
    });

    describe('WHEN: sorting changes after rows have been appended', () => {
      it('THEN: it resets the window because the row order was rewritten', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        await scrollRegion(fixture, region, 2000);
        host.rows.set(buildRows(1200));
        await fixture.whenStable();

        expect(region.scrollTop).toBe(2000);

        table.table.setSorting([{ id: 'throughput', desc: true }]);
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: a page is appended to a descending sorted row model', () => {
      it('THEN: it resets the window because new rows land above the reader', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        table.table.setSorting([{ id: 'throughput', desc: true }]);
        await fixture.whenStable();
        await scrollRegion(fixture, region, 2000);

        // Sorted descending, an appended page sorts to the front, so the
        // sequence is rewritten rather than extended and the reset stands.
        host.rows.set(buildRows(1200));
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: replacement row IDs collide with a delimiter-joined sequence', () => {
      it('THEN: it still resets the reader to the replacement row model', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        host.rows.set(buildRows(100));
        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const joinedPreviousIds = host
          .rows()
          .map((row) => row.id)
          .join('\u001F');
        const replacementRows = buildRows(2).map((row, index) => ({
          ...row,
          id: index === 0 ? joinedPreviousIds : 'replacement-tail'
        }));

        host.rows.set(replacementRows);
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowId']).toBe(joinedPreviousIds);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a virtualized table reporting its mounted range', () => {
    describe('WHEN: the initial window is rendered and then scrolled', () => {
      it('THEN: it emits the mounted row bounds and count for each window', async () => {
        const fixture = TestBed.createComponent(VirtualRangeHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const initialRange = host.rangeEvents.at(-1);
        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 2000);

        const scrolledRange = host.rangeEvents.at(-1);

        expect(initialRange?.startIndex).toBe(0);
        expect(initialRange?.count).toBe((initialRange?.endIndex ?? 0) + 1);
        expect(scrolledRange?.startIndex).toBeGreaterThan(0);
        expect(scrolledRange?.count).toBe((scrolledRange?.endIndex ?? 0) - (scrolledRange?.startIndex ?? 0) + 1);
        expect(queryAll(fixture, 'tbody tr.data-row')).toHaveLength(scrolledRange?.count ?? 0);

        fixture.destroy();
      });
    });

    describe('WHEN: the row model empties', () => {
      it('THEN: it reports an empty range instead of a stale window', async () => {
        const fixture = TestBed.createComponent(VirtualRangeHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();
        host.rows.set([]);
        await fixture.whenStable();

        expect(host.rangeEvents.at(-1)).toStrictEqual({ startIndex: 0, endIndex: -1, count: 0 });

        fixture.destroy();
      });
    });

    describe('WHEN: rows are appended without moving the mounted window', () => {
      it('THEN: it does not emit a duplicate range event', async () => {
        const fixture = TestBed.createComponent(VirtualRangeHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const eventCount = host.rangeEvents.length;
        const mountedRange = host.rangeEvents.at(-1);

        host.rows.set(buildRows(1100));
        await fixture.whenStable();

        expect(host.rangeEvents).toHaveLength(eventCount);
        expect(host.rangeEvents.at(-1)).toBe(mountedRange);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a container that fetches the next page from its own range handler', () => {
    describe('WHEN: the mounted window reaches the fetch lookahead', () => {
      it('THEN: it fetches one page and is not re-entered by the append it caused', async () => {
        const fixture = TestBed.createComponent(CursorFetchHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        expect(host.fetchedAt).toStrictEqual([]);

        await scrollRegion(fixture, region, CURSOR_PAGE_SIZE * 40 - 200);

        const repeatedWindows = host.rangeEvents.filter(
          (event, index) => index > 0 && isSameVirtualRange(host.rangeEvents[index - 1], event)
        );

        expect(host.fetchedAt).toStrictEqual([CURSOR_PAGE_SIZE]);
        expect(host.rows()).toHaveLength(CURSOR_PAGE_SIZE * 2);
        expect(repeatedWindows).toStrictEqual([]);
        expect(region.scrollTop).toBe(CURSOR_PAGE_SIZE * 40 - 200);

        fixture.destroy();
      });
    });

    describe('WHEN: the reader keeps scrolling through the fetched pages', () => {
      it('THEN: it fetches one page per approach and never rewinds the mounted window', async () => {
        const fixture = TestBed.createComponent(CursorFetchHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const firstMountedIndexes: number[] = [];

        for (const loadedPages of [1, 2, 3]) {
          await scrollRegion(fixture, region, loadedPages * CURSOR_PAGE_SIZE * 40 - 200);
          firstMountedIndexes.push(Number(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']));
        }

        expect(host.fetchedAt).toStrictEqual([CURSOR_PAGE_SIZE, CURSOR_PAGE_SIZE * 2, CURSOR_PAGE_SIZE * 3]);
        expect(host.rows()).toHaveLength(CURSOR_PAGE_SIZE * 4);
        expect(firstMountedIndexes).toStrictEqual([...firstMountedIndexes].sort((left, right) => left - right));
        expect(firstMountedIndexes[0]).toBeGreaterThan(0);

        fixture.destroy();
      });
    });

    describe('WHEN: the container replaces the pages with a shorter result', () => {
      it('THEN: it emits the reset window so the handler can fetch again', async () => {
        const fixture = TestBed.createComponent(CursorFetchHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, CURSOR_PAGE_SIZE * 40 - 200);

        const eventsBeforeReplacement = host.rangeEvents.length;

        // Truncation, not an append: the reader is sent back to the first row.
        host.rows.set(buildRows(CURSOR_PAGE_SIZE / 2));
        await fixture.whenStable();

        expect(host.rangeEvents.length).toBeGreaterThan(eventsBeforeReplacement);
        expect(host.rangeEvents.at(-1)?.startIndex).toBe(0);
        expect(region.scrollTop).toBe(0);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a virtualized table beside an independent ordinary table', () => {
    describe('WHEN: the virtualized data is replaced while the ordinary table holds focus', () => {
      it('THEN: it leaves the other table focus untouched', async () => {
        const fixture = TestBed.createComponent(DualTableHost);

        await fixture.whenStable();

        const virtualHost = fixture.debugElement.query(By.directive(VirtualTableHost)).componentInstance as VirtualTableHost;
        const foreignCell = queryRequired<HTMLElement>(
          fixture,
          'test-ordinary-table-host tbody tr[data-row-index="0"] [ngGridCell][data-column-id="region"]'
        );

        foreignCell.focus();
        virtualHost.rows.set(buildRows(120));
        await fixture.whenStable();

        expect(document.activeElement).toBe(foreignCell);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a mounted window far beyond a shrunken row model', () => {
    describe('WHEN: the row count collapses below the mounted window', () => {
      it('THEN: it clamps the window instead of mounting every remaining row', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 39_840);

        expect(Number(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex'])).toBeGreaterThan(900);

        host.rows.set(buildRows(50));
        await fixture.whenStable();

        const mountedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');

        expect(mountedRows.length).toBeGreaterThan(0);
        expect(mountedRows.length).toBeLessThan(30);
        expect(mountedRows.every((row) => Number(row.dataset['rowIndex']) < 50)).toBe(true);

        fixture.destroy();
      });
    });
  });
});
