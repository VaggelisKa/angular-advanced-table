import type { Signal } from '@angular/core';
import { ElementRef, Injectable, afterNextRender, afterRenderEffect, inject, isDevMode } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NatTableState } from '../../domain-logic/table.state';
import type { NatTableVirtualItem } from '../common/table-virtualization.type';
import { NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT } from '../utils/table-virtualization.util';

/** Development diagnostics for the fixed-row virtualization contract. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
@Injectable()
export class NatTableVirtualValidationService<TData extends RowData = RowData> {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private rowHeight: Signal<number> | null = null;
  private items: Signal<readonly NatTableVirtualItem[]> | null = null;
  private hasWarnedAboutRowHeight = false;

  public constructor() {
    afterNextRender(() => this.warnIfRegionIsUnbounded());
    this.registerRowHeightValidationEffect();
  }

  public connect(rowHeight: Signal<number>, items: Signal<readonly NatTableVirtualItem[]>): void {
    this.rowHeight = rowHeight;
    this.items = items;
  }

  private warnIfRegionIsUnbounded(): void {
    const region = this.state.tableRegionRef()?.nativeElement;

    if (
      !isDevMode() ||
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

  private registerRowHeightValidationEffect(): void {
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

        if (!isDevMode() || this.hasWarnedAboutRowHeight || !mismatch) {
          return;
        }

        this.hasWarnedAboutRowHeight = true;
        console.warn(
          `[ng-advanced-table] natTableVirtualize expected ${mismatch.expectedHeight}px rows but measured ${mismatch.actualHeight}px. ` +
            'Keep cell content and padding within the configured fixed row height.'
        );
      }
    });
  }
}
