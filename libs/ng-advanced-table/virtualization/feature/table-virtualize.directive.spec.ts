/* eslint-disable max-lines -- end-to-end directive contract: real virtualizer, DOM windowing, ARIA, focus, metrics, and pagination. */
import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTable, NatTableService } from 'ng-advanced-table';
import type { NatTableDataStatus, NatTableRowActivateEvent, NatTableRowRenderedEvent } from 'ng-advanced-table';

import { NatTableVirtualize } from './table-virtualize.directive';
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
      [dataStatus]="dataStatus()"
      [emitRowRenderEvents]="true"
      [natTableVirtualize]="options()"
      accessibleName="Virtual operations"
      (rowActivate)="onRowActivate($event)"
      (rowRendered)="onRowRendered($event)" />
  `
})
class VirtualTableHost {
  public readonly rows = signal<Row[]>(buildRows(1000));
  public readonly dataStatus = signal<NatTableDataStatus>('success');
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
      [caption]="caption()"
      [columns]="columns"
      [data]="rows"
      [natTableVirtualize]="{ rowHeight: 40, overscan: 2 }"
      accessibleName="Virtual capacity planning" />
  `
})
class VirtualGeometryHost {
  public readonly caption = signal<string | undefined>('Virtual capacity planning');
  private readonly service = inject(NatTableService);
  protected readonly rows = buildRows(1000);
  protected readonly columns = columns;

  public setStickyHeader(stickyHeader: boolean): void {
    this.service.patchState({ stickyHeader });
  }
}

