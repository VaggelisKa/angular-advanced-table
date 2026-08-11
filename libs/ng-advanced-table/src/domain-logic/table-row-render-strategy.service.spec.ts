import { signal } from '@angular/core';

import { NatTableRowRenderStrategyRegistry } from './table-row-render-strategy.service';
import type { NatTableRowRenderStrategy } from '../common/row-render-strategy.type';

const createStrategy = (): NatTableRowRenderStrategy => ({
  items: signal([]),
  totalSize: signal(0),
  rowHeight: signal(40)
});

describe('FEATURE: NatTable row-render strategy registry', () => {
  describe('GIVEN: a per-table registry provided by NatTable', () => {
    describe('WHEN: a body-row renderer registers its strategy', () => {
      it('THEN: it activates the registry and unregistering deactivates it again', () => {
        const registry = new NatTableRowRenderStrategyRegistry();
        const strategy = createStrategy();

        expect(registry.active()).toBe(false);

        const unregister = registry.register(strategy);

        expect(registry.active()).toBe(true);
        expect(registry.strategy()).toBe(strategy);

        unregister();

        expect(registry.active()).toBe(false);
        expect(registry.strategy()).toBeNull();
      });

      it('THEN: it keeps re-registration of the same strategy idempotent', () => {
        const registry = new NatTableRowRenderStrategyRegistry();
        const strategy = createStrategy();

        registry.register(strategy);

        expect(() => registry.register(strategy)).not.toThrow();
        expect(registry.strategy()).toBe(strategy);
      });
    });

    describe('WHEN: a second renderer tries to register a different strategy', () => {
      it('THEN: it rejects the competing strategy and keeps the first one', () => {
        const registry = new NatTableRowRenderStrategyRegistry();
        const first = createStrategy();

        registry.register(first);

        expect(() => registry.register(createStrategy())).toThrowError(/Only one body-row rendering strategy/);
        expect(registry.strategy()).toBe(first);
      });

      it("THEN: a stale unregister callback cannot clear another strategy's registration", () => {
        const registry = new NatTableRowRenderStrategyRegistry();
        const first = createStrategy();
        const unregisterFirst = registry.register(first);

        unregisterFirst();

        const second = createStrategy();

        registry.register(second);
        unregisterFirst();

        expect(registry.strategy()).toBe(second);
      });
    });
  });
});
