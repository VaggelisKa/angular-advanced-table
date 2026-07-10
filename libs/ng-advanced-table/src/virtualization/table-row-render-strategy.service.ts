import { Injectable, computed, signal } from '@angular/core';

import type { NatTableRowRenderStrategy } from './common/table-virtualization.type';

/** Per-table registry for an optional body-row rendering strategy. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table registry, provided by NatTable.
@Injectable()
export class NatTableRowRenderStrategyRegistry {
  private readonly registeredStrategy = signal<NatTableRowRenderStrategy | null>(null);

  public readonly strategy = this.registeredStrategy.asReadonly();
  public readonly active = computed(() => this.registeredStrategy() !== null);

  public register(strategy: NatTableRowRenderStrategy): () => void {
    const current = this.registeredStrategy();

    if (current && current !== strategy) {
      throw new Error('[ng-advanced-table] Only one body-row rendering strategy may be registered per table.');
    }

    this.registeredStrategy.set(strategy);

    return () => {
      this.registeredStrategy.update((registered) => (registered === strategy ? null : registered));
    };
  }
}
