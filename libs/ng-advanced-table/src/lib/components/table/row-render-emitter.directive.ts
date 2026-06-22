import {
  Directive,
  afterRenderEffect,
  booleanAttribute,
  input,
  output,
} from '@angular/core';

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
  selector: 'tr[natTableRowRenderEmitter]',
})
export class NatTableRowRenderEmitter {
  // Aliases are the directive's namespaced host-binding API on the shared
  // `tr[natTableRowRenderEmitter]` selector; they are deliberately distinct from
  // the property names, so the no-input-rename / no-output-rename guards are
  // suppressed for each alias below.
  // `rowId`'s alias equals the directive selector, which no-input-rename permits — no disable needed.
  public readonly rowId = input.required<string>({
    alias: 'natTableRowRenderEmitter',
  });

  public readonly renderToken = input.required<number>({
    // eslint-disable-next-line @angular-eslint/no-input-rename -- namespaced binding on the shared host.
    alias: 'natTableRowRenderToken',
  });

  public readonly renderStartedAt = input.required<number>({
    // eslint-disable-next-line @angular-eslint/no-input-rename -- namespaced binding on the shared host.
    alias: 'natTableRowRenderStartedAt',
  });

  public readonly enabled = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename -- namespaced binding on the shared host.
    alias: 'natTableRowRenderEnabled',
    transform: booleanAttribute,
  });

  public readonly rendered = output<NatTableRowRenderedEvent>({
    // eslint-disable-next-line @angular-eslint/no-output-rename -- namespaced output on the shared host.
    alias: 'natTableRowRendered',
  });

  private lastEmissionKey = '';

  public constructor() {
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
