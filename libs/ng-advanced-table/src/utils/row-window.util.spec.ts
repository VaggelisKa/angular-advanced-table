import type { Row } from '@tanstack/angular-table';

import { buildFullBodyRenderPlan, buildWindowedBodyRenderPlan, sanitizeRowIndexes } from './row-window.util';

type TestRowData = { readonly name: string };

const fakeRows = (count: number): Row<TestRowData>[] =>
  Array.from({ length: count }, (_, index) => ({ id: `r${index}` }) as unknown as Row<TestRowData>);

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
});
