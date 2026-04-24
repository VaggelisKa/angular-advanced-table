import {
  afterRenderEffect,
  booleanAttribute,
  Directive,
  input,
  output,
} from '@angular/core';

import type { NatTableRowRenderedEvent } from './events';

/**
 * Internal directive attached to each body row when row-render events are
 * enabled on `<nat-table>`. Emits timing information relative to the current
 * render cycle's `renderStartedAt` timestamp.
 *
 * Not exported from the public API — consumers subscribe to the
 * `(rowRendered)` output on `<nat-table>` instead.
 */
@Directive({
  selector: 'tr[natTableRowRenderEmitter], div[natTableRowRenderEmitter]',
})
export class NatTableRowRenderEmitter {
  readonly rowId = input.required<string>({
    alias: 'natTableRowRenderEmitter',
  });
  readonly renderToken = input.required<number>({
    alias: 'natTableRowRenderToken',
  });
  readonly renderStartedAt = input.required<number>({
    alias: 'natTableRowRenderStartedAt',
  });
  readonly enabled = input(false, {
    alias: 'natTableRowRenderEnabled',
    transform: booleanAttribute,
  });

  readonly rendered = output<NatTableRowRenderedEvent>({
    alias: 'natTableRowRendered',
  });

  private lastEmissionKey = '';

  constructor() {
    afterRenderEffect({
      read: () => {
        if (!this.enabled()) {
          return;
        }

        const rowId = this.rowId();
        const renderToken = this.renderToken();
        const renderStartedAt = this.renderStartedAt();

        if (renderToken <= 0 || renderStartedAt <= 0) {
          return;
        }

        const emissionKey = `${renderToken}:${rowId}`;

        if (this.lastEmissionKey === emissionKey) {
          return;
        }

        this.lastEmissionKey = emissionKey;
        this.rendered.emit({
          rowId,
          renderToken,
          durationMs: roundToSingleDecimal(
            Math.max(performance.now() - renderStartedAt, 0.1),
          ),
        });
      },
    });
  }
}

function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1));
}
