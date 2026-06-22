import { Directive, afterRenderEffect, booleanAttribute, input, output } from '@angular/core';

import type { NatTableRowRenderedEvent } from './events';

const roundToSingleDecimal = (value: number): number => Number(value.toFixed(1));

/**
 * Internal directive attached to each body row when row-render events are
 * enabled on `<nat-table>`. Emits timing information relative to the current
 * render cycle's `renderStartedAt` timestamp.
 *
 * Not exported from the public API — consumers subscribe to the
 * `(rowRendered)` output on `<nat-table>` instead.
 */
@Directive({
  selector: 'tr[natTableRowRenderEmitter]'
})
export class NatTableRowRenderEmitter {
  // Property names equal their binding names: each input/output is named for the
  // namespaced host binding on the shared `tr[natTableRowRenderEmitter]` selector,
  // so no alias is needed. `rowId`'s alias equals the directive selector, which
  // no-input-rename permits — it stays aliased.
  public readonly rowId = input.required<string>({
    alias: 'natTableRowRenderEmitter'
  });

  public readonly natTableRowRenderToken = input.required<number>();

  public readonly natTableRowRenderStartedAt = input.required<number>();

  public readonly natTableRowRenderEnabled = input(false, {
    transform: booleanAttribute
  });

  public readonly natTableRowRendered = output<NatTableRowRenderedEvent>();

  private lastEmissionKey = '';

  public constructor() {
    afterRenderEffect({
      read: () => {
        if (!this.natTableRowRenderEnabled()) return;

        const rowId = this.rowId();
        const renderToken = this.natTableRowRenderToken();
        const renderStartedAt = this.natTableRowRenderStartedAt();

        if (renderToken <= 0 || renderStartedAt <= 0) return;

        const emissionKey = `${renderToken}:${rowId}`;

        if (this.lastEmissionKey === emissionKey) return;
        this.lastEmissionKey = emissionKey;
        this.natTableRowRendered.emit({
          rowId,
          renderToken,
          durationMs: roundToSingleDecimal(Math.max(performance.now() - renderStartedAt, 0.1))
        });
      }
    });
  }
}
