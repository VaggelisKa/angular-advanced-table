import type { Signal } from '@angular/core';
import { ElementRef, Injectable, afterNextRender, afterRenderEffect, effect, inject, isDevMode } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST } from 'ng-advanced-table';
import type { NatTableRowWindowHost, NatTableVirtualItem } from 'ng-advanced-table';

import { NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT } from '../utils/table-virtualization.util';

/** Development diagnostics for the fixed-row virtualization contract. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualValidationService<TData extends RowData = RowData> {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private rowHeight: Signal<number> | null = null;
  private items: Signal<readonly NatTableVirtualItem[]> | null = null;

  public constructor() {
    // Every check here is a development diagnostic. Production builds register
    // nothing, so the scroll hot path never pays for the render-effect wakeups
    // or the per-window DOM measurements they perform.
    if (!isDevMode()) {
      return;
    }

    afterNextRender(() => this.warnIfRegionIsUnbounded());
    this.registerRowHeightValidationEffect();
    this.registerSubHeaderValidationEffect();
  }

  public connect(rowHeight: Signal<number>, items: Signal<readonly NatTableVirtualItem[]>): void {
    this.rowHeight = rowHeight;
    this.items = items;
  }

  private warnIfRegionIsUnbounded(): void {
    const region = this.state.tableRegionRef()?.nativeElement;

    if (
      !region ||
      region.clientHeight <= 0 ||
      region.scrollHeight > region.clientHeight + 1 ||
      this.state.bodyRows().length <= NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT
    ) {
      return;
    }

    console.warn(
      '[ng-advanced-table] natTableVirtualize requires a bounded table region. Set `--nat-table-height` or `--nat-table-max-height`.'
    );
  }

  /**
   * Sub-header rows are unsupported by the fixed-row strategy: they add body
   * `<tr>`s the virtualizer never sized, so spacer heights under-report and the
   * scroll offset drifts as the mounted window moves.
   */
  private registerSubHeaderValidationEffect(): void {
    let hasWarned = false;

    effect(() => {
      if (hasWarned || this.state.subHeaderGroups().size === 0) {
        return;
      }

      hasWarned = true;
      console.warn(
        '[ng-advanced-table] natTableVirtualize does not support sub-header rows. ' +
          'Remove `subHeaderColumn` from the virtualized table, or render it without virtualization.'
      );
    });
  }

  private registerRowHeightValidationEffect(): void {
    let hasWarned = false;

    afterRenderEffect({
      earlyRead: () => {
        const expectedHeight = this.rowHeight?.() ?? 0;

        this.items?.();

        const row = this.elementRef.nativeElement.querySelector<HTMLTableRowElement>('tr.data-row');
        const actualHeight = row?.getBoundingClientRect().height ?? 0;

        return actualHeight > 0 && Math.abs(actualHeight - expectedHeight) > 1 ? { actualHeight, expectedHeight } : null;
      },
      write: (mismatchSignal) => {
        const mismatch = mismatchSignal();

        if (hasWarned || !mismatch) {
          return;
        }

        hasWarned = true;
        console.warn(
          `[ng-advanced-table] natTableVirtualize expected ${mismatch.expectedHeight}px rows but measured ${mismatch.actualHeight}px. ` +
            'Keep cell content and padding within the configured fixed row height.'
        );
      }
    });
  }
}
