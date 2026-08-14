import { signal } from '@angular/core';

import type { Row } from '@tanstack/angular-table';

import { buildNatTableBodyRenderPlan } from './body-render-plan.util';
import type { NatTableRowRenderStrategy } from '../common/row-render-strategy.type';

type TestRow = { readonly id: string };

const rows = (count: number): readonly Row<TestRow>[] =>
  Array.from({ length: count }, (_, index) => ({ id: `row-${index}` })) as Row<TestRow>[];

const strategy = (items: NatTableRowRenderStrategy['items'], totalSize = 400): NatTableRowRenderStrategy => ({
  items,
  totalSize: signal(totalSize),
  rowHeight: signal(40)
});

describe('FEATURE: NatTable body render planning', () => {
  describe('GIVEN: a logical row model without a registered strategy', () => {
    describe('WHEN: the body render plan is built', () => {
      it('THEN: it keeps every logical row in the ordinary rendering path', () => {
        const plan = buildNatTableBodyRenderPlan(rows(3), null);

        expect(plan.rows.map((item) => (item.kind === 'row' ? item.row.id : null))).toStrictEqual(['row-0', 'row-1', 'row-2']);
        expect(plan.rows.every((item) => item.beforeSize === 0)).toBe(true);
        expect(plan.afterSize).toBe(0);
      });
    });
  });

  describe('GIVEN: a virtual range and one retained focused row', () => {
    describe('WHEN: the body render plan is built from engine-neutral items', () => {
      it('THEN: it creates native-flow gaps before disjoint rows and after the final row', () => {
        const virtualItems = signal([
          { index: 2, start: 80, end: 120 },
          { index: 3, start: 120, end: 160 },
          { index: 7, start: 280, end: 320 }
        ]);
        const plan = buildNatTableBodyRenderPlan(rows(10), strategy(virtualItems));

        expect(plan.rows.map((item) => [item.logicalIndex, item.beforeSize])).toStrictEqual([
          [2, 80],
          [3, 0],
          [7, 120]
        ]);
        expect(plan.afterSize).toBe(80);
      });
    });
  });

  describe('GIVEN: a strategy item whose extent runs past the reported total size', () => {
    describe('WHEN: the body render plan is built', () => {
      it('THEN: it drops that item instead of corrupting the trailing spacer', () => {
        const virtualItems = signal([
          { index: 1, start: 40, end: 80 },
          { index: 2, start: 380, end: 460 }
        ]);
        const plan = buildNatTableBodyRenderPlan(rows(10), strategy(virtualItems));

        expect(plan.rows.map((item) => item.logicalIndex)).toStrictEqual([1]);
        expect(plan.afterSize).toBe(320);
      });
    });
  });

  describe('GIVEN: a strategy reporting global metrics the plan cannot use', () => {
    describe('WHEN: the body render plan is built', () => {
      it('THEN: it falls back to the full-row renderer for each unusable shape', () => {
        // A third-party strategy can reach these; the directive normalizes its
        // own options long before they arrive here.
        const items = signal([{ index: 0, start: 0, end: 40 }]);
        const unusable: NatTableRowRenderStrategy[] = [
          { items, totalSize: signal(400), rowHeight: signal(0) },
          { items, totalSize: signal(400), rowHeight: signal(Number.NaN) },
          { items, totalSize: signal(Number.POSITIVE_INFINITY), rowHeight: signal(40) },
          // totalSize below rows.length * rowHeight cannot describe the model.
          { items, totalSize: signal(80), rowHeight: signal(40) }
        ];

        for (const strategyUnderTest of unusable) {
          const plan = buildNatTableBodyRenderPlan(rows(5), strategyUnderTest);

          expect(plan.rows.map((item) => item.logicalIndex)).toStrictEqual([0, 1, 2, 3, 4]);
          expect(plan.afterSize).toBe(0);
        }
      });
    });
  });

  describe('GIVEN: a strategy that supplies no usable items for a non-empty model', () => {
    describe('WHEN: the body render plan is built', () => {
      it('THEN: it renders every row rather than an empty body', () => {
        const plan = buildNatTableBodyRenderPlan(rows(4), strategy(signal([{ index: 99, start: 0, end: 40 }])));

        expect(plan.rows.map((item) => item.logicalIndex)).toStrictEqual([0, 1, 2, 3]);
      });
    });
  });
});
