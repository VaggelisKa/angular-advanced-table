/* eslint-disable max-lines -- end-to-end directive contract: real virtualizer, DOM windowing, ARIA, focus, metrics, and pagination. */
import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTableVirtualize } from './table-virtualize.directive';
import type { NatTableRowRenderedEvent } from '../common/row-render.type';
import type { NatTableRowActivateEvent } from '../common/row.type';
import { NatTableService } from '../domain-logic/table.service';
import { NatTable } from '../table/table';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';

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
    <nat-table
      [columns]="columns"
      [data]="rows()"
      [emitRowRenderEvents]="true"
      [natTableVirtualize]="options()"
      accessibleName="Virtual operations"
      (rowActivate)="onRowActivate($event)"
      (rowRendered)="onRowRendered($event)" />
  `
})
class VirtualTableHost {
  public readonly rows = signal<Row[]>(buildRows(1000));
  public readonly options = signal({ rowHeight: 40, overscan: 2 });
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
  selector: 'test-ordinary-table-host',
  imports: [NatTable],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Ordinary operations" />`
})
class OrdinaryTableHost {
  protected readonly rows = buildRows(100);
  protected readonly columns = columns;
}

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
      [natTableVirtualize]="{ rowHeight: 40, overscan: 2 }"
      accessibleName="Paginated virtual operations" />
  `
})
class PaginatedVirtualTableHost {
  protected readonly rows = buildRows(100);
  protected readonly columns = columns;
}

const rect = (width: number, height: number, top = 0): DOMRect => ({
  x: 0,
  y: top,
  left: 0,
  top,
  right: width,
  bottom: top + height,
  width,
  height,
  toJSON: () => ({})
});

const testRects = [
  { selector: '[data-testid="nat-table-region"]', value: rect(800, 200) },
  { selector: 'thead', value: rect(800, 40) },
  { selector: 'tbody', value: rect(800, 40_000, 40) },
  { selector: 'tr.data-row', value: rect(800, 40) }
] as const;

const getRegionDimension = (element: Element, value: number): number =>
  element instanceof HTMLElement && element.dataset['testid'] === 'nat-table-region' ? value : 0;

const getTestRect = (element: Element): DOMRect => {
  const match = testRects.find(({ selector }) => element.matches(selector));

  return match ? match.value : rect(0, 0);
};

const resolveScrollTop = (current: number, options: ScrollToOptions | number, y?: number): number => {
  const requested = typeof options === 'number' ? y : options.top;

  return requested ?? current;
};

const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');

describe('FEATURE: opt-in NatTable row virtualization', () => {
  beforeEach(async () => {
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return getRegionDimension(this, 200);
    });

    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return getRegionDimension(this, 800);
    });

    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return getRegionDimension(this, 200);
    });

    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return getRegionDimension(this, 800);
    });

    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
      return getRegionDimension(this, 40_040);
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
      imports: [OrdinaryTableHost, PaginatedVirtualTableHost, VirtualTableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();

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

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const spacers = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.virtual-spacer-row');
        const firstRow = renderedRows[0];

        expect(renderedRows.length).toBeGreaterThan(0);
        expect(renderedRows.length).toBeLessThan(30);
        expect(spacers.length).toBeGreaterThan(0);
        expect(table.getAttribute('aria-rowcount')).toBe('1001');
        expect(queryRequired(fixture, 'thead tr').getAttribute('aria-rowindex')).toBe('1');
        expect(queryRequired(fixture, 'p[id$="-summary"]').textContent).toContain('1,000');
        expect(firstRow.getAttribute('aria-rowindex')).toBe(String(Number(firstRow.dataset['rowIndex']) + 2));
        expect(spacers.every((spacer) => spacer.getAttribute('aria-hidden') === 'true')).toBe(true);
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

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const renderedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const firstIndex = Number(renderedRows[0]?.dataset['rowIndex']);

        expect(firstIndex).toBeGreaterThan(40);
        expect(renderedRows.length).toBeLessThan(30);
        expect(renderedRows[0]?.getAttribute('aria-rowindex')).toBe(String(firstIndex + 2));

        fixture.destroy();
      });
    });

    describe('WHEN: Control End targets a row outside the mounted window', () => {
      it('THEN: it mounts and focuses the final logical row and column', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

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

    describe('WHEN: data is replaced after scrolling', () => {
      it('THEN: it resets the virtual range and scroll position', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        host.rows.set(buildRows(120));
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: filter state changes without changing the resulting row IDs', () => {
      it('THEN: it still resets the virtual range and scroll position', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const rowIdsBeforeFilter = table.table.getRowModel().rows.map((row) => row.id);

        table.table.setColumnFilters([{ id: 'status', value: ['Healthy', 'Pending', 'Alert'] }]);
        await fixture.whenStable();

        expect(table.table.getRowModel().rows.map((row) => row.id)).toStrictEqual(rowIdsBeforeFilter);
        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row').dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });

    describe('WHEN: a row in a scrolled window is activated', () => {
      it('THEN: it emits the stable logical TanStack row identity', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const row = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');

        row.click();

        expect(host.rowActivateEvents.at(-1)?.row.id).toBe(row.dataset['rowId']);

        fixture.destroy();
      });
    });

    describe('WHEN: the mounted range changes with row metrics enabled', () => {
      it('THEN: it starts a new render cycle for the newly mounted window', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const initialToken = Math.max(...host.rowRenderedEvents.map((event) => event.renderToken));
        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        host.rowRenderedEvents.length = 0;
        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        expect(host.rowRenderedEvents.length).toBeGreaterThan(0);
        expect(host.rowRenderedEvents.every((event) => event.renderToken > initialToken)).toBe(true);

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
  });

  describe('GIVEN: virtualization composed with automatic pagination', () => {
    describe('WHEN: the table advances to the next page', () => {
      it('THEN: it virtualizes the final page-local row model and resets its row indices', async () => {
        const fixture: ComponentFixture<PaginatedVirtualTableHost> = TestBed.createComponent(PaginatedVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        region.scrollTop = 160;
        region.dispatchEvent(new Event('scroll'));
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
});
