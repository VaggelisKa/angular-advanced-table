/* eslint-disable max-lines -- remote windowing directive contract: extent, placeholders, window fills, resets, focus, and development diagnostics against the real engine. */
import { Component, DestroyRef, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTable, NatTableRowPlaceholderTemplate, NatTableService } from 'ng-advanced-table';

import { NatTableVirtualize } from './table-virtualize.directive';
import type { NatTableVirtualRangeChange } from '../common/table-virtualization.type';
import { buildRowWindow, buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll, queryRequired } from '../test-helpers/table-dom.helper';

const REMOTE_TOTAL = 100_000;
const WINDOW_SIZE = 100;
const ROW_HEIGHT = 40;

const stableRowId = (row: Row): string => row.id;

@Component({
  selector: 'test-remote-virtual-table-host',
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
      [getRowId]="rowId"
      [natTableVirtualize]="{ rowHeight: 40 }"
      [remoteRowCount]="remoteRowCount()"
      [rowWindowOffset]="offset()"
      accessibleName="Remote operations"
      (virtualRangeChange)="rangeEvents.push($event)" />
  `
})
class RemoteVirtualTableHost {
  public readonly rowId = stableRowId;
  public readonly rows = signal<Row[]>(buildRowWindow(0, WINDOW_SIZE));
  public readonly offset = signal(0);
  public readonly remoteRowCount = signal<number | undefined>(REMOTE_TOTAL);
  public readonly rangeEvents: NatTableVirtualRangeChange[] = [];
  protected readonly columns = columns;
}

@Component({
  selector: 'test-remote-placeholder-template-host',
  imports: [NatTable, NatTableRowPlaceholderTemplate, NatTableVirtualize],
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
      [getRowId]="rowId"
      [natTableVirtualize]="{ rowHeight: 40 }"
      [remoteRowCount]="remoteRowCount"
      accessibleName="Templated remote operations">
      <ng-template let-column="column" let-logicalIndex natTableRowPlaceholder>
        <span class="test-skeleton">{{ logicalIndex }}:{{ column.id }}</span>
      </ng-template>
    </nat-table>
  `
})
class RemotePlaceholderTemplateHost {
  public readonly rowId = stableRowId;
  public readonly remoteRowCount = REMOTE_TOTAL;
  public readonly rows = signal<Row[]>(buildRowWindow(0, WINDOW_SIZE));
  protected readonly columns = columns;
}

