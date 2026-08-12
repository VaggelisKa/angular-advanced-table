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

        expect(plan.renderKey).toBe('all');
        expect(plan.rows.map((item) => item.row.id)).toStrictEqual(['row-0', 'row-1', 'row-2']);
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
        expect(plan.renderKey).not.toBe('all');
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
});