@Component({
  selector: 'test-async-unbounded-virtual-table-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  template: `
    <nat-table
      [columns]="columns"
      [data]="rows()"
      [natTableVirtualize]="{ rowHeight: 40, overscan: 2 }"
      accessibleName="Asynchronous unbounded operations"
      class="unbounded-virtual-table" />
  `
})
class AsyncUnboundedVirtualTableHost {
  public readonly rows = signal<Row[]>(buildRows(5));
  protected readonly columns = columns;
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
      [natTableVirtualize]="{ rowHeight: 40, overscan: 2 }"
      accessibleName="Grouped virtual operations"
      subHeaderColumn="status" />
  `
})
class SubHeaderVirtualTableHost {
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

const isTableRegion = (element: Element): element is HTMLElement =>
  element instanceof HTMLElement && element.dataset['testid'] === 'nat-table-region';

let unboundedTableRegionExpanded = true;

// eslint-disable-next-line complexity -- test geometry distinguishes region identity, host mode, and simulated resize state.
const isUnboundedTableRegion = (element: Element): boolean => {
  if (!unboundedTableRegionExpanded || !isTableRegion(element)) {
    return false;
  }

  return element.closest('nat-table')?.classList.contains('unbounded-virtual-table') === true;
};

const getRegionHeight = (element: Element): number => {
  if (!isTableRegion(element)) {
    return 0;
  }

  return isUnboundedTableRegion(element) ? 4040 : 200;
};

const getRegionWidth = (element: Element): number => (isTableRegion(element) ? 800 : 0);

const getRegionScrollHeight = (element: Element): number => {
  if (!isTableRegion(element)) {
    return 0;
  }

  return isUnboundedTableRegion(element) ? 4040 : 40_040;
};

// eslint-disable-next-line complexity -- shared geometry fixture maps the five native table elements measured by virtualization.
const getTestRect = (element: Element): DOMRect => {
  const hasCaption = element.closest('table')?.querySelector('caption') !== null;

  if (element.matches('[data-testid="nat-table-region"]')) {
    return rect(800, 200);
  }

  if (element.matches('caption')) {
    return rect(800, 32);
  }

  if (element.matches('thead')) {
    return rect(800, 40, hasCaption ? 32 : 0);
  }

  if (element.matches('tbody')) {
    return rect(800, 40_000, hasCaption ? 72 : 40);
  }

  if (element.matches('tr.data-row')) {
    return rect(800, 40);
  }

  return rect(0, 0);
};

const resolveScrollTop = (current: number, options: ScrollToOptions | number, y?: number): number => {
  const requested = typeof options === 'number' ? y : options.top;

  return requested ?? current;
};

const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');

describe('FEATURE: opt-in NatTable row virtualization', () => {
  beforeEach(async () => {
    unboundedTableRegionExpanded = true;

    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return getRegionHeight(this);
    });

    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (this: Element) {
      return getRegionWidth(this);
    });

    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return getRegionHeight(this);
    });

    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return getRegionWidth(this);
    });

    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(function (this: Element) {
      return getRegionScrollHeight(this);
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
        AsyncUnboundedVirtualTableHost,
        OrdinaryTableHost,
        PaginatedVirtualTableHost,
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

    describe('WHEN: Command Home is pressed from a scrolled body row', () => {
      it('THEN: it focuses the first logical grid cell', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const mountedCell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]');

        mountedCell.focus();
        mountedCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', metaKey: true, bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(document.activeElement).toBe(queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="name"]'));

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

    describe('WHEN: Page Down is pressed below a caption and sticky header', () => {
      it('THEN: it advances by the body rows visible below both pieces of table chrome', async () => {
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

    describe('WHEN: Page Down is pressed below a non-sticky header', () => {
      it('THEN: it excludes the visible header from the first body page', async () => {
        const fixture = TestBed.createComponent(VirtualGeometryHost);
        const host = fixture.componentInstance;

        host.caption.set(undefined);
        host.setStickyHeader(false);
        await fixture.whenStable();

        const firstCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="0"] [data-column-id="region"]');

        firstCell.focus();
        firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true }));
        await fixture.whenStable();

        expect(document.activeElement).toBe(
          queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="4"] [data-column-id="region"]')
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

    describe('WHEN: data is replaced while a scrolled body cell is focused', () => {
      it('THEN: it restores the surviving row and column by stable identity', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]');
        const focusedRowId = focusedCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId'];

        focusedCell.focus();
        host.rows.set(buildRows(120));
        await fixture.whenStable();

        const restoredCell = document.activeElement as HTMLElement;

        expect(restoredCell.dataset['columnId']).toBe('region');
        expect(restoredCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId']).toBe(focusedRowId);

        fixture.destroy();
      });
    });

    describe('WHEN: filter state changes without changing the resulting row IDs', () => {
      it('THEN: it resets the virtual range while preserving focused row and column identity', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const rowIdsBeforeFilter = table.table.getRowModel().rows.map((row) => row.id);
        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]');
        const focusedRowId = focusedCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId'];

        focusedCell.focus();
        table.table.setColumnFilters([{ id: 'status', value: ['Healthy', 'Pending', 'Alert'] }]);
        await fixture.whenStable();

        const restoredCell = document.activeElement as HTMLElement;

        expect(table.table.getRowModel().rows.map((row) => row.id)).toStrictEqual(rowIdsBeforeFilter);
        expect(restoredCell.dataset['columnId']).toBe('region');
        expect(restoredCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId']).toBe(focusedRowId);

        fixture.destroy();
      });
    });

    describe('WHEN: sorting moves the focused row to a different logical index', () => {
      // eslint-disable-next-line complexity -- behavior spec verifies DOM focus plus stable row and column identity after sorting.
      it('THEN: it restores focus to the same stable row and column at its new index', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]');
        const focusedRowId = focusedCell.closest<HTMLTableRowElement>('tr')?.dataset['rowId'];

        focusedCell.focus();
        table.table.setSorting([{ id: 'name', desc: true }]);
        await fixture.whenStable();

        const restoredCell = document.activeElement as HTMLElement;
        const restoredRow = restoredCell.closest<HTMLTableRowElement>('tr');
        const expectedIndex = table.table.getRowModel().rows.findIndex((row) => row.id === focusedRowId);

        expect(restoredCell.dataset['columnId']).toBe('region');
        expect(restoredRow?.dataset['rowId']).toBe(focusedRowId);
        expect(restoredRow?.dataset['rowIndex']).toBe(String(expectedIndex));

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

        region.scrollTop = 2000;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

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
      it('THEN: it renders the empty-state row and moves focus to its mounted grid cell', async () => {
        const fixture = TestBed.createComponent(VirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();
        queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]').focus();

        host.rows.set([]);
        await fixture.whenStable();

        expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
        expect(queryAll(fixture, 'tbody tr.virtual-spacer-row')).toHaveLength(0);
        expect(queryRequired(fixture, 'tbody tr').getAttribute('aria-rowindex')).toBe('2');
        expect(queryRequired(fixture, 'table').getAttribute('aria-rowcount')).toBe('2');
        expect(document.activeElement).toBe(queryRequired(fixture, 'tbody [ngGridCell]'));

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
  });

  describe('GIVEN: virtualization composed with automatic pagination', () => {
    describe('WHEN: the table advances to the next page', () => {
      it('THEN: it virtualizes the page-local row model and moves focus to the first new row', async () => {
        const fixture: ComponentFixture<PaginatedVirtualTableHost> = TestBed.createComponent(PaginatedVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

        region.scrollTop = 160;
        region.dispatchEvent(new Event('scroll'));
        await fixture.whenStable();

        queryRequired<HTMLElement>(fixture, 'tbody tr.data-row [data-column-id="region"]').focus();
        table.table.nextPage();
        await fixture.whenStable();

        const firstRow = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
        const focusedCell = document.activeElement as HTMLElement;

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableElement>(fixture, 'table').getAttribute('aria-rowcount')).toBe('11');
        expect(firstRow.dataset['rowIndex']).toBe('0');
        expect(firstRow.getAttribute('aria-rowindex')).toBe('2');
        expect(firstRow.textContent).toContain('Service 11');
        expect(focusedCell.dataset['columnId']).toBe('region');
        expect(focusedCell.closest<HTMLTableRowElement>('tr')?.dataset['rowIndex']).toBe('0');

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: virtualization combined with sub-header rows', () => {
    describe('WHEN: both subHeaderColumn and natTableVirtualize are configured', () => {
      it('THEN: it warns that the combination is unsupported', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture: ComponentFixture<SubHeaderVirtualTableHost> = TestBed.createComponent(SubHeaderVirtualTableHost);

        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('does not support sub-header rows'));

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: an unbounded virtual table that initially has a small asynchronous dataset', () => {
    describe('WHEN: the dataset grows beyond the bootstrap window', () => {
      it('THEN: it warns once after the large row model renders', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(AsyncUnboundedVirtualTableHost);
        const host = fixture.componentInstance;
        const boundedWarnings = (): unknown[][] =>
          warn.mock.calls.filter(([message]) => String(message).includes('requires a bounded table region'));

        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(0);

        host.rows.set(buildRows(100));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        host.rows.set(buildRows(120));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        fixture.destroy();
      });
    });

    describe('WHEN: a large row model becomes unbounded after the region resizes', () => {
      it('THEN: it revalidates the new geometry and still warns only once', async () => {
        const resizeCallbacks: ResizeObserverCallback[] = [];
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const boundedWarnings = (): unknown[][] =>
          warn.mock.calls.filter(([message]) => String(message).includes('requires a bounded table region'));

        class TestResizeObserver {
          private readonly observed = new Set<Element>();

          public constructor(callback: ResizeObserverCallback) {
            resizeCallbacks.push(callback);
          }

          public observe(target: Element): void {
            this.observed.add(target);
          }

          public unobserve(target: Element): void {
            this.observed.delete(target);
          }

          public disconnect(): void {
            this.observed.clear();
          }
        }

        vi.stubGlobal('ResizeObserver', TestResizeObserver);
        unboundedTableRegionExpanded = false;

        const fixture = TestBed.createComponent(AsyncUnboundedVirtualTableHost);
        const host = fixture.componentInstance;

        host.rows.set(buildRows(100));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(0);

        unboundedTableRegionExpanded = true;
        resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver));
        await fixture.whenStable();

        expect(boundedWarnings()).toHaveLength(1);

        fixture.destroy();
      });
    });
  });
});
