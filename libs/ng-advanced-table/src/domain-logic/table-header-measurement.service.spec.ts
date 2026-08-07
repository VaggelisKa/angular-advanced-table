import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type { ColumnDef } from '@tanstack/angular-table';
import { afterEach, vi } from 'vitest';

import { NatTableState } from './table.state';
import { NatTable } from '../table/table';
import { buildRows } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

/**
 * jsdom ships no `ResizeObserver`, so the production guard
 * (`typeof ResizeObserver === 'undefined'`) short-circuits the whole measurement
 * path under test unless we install one. This fake records what it observes and
 * exposes a manual `trigger()` so a spec can drive a resize deterministically
 * instead of waiting on layout that jsdom never performs.
 */
class FakeResizeObserver {
  public static instances: FakeResizeObserver[] = [];

  public readonly observed = new Set<Element>();
  public disconnectCount = 0;

  public constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  public observe(target: Element): void {
    this.observed.add(target);
  }

  public unobserve(target: Element): void {
    this.observed.delete(target);
  }

  public disconnect(): void {
    this.disconnectCount += 1;
    this.observed.clear();
  }

  public trigger(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

/** jsdom returns 0 for every box measurement; pin a real width onto one cell. */
const stubCellWidth = (cell: HTMLElement, width: number): void => {
  vi.spyOn(cell, 'getBoundingClientRect').mockReturnValue({ width } as DOMRect);
};

const stubClientWidth = (element: HTMLElement, width: number): void => {
  Object.defineProperty(element, 'clientWidth', { value: width, configurable: true });
};

@Component({
  selector: 'test-header-measurement-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows" accessibleName="Header measurement table" />
    </nat-table-surface>
  `
})
class HeaderMeasurementHost {
  protected readonly rows = buildRows(2);
  protected readonly columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: 'name', header: 'Service', meta: { label: 'Service', rowHeader: true } },
    { accessorKey: 'region', header: 'Region', meta: { label: 'Region' } }
  ];
}

const renderTable = async (): Promise<{
  state: NatTableState<Row>;
  region: HTMLElement;
  headerCells: HTMLTableCellElement[];
}> => {
  const fixture = TestBed.createComponent(HeaderMeasurementHost);

  await fixture.whenStable();

  const tableDebugElement = fixture.debugElement.query(By.directive(NatTable));
  const state = tableDebugElement.injector.get<NatTableState<Row>>(NatTableState);
  const region = state.tableRegionRef()?.nativeElement as HTMLElement;
  const headerCells = Array.from(region.querySelectorAll<HTMLTableCellElement>('thead th[data-column-id]'));

  return { state, region, headerCells };
};

describe('FEATURE: NatTable header measurement', () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(async () => {
    FakeResizeObserver.instances = [];
    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;

    await TestBed.configureTestingModule({
      imports: [HeaderMeasurementHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    vi.restoreAllMocks();
  });

  describe('GIVEN: a rendered table whose header cells report widths', () => {
    describe('WHEN: the resize observer reports a layout change', () => {
      it('THEN: it writes each header width back to the store keyed by column id', async () => {
        const { state, region, headerCells } = await renderTable();

        stubCellWidth(headerCells[0], 180);
        stubCellWidth(headerCells[1], 120);
        stubClientWidth(region, 640);

        FakeResizeObserver.instances.at(-1)?.trigger();

        expect(state.measuredHeaderWidths()).toStrictEqual({
          [headerCells[0].dataset['columnId'] as string]: 180,
          [headerCells[1].dataset['columnId'] as string]: 120
        });
      });
    });

    describe('WHEN: the observed region reports a positive viewport width', () => {
      it('THEN: it records the region viewport width on the store', async () => {
        const { state, region, headerCells } = await renderTable();

        stubCellWidth(headerCells[0], 180);
        stubClientWidth(region, 512);

        FakeResizeObserver.instances.at(-1)?.trigger();

        expect(state.regionViewportWidth()).toBe(512);
      });
    });

    describe('WHEN: a later resize reports identical widths', () => {
      it('THEN: it leaves the stored widths object identical so downstream computeds do not recompute', async () => {
        const { state, region, headerCells } = await renderTable();

        stubCellWidth(headerCells[0], 180);
        stubCellWidth(headerCells[1], 120);
        stubClientWidth(region, 640);

        const observer = FakeResizeObserver.instances.at(-1);

        observer?.trigger();

        const firstWidths = state.measuredHeaderWidths();

        observer?.trigger();

        expect(state.measuredHeaderWidths()).toBe(firstWidths);
      });
    });

    describe('WHEN: the region reports a zero viewport width', () => {
      it('THEN: it keeps the previous viewport width rather than storing zero', async () => {
        const { state, region, headerCells } = await renderTable();

        stubCellWidth(headerCells[0], 180);
        stubClientWidth(region, 480);

        const observer = FakeResizeObserver.instances.at(-1);

        observer?.trigger();
        stubClientWidth(region, 0);
        observer?.trigger();

        expect(state.regionViewportWidth()).toBe(480);
      });
    });
  });

  describe('GIVEN: a rendered table being observed', () => {
    describe('WHEN: the observer is attached', () => {
      it('THEN: it observes the table region alongside every identified header cell', async () => {
        const { region, headerCells } = await renderTable();
        const observer = FakeResizeObserver.instances.at(-1);

        expect(observer?.observed.has(region)).toBe(true);

        for (const cell of headerCells) {
          expect(observer?.observed.has(cell)).toBe(true);
        }
      });
    });

    describe('WHEN: the host component is destroyed', () => {
      it('THEN: it disconnects the observer so no measurement outlives the table', async () => {
        const fixture = TestBed.createComponent(HeaderMeasurementHost);

        await fixture.whenStable();

        const observer = FakeResizeObserver.instances.at(-1);
        const disconnectsBeforeDestroy = observer?.disconnectCount ?? 0;

        fixture.destroy();

        expect(observer?.disconnectCount).toBeGreaterThan(disconnectsBeforeDestroy);
      });
    });
  });

  describe('GIVEN: an environment without ResizeObserver support', () => {
    describe('WHEN: a table renders', () => {
      it('THEN: it renders its header without attempting to observe anything', async () => {
        globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
        FakeResizeObserver.instances = [];

        const { region } = await renderTable();

        expect(FakeResizeObserver.instances).toHaveLength(0);
        expect(region.querySelectorAll('thead th[data-column-id]').length).toBeGreaterThan(0);
      });
    });
  });
});
