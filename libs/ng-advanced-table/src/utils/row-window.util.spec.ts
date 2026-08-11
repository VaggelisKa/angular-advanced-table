import type { Row } from '@tanstack/angular-table';

import { buildFullBodyRenderPlan, buildWindowedBodyRenderPlan, revealCellHorizontally, sanitizeRowIndexes } from './row-window.util';

type TestRowData = { readonly name: string };

const fakeRows = (count: number): Row<TestRowData>[] =>
  Array.from({ length: count }, (_, index) => ({ id: `r${index}` }) as unknown as Row<TestRowData>);

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

const buildFocusRegion = (): { cell: HTMLTableCellElement; region: HTMLElement; table: HTMLTableElement } => {
  const region = document.createElement('div');
  const table = document.createElement('table');
  const cell = table.createTBody().insertRow().insertCell();

  table.createTHead().insertRow().append(document.createElement('th'));
  region.append(table);

  return { cell, region, table };
};

describe('FEATURE: row-window utils', () => {
  describe('GIVEN: buildFullBodyRenderPlan', () => {
    describe('WHEN: rows are planned without a window', () => {
      it('THEN: it plans every row in order with namespaced keys and no gaps', () => {
        const plan = buildFullBodyRenderPlan(fakeRows(3));

        expect(plan.map((item) => item.key)).toStrictEqual(['row:r0', 'row:r1', 'row:r2']);
        expect(plan.every((item) => item.kind === 'row')).toBe(true);
        expect(plan.map((item) => (item.kind === 'row' ? item.bodyIndex : -1))).toStrictEqual([0, 1, 2]);
      });
    });
  });

  describe('GIVEN: buildWindowedBodyRenderPlan', () => {
    describe('WHEN: a contiguous window sits in the middle of the row model', () => {
      it('THEN: it plans a leading gap, the mounted rows, and a trailing gap with rowCount * rowHeight heights', () => {
        const plan = buildWindowedBodyRenderPlan(fakeRows(10), [4, 5, 6], 40);

        expect(plan.map((item) => item.key)).toStrictEqual(['gap:0', 'row:r4', 'row:r5', 'row:r6', 'gap:7']);
        expect(plan[0]).toStrictEqual({ kind: 'gap', key: 'gap:0', rowCount: 4, heightPx: 160 });
        expect(plan.at(-1)).toStrictEqual({ kind: 'gap', key: 'gap:7', rowCount: 3, heightPx: 120 });
      });
    });

    describe('WHEN: the window is non-contiguous because a focused row is pinned outside it', () => {
      it('THEN: it plans an interior gap between the pinned row and the window', () => {
        const plan = buildWindowedBodyRenderPlan(fakeRows(10), [1, 6, 7], 50);

        expect(plan.map((item) => item.key)).toStrictEqual(['gap:0', 'row:r1', 'gap:2', 'row:r6', 'row:r7', 'gap:8']);
        expect(plan[2]).toStrictEqual({ kind: 'gap', key: 'gap:2', rowCount: 4, heightPx: 200 });
      });
    });

    describe('WHEN: the window covers the full row model', () => {
      it('THEN: it plans no gaps', () => {
        const plan = buildWindowedBodyRenderPlan(fakeRows(3), [0, 1, 2], 40);

        expect(plan.every((item) => item.kind === 'row')).toBe(true);
        expect(plan).toHaveLength(3);
      });
    });

    describe('WHEN: the indexes reference a shrunken or unsorted row model', () => {
      it('THEN: it drops out-of-range indexes and keeps the plan sorted', () => {
        const plan = buildWindowedBodyRenderPlan(fakeRows(4), [9, 2, 0, 2, -1], 40);

        expect(plan.map((item) => item.key)).toStrictEqual(['row:r0', 'gap:1', 'row:r2', 'gap:3']);
      });
    });

    describe('WHEN: no index survives sanitizing', () => {
      it('THEN: it plans one gap covering the whole row model', () => {
        const plan = buildWindowedBodyRenderPlan(fakeRows(5), [12], 40);

        expect(plan).toStrictEqual([{ kind: 'gap', key: 'gap:0', rowCount: 5, heightPx: 200 }]);
      });
    });
  });

  describe('GIVEN: sanitizeRowIndexes', () => {
    describe('WHEN: indexes contain duplicates, fractions, and out-of-range values', () => {
      it('THEN: it returns the sorted unique integer indexes inside the row model', () => {
        expect(sanitizeRowIndexes([3, 1.5, 1, 3, -2, 10], 5)).toStrictEqual([1, 3]);
      });
    });
  });

  describe('GIVEN: horizontal focus visibility in a windowed table', () => {
    describe('WHEN: pinned columns cover both scrollport edges', () => {
      it('THEN: it reveals an unpinned target within the remaining center zone', () => {
        const { cell, region, table } = buildFocusRegion();
        const header = table.tHead?.rows[0];
        const pinnedLeft = header?.cells[0] as HTMLElement;
        const pinnedRight = document.createElement('th');

        pinnedLeft.className = 'has-pinned-edge-left';
        pinnedRight.className = 'has-pinned-edge-right';
        header?.append(pinnedRight);
        region.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 800, width: 800 });
        pinnedLeft.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 120, width: 120 });
        pinnedRight.getBoundingClientRect = (): DOMRect => fakeDomRect({ left: 700, right: 800, width: 100 });
        cell.getBoundingClientRect = (): DOMRect => fakeDomRect({ left: 650, right: 850, width: 200 });
        region.scrollLeft = 40;

        revealCellHorizontally(region, cell);

        expect(region.scrollLeft).toBe(190);
      });
    });

    describe('WHEN: an RTL target is wider than the visible center zone', () => {
      it('THEN: it aligns the physical inline-start edge', () => {
        const { cell, region, table } = buildFocusRegion();

        table.dir = 'rtl';
        region.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 800, width: 800 });
        cell.getBoundingClientRect = (): DOMRect => fakeDomRect({ left: -200, right: 1000, width: 1200 });
        region.scrollLeft = -300;

        revealCellHorizontally(region, cell);

        expect(region.scrollLeft).toBe(-100);
      });
    });

    describe('WHEN: the focus target spans the whole row', () => {
      it('THEN: it leaves the scroll position unchanged instead of yanking to the row start', () => {
        const { cell, region, table } = buildFocusRegion();
        const pinnedLeft = table.tHead?.rows[0].cells[0] as HTMLElement;

        pinnedLeft.className = 'has-pinned-edge-left';
        region.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 800, width: 800 });
        pinnedLeft.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 120, width: 120 });
        cell.colSpan = 4;
        cell.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 1200, width: 1200 });
        region.scrollLeft = 60;

        revealCellHorizontally(region, cell);

        expect(region.scrollLeft).toBe(60);
      });
    });

    describe('WHEN: no horizontal correction is possible or necessary', () => {
      it('THEN: it leaves detached, pinned, visible, and fully covered targets unchanged', () => {
        const detachedRegion = document.createElement('div');
        const detachedCell = document.createElement('td');

        detachedRegion.scrollLeft = 25;
        revealCellHorizontally(detachedRegion, detachedCell);
        expect(detachedRegion.scrollLeft).toBe(25);

        const { cell, region, table } = buildFocusRegion();
        const headerCell = table.tHead?.rows[0].cells[0] as HTMLElement;

        region.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 800, width: 800 });
        cell.getBoundingClientRect = (): DOMRect => fakeDomRect({ left: 200, right: 400, width: 200 });
        region.scrollLeft = 80;
        revealCellHorizontally(region, cell);
        expect(region.scrollLeft).toBe(80);

        cell.className = 'is-pinned-right';
        cell.getBoundingClientRect = (): DOMRect => fakeDomRect({ left: 900, right: 1100, width: 200 });
        revealCellHorizontally(region, cell);
        expect(region.scrollLeft).toBe(80);

        cell.className = '';
        headerCell.className = 'has-pinned-edge-left';
        headerCell.getBoundingClientRect = (): DOMRect => fakeDomRect({ right: 800, width: 800 });
        revealCellHorizontally(region, cell);
        expect(region.scrollLeft).toBe(80);
      });
    });
  });
});
