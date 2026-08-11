import { flexRenderComponent as tanstackFlexRenderComponent } from '@tanstack/angular-table';

import { NatTableRowRenderStrategyRegistry as DirectRegistry } from './domain-logic/table-row-render-strategy.service';

import type { NatTableRowRenderStrategy } from '.';
import { NatTableRowRenderStrategyRegistry, flexRenderComponent } from '.';

describe('FEATURE: ng-advanced-table public barrel', () => {
  describe('GIVEN: consumer rendering helpers are exposed from the core entry point', () => {
    describe('WHEN: importing the Angular flex renderer helper', () => {
      it('THEN: it forwards the TanStack helper for consumer cell renderers', () => {
        expect(flexRenderComponent).toBe(tanstackFlexRenderComponent);
      });
    });
  });

  describe('GIVEN: the engine-neutral row-render strategy contract', () => {
    describe('WHEN: importing the registry and its strategy type', () => {
      it('THEN: it exposes the contract without naming any virtualization engine', () => {
        // Structural check only: core must describe a row window without
        // depending on the CDK engine, which lives in the opt-in entry point.
        const strategyKeys: (keyof NatTableRowRenderStrategy)[] = ['items', 'totalSize', 'rowHeight'];

        expect(NatTableRowRenderStrategyRegistry).toBe(DirectRegistry);
        expect(strategyKeys).toStrictEqual(['items', 'totalSize', 'rowHeight']);
      });
    });
  });
});
