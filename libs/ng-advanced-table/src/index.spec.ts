import { flexRenderComponent as tanstackFlexRenderComponent } from '@tanstack/angular-table';

import { NatTableVirtualize as DirectNatTableVirtualize } from './virtualization/table-virtualize.directive';

import type { NatTableVirtualizationOptions } from '.';
import { NatTableVirtualize, flexRenderComponent } from '.';

describe('FEATURE: ng-advanced-table public barrel', () => {
  describe('GIVEN: consumer rendering helpers are exposed from the core entry point', () => {
    describe('WHEN: importing the Angular flex renderer helper', () => {
      it('THEN: it forwards the TanStack helper for consumer cell renderers', () => {
        expect(flexRenderComponent).toBe(tanstackFlexRenderComponent);
      });
    });
  });

  describe('GIVEN: opt-in row virtualization is exposed from the core entry point', () => {
    describe('WHEN: importing the directive and its library-owned options', () => {
      it('THEN: it exposes the directive without leaking TanStack Virtual options', () => {
        const options = { rowHeight: 44, overscan: 6 } satisfies NatTableVirtualizationOptions;

        expect(NatTableVirtualize).toBe(DirectNatTableVirtualize);
        expect(options).toStrictEqual({ rowHeight: 44, overscan: 6 });
      });
    });
  });
});