@Component({
  selector: 'test-remote-client-modes-host',
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
      [getRowId]="rowId"
      [natTableVirtualize]="{ rowHeight: 40 }"
      [remoteRowCount]="remoteRowCount"
      accessibleName="Client-transformed remote operations"
      subHeaderColumn="status" />
  `
})
class RemoteClientModesHost {
  public readonly rowId = stableRowId;
  public readonly remoteRowCount = REMOTE_TOTAL;
  protected readonly rows = buildRowWindow(0, WINDOW_SIZE);
  protected readonly columns = columns;

  public constructor() {
    const service = inject(NatTableService);
    const destroyRef = inject(DestroyRef);

    service.enableSorting.set(true);
    service.registerPagination();
    service.registerSearch();
    destroyRef.onDestroy(() => {
      service.unregisterPagination();
      service.unregisterSearch();
    });
  }
}

// Mutable so individual tests can adjust the scrollable overflow; reset before each test.
const geometry = { regionClientHeight: 200, regionScrollHeight: 4_000_400 };

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

const getBodyTestRect = (element: Element): DOMRect | null => {
  if (!element.matches('tbody')) {
    return null;
  }

  const region = element.closest<HTMLElement>('[data-testid="nat-table-region"]');

  return rect(800, 4_000_000, 40 - (region?.scrollTop ?? 0));
};

const testRects = [
  { selector: '[data-testid="nat-table-region"]', value: (): DOMRect => rect(800, geometry.regionClientHeight) },
  { selector: 'thead', value: (): DOMRect => rect(800, 40) },
  { selector: 'tr.data-row', value: (): DOMRect => rect(800, 40) }
] as const;

const getTestRect = (element: Element): DOMRect => {
  const bodyRect = getBodyTestRect(element);

  if (bodyRect) {
    return bodyRect;
  }

  const match = testRects.find(({ selector }) => element.matches(selector));

  return match?.value() ?? rect(0, 0);
};

const resolveScrollTop = (current: number, options: ScrollToOptions | number, y?: number): number => {
  const requested = typeof options === 'number' ? y : options.top;

  return requested ?? current;
};

const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');

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

describe('FEATURE: remote windowing for NatTable row virtualization', () => {
  beforeEach(async () => {
    geometry.regionClientHeight = 200;
    geometry.regionScrollHeight = 4_000_400;

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
      imports: [RemoteClientModesHost, RemotePlaceholderTemplateHost, RemoteVirtualTableHost],
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

  describe('GIVEN: the virtualize directive with remoteRowCount omitted', () => {
    describe('WHEN: one thousand loaded rows render and scroll', () => {
      it('THEN: it keeps the loaded row model as the full extent with no placeholder slots', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        host.remoteRowCount.set(undefined);
        host.rows.set(buildRows(1000));
        await fixture.whenStable();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        expect(table.getAttribute('aria-rowcount')).toBe('1001');
        expect(queryAll(fixture, '[data-testid="nat-table-row-placeholder"]')).toHaveLength(0);

        await scrollRegion(fixture, region, 2000);

        expect(queryAll(fixture, '[data-testid="nat-table-row-placeholder"]')).toHaveLength(0);
        expect(queryAll(fixture, 'tbody tr.data-row').every((row) => row.hasAttribute('data-row-id'))).toBe(true);
        expect(warn).not.toHaveBeenCalled();

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a remote extent of one hundred thousand rows holding only its first window', () => {
    describe('WHEN: the initial window renders', () => {
      it('THEN: it spans the remote extent while mounting only loaded rows', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);

        await fixture.whenStable();

        const table = queryRequired<HTMLTableElement>(fixture, 'table');
        const spacers = queryAll<HTMLElement>(fixture, 'tbody .virtual-spacer-cell');
        const mountedRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row');

        expect(table.getAttribute('aria-rowcount')).toBe(String(REMOTE_TOTAL + 1));
        expect(mountedRows.length).toBeLessThan(30);
        expect(mountedRows.every((row) => row.hasAttribute('data-row-id'))).toBe(true);
        // The trailing spacer carries the unfetched remainder of the extent.
        expect(Number.parseFloat(spacers.at(-1)?.style.height ?? '0')).toBe(
          REMOTE_TOTAL * ROW_HEIGHT - mountedRows.length * ROW_HEIGHT
        );
        expect(warn).not.toHaveBeenCalled();

        fixture.destroy();
      });
    });

    describe('WHEN: the reader drags the scrollbar far beyond the loaded window', () => {
      it('THEN: it mounts busy placeholder rows with absolute ARIA positions and reports the remote range', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        const placeholderRows = queryAll<HTMLTableRowElement>(fixture, '[data-testid="nat-table-row-placeholder"]');
        const firstPlaceholder = placeholderRows[0];
        const firstIndex = Number(firstPlaceholder.dataset['rowIndex']);
        const lastRange = host.rangeEvents.at(-1) as NatTableVirtualRangeChange;

        expect(placeholderRows.length).toBeGreaterThan(0);
        expect(placeholderRows.length).toBeLessThan(30);
        expect(queryAll(fixture, 'tbody tr.data-row[data-row-id]')).toHaveLength(0);
        expect(firstIndex).toBeGreaterThan(4900);
        expect(firstPlaceholder.getAttribute('aria-busy')).toBe('true');
        expect(firstPlaceholder.getAttribute('aria-rowindex')).toBe(String(firstIndex + 2));
        expect(firstPlaceholder.querySelectorAll('td[ngGridCell][data-column-id]')).toHaveLength(columns.length);
        // Position-free by design: aria-rowindex above already announces the
        // position, so the text adds only the loading state.
        expect(firstPlaceholder.querySelector('.sr-only')?.textContent).toBe('Loading.');
        // The mounted range is reported in remote coordinates.
        expect(lastRange.startIndex).toBeGreaterThan(WINDOW_SIZE);
        expect(lastRange.endIndex).toBeLessThan(REMOTE_TOTAL);
        expect(lastRange.count).toBeGreaterThan(0);

        fixture.destroy();
      });
    });

    describe('WHEN: the loaded window is replaced at the position the reader scrolled to', () => {
      it('THEN: it fills the placeholders in place without resetting the scroll position', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        const mountedIndexes = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row').map((row) =>
          Number(row.dataset['rowIndex'])
        );

        host.rows.set(buildRowWindow(4950, WINDOW_SIZE));
        host.offset.set(4950);
        await fixture.whenStable();

        const filledRows = queryAll<HTMLTableRowElement>(fixture, 'tbody tr.data-row[data-row-id]');

        expect(region.scrollTop).toBe(5000 * ROW_HEIGHT);
        expect(queryAll(fixture, '[data-testid="nat-table-row-placeholder"]')).toHaveLength(0);
        expect(filledRows.map((row) => Number(row.dataset['rowIndex']))).toStrictEqual(mountedIndexes);
        expect(filledRows[0]?.dataset['rowId']).toBe(`svc-${String(mountedIndexes[0] + 1).padStart(7, '0')}`);

        fixture.destroy();
      });
    });

    describe('WHEN: filter state changes while the reader is deep in the extent', () => {
      it('THEN: it still resets the window because the row model was genuinely rebuilt', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
        const table = queryRequired(fixture, 'nat-table');

        void table;

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        const natTable = fixture.debugElement.children[0].componentInstance as NatTable<Row>;

        natTable.table.setColumnFilters([{ id: 'status', value: ['Healthy', 'Pending', 'Alert'] }]);
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);

        fixture.destroy();
      });
    });

    describe('WHEN: the remote total itself changes', () => {
      it('THEN: it resets the window because the extent was rebuilt', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        host.remoteRowCount.set(50_000);
        await fixture.whenStable();

        expect(region.scrollTop).toBe(0);
        expect(queryRequired<HTMLTableElement>(fixture, 'table').getAttribute('aria-rowcount')).toBe('50001');

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a natTableRowPlaceholder template projected into the remote table', () => {
    describe('WHEN: unfetched slots mount', () => {
      it('THEN: it renders the template once per placeholder cell with the logical index and column', async () => {
        const fixture = TestBed.createComponent(RemotePlaceholderTemplateHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        const firstPlaceholder = queryRequired<HTMLTableRowElement>(fixture, '[data-testid="nat-table-row-placeholder"]');
        const firstIndex = Number(firstPlaceholder.dataset['rowIndex']);
        const skeletons = [...firstPlaceholder.querySelectorAll('.test-skeleton')];

        expect(skeletons.map((skeleton) => skeleton.textContent)).toStrictEqual(
          ['name', 'region', 'status', 'throughput'].map((columnId) => `${firstIndex}:${columnId}`)
        );

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: keyboard navigation over unfetched remote slots', () => {
    describe('WHEN: Control End targets the final logical row of the remote extent', () => {
      it('THEN: it mounts and focuses the final placeholder cell instead of trapping or crashing', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);

        await fixture.whenStable();

        const firstHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="name"]');

        firstHeader.focus();
        firstHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', ctrlKey: true, bubbles: true, cancelable: true }));
        await fixture.whenStable();

        const finalCell = queryRequired<HTMLElement>(
          fixture,
          `tbody tr[data-row-index="${REMOTE_TOTAL - 1}"] [ngGridCell][data-column-id="throughput"]`
        );

        expect(document.activeElement).toBe(finalCell);
        expect(finalCell.closest('tr')?.dataset['testid']).toBe('nat-table-row-placeholder');
        expect(finalCell.closest('tr')?.getAttribute('aria-rowindex')).toBe(String(REMOTE_TOTAL + 1));

        fixture.destroy();
      });
    });

    describe('WHEN: Arrow Up leaves the mounted window from a placeholder cell', () => {
      it('THEN: it mounts and focuses the previous logical placeholder in the same column', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        const topPlaceholder = queryRequired<HTMLTableRowElement>(fixture, '[data-testid="nat-table-row-placeholder"]');
        const topIndex = Number(topPlaceholder.dataset['rowIndex']);
        const topCell = topPlaceholder.querySelector<HTMLElement>('[ngGridCell][data-column-id="region"]') as HTMLElement;

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

    describe('WHEN: the loaded window arrives for the slot a focused placeholder occupied', () => {
      it('THEN: it moves focus onto the fetched row cell in the same column', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const region = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');

        await scrollRegion(fixture, region, 5000 * ROW_HEIGHT);

        const placeholder = queryRequired<HTMLTableRowElement>(fixture, '[data-testid="nat-table-row-placeholder"]');
        const logicalIndex = Number(placeholder.dataset['rowIndex']);
        const placeholderCell = placeholder.querySelector<HTMLElement>('[ngGridCell][data-column-id="region"]') as HTMLElement;

        placeholderCell.focus();
        host.rows.set(buildRowWindow(4950, WINDOW_SIZE));
        host.offset.set(4950);
        await fixture.whenStable();

        const fetchedCell = queryRequired<HTMLElement>(
          fixture,
          `tbody tr[data-row-id][data-row-index="${logicalIndex}"] [ngGridCell][data-column-id="region"]`
        );

        expect(document.activeElement).toBe(fetchedCell);
        expect(region.scrollTop).toBe(5000 * ROW_HEIGHT);

        fixture.destroy();
      });
    });

    describe('WHEN: a window fill removes the loaded row a cell focus was on', () => {
      it('THEN: it keeps focus on the same logical slot as a placeholder cell', async () => {
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        const focusedCell = queryRequired<HTMLElement>(fixture, 'tbody tr[data-row-index="5"] [ngGridCell][data-column-id="region"]');

        focusedCell.focus();
        // The reader's app jumps its window far away; logical slot 5 is no
        // longer loaded and its row id vanished from the model.
        host.rows.set(buildRowWindow(5000, WINDOW_SIZE));
        host.offset.set(5000);
        await fixture.whenStable();

        const placeholderCell = queryRequired<HTMLElement>(
          fixture,
          'tbody tr[data-row-index="5"] [ngGridCell][data-column-id="region"]'
        );

        expect(document.activeElement).toBe(placeholderCell);
        expect(placeholderCell.closest('tr')?.dataset['testid']).toBe('nat-table-row-placeholder');

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: development-mode diagnostics for the remote windowing inputs', () => {
    describe('WHEN: the inputs are fractional or negative', () => {
      it('THEN: it warns for each invalid input while ignoring them', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        expect(warn).not.toHaveBeenCalled();

        host.remoteRowCount.set(10.5);
        host.offset.set(-2);
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('remoteRowCount must be a non-negative integer'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('rowWindowOffset must be a non-negative integer'));
        expect(queryAll(fixture, '[data-testid="nat-table-row-placeholder"]')).toHaveLength(0);

        fixture.destroy();
      });
    });

    describe('WHEN: the loaded window does not fit the remote extent', () => {
      it('THEN: it warns for the undersized total and the overflowing offset', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        host.remoteRowCount.set(40);
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('smaller than the 100 loaded rows'));

        host.remoteRowCount.set(REMOTE_TOTAL);
        host.offset.set(REMOTE_TOTAL - 50);
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('exceeds remoteRowCount (100000)'));

        fixture.destroy();
      });
    });

    describe('WHEN: client-side sorting, filtering, pagination, or sub-headers are configured', () => {
      it('THEN: it warns for each unsupported combination and renders no sub-header rows', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteClientModesHost);

        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('remoteRowCount requires manualSorting'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('remoteRowCount requires manualFiltering'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('remoteRowCount requires manualPagination'));
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('sub-header rows are not supported with remoteRowCount'));
        expect(queryAll(fixture, '[data-testid="nat-table-sub-header-row"]')).toHaveLength(0);

        fixture.destroy();
      });
    });

    describe('WHEN: the extent exceeds the browser layout ceiling', () => {
      it('THEN: it warns with the effective maximum row count for the configured row height', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        await fixture.whenStable();

        host.remoteRowCount.set(2_000_000);
        await fixture.whenStable();

        // 16,000,000px ceiling at 40px rows: at most 400,000 reachable rows.
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('Keep remoteRowCount at or below 400000'));

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: an unbounded table region under a remote extent', () => {
    describe('WHEN: the loaded window sits at or below the bootstrap row count', () => {
      it('THEN: it still warns that the region must be bounded, judged by the logical extent', async () => {
        // scrollHeight === clientHeight: the region absorbs its content height,
        // so the window would converge on the whole remote range.
        geometry.regionScrollHeight = 200;

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const fixture = TestBed.createComponent(RemoteVirtualTableHost);
        const host = fixture.componentInstance;

        // Five loaded rows of a hundred-thousand-row extent: the loaded count
        // sits inside the bootstrap suppression band and must not silence the
        // diagnostic that matters most exactly here.
        host.rows.set(buildRowWindow(0, 5));
        await fixture.whenStable();

        expect(warn).toHaveBeenCalledWith(expect.stringContaining('needs a bounded region'));

        fixture.destroy();
      });
    });
  });
});
