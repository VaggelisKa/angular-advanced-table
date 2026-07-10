import { DestroyRef, Directive, computed, effect, inject, input, isDevMode, untracked } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';
import { defaultRangeExtractor, injectVirtualizer } from '@tanstack/angular-virtual';

import type {
  NatTableRowRenderStrategy,
  NatTableVirtualItem,
  NatTableVirtualizationOptions,
  NatTableVirtualizerController
} from './common/table-virtualization.type';
import { NatTableVirtualFocusService } from './domain-logic/table-virtual-focus.service';
import { NatTableVirtualLayoutService } from './domain-logic/table-virtual-layout.service';
import { NatTableVirtualValidationService } from './domain-logic/table-virtual-validation.service';
import { NatTableRowRenderStrategyRegistry } from './table-row-render-strategy.service';
import {
  NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT,
  createInitialVirtualItems,
  includeVirtualIndex,
  normalizeNatTableVirtualizationOptions
} from './utils/table-virtualization.util';
import { NatTableState } from '../domain-logic/table.state';

@Directive({
  selector: 'nat-table[natTableVirtualize]',
  providers: [NatTableVirtualFocusService, NatTableVirtualLayoutService, NatTableVirtualValidationService],
  host: {
    '[class.nat-table-virtualized]': 'true',
    '[style.--sys-nat-table-virtual-row-height.px]': 'rowHeight()'
  }
})
export class NatTableVirtualize<TData extends RowData = RowData> {
  public readonly natTableVirtualize = input.required<NatTableVirtualizationOptions>();
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly registry = inject(NatTableRowRenderStrategyRegistry);
  private readonly focus = inject<NatTableVirtualFocusService<TData>>(NatTableVirtualFocusService);
  private readonly layout = inject<NatTableVirtualLayoutService<TData>>(NatTableVirtualLayoutService);
  private readonly validation = inject<NatTableVirtualValidationService<TData>>(NatTableVirtualValidationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly normalizedOptions = computed(() => normalizeNatTableVirtualizationOptions(this.natTableVirtualize()));
  protected readonly rowHeight = computed(() => this.normalizedOptions().rowHeight);
  private readonly virtualizer = injectVirtualizer<HTMLElement, HTMLTableRowElement>(() => {
    const options = this.normalizedOptions();
    const focusedIndex = this.focus.focusedLogicalIndex();

    return {
      scrollElement: this.state.tableRegionRef(),
      count: this.state.bodyRows().length,
      estimateSize: this.estimateRowSize,
      getItemKey: this.getRowKey,
      overscan: options.overscan,
      rangeExtractor: (range): number[] => includeVirtualIndex(defaultRangeExtractor(range), focusedIndex, range.count),
      scrollMargin: this.layout.bodyOffset(),
      scrollPaddingStart: this.state.stickyHeader() ? this.layout.stickyOverlayHeight() : 0,
      initialRect: { width: 0, height: options.rowHeight * NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT },
      initialOffset: this.getInitialOffset,
      useApplicationRefTick: false
    };
  });

  private readonly virtualItems = computed<readonly NatTableVirtualItem[]>(() => {
    const bodyOffset = this.layout.bodyOffset();
    const rawItems = this.virtualizer.getVirtualItems();
    const items = rawItems.length
      ? rawItems
      : createInitialVirtualItems(this.state.bodyRows().length, this.rowHeight(), this.normalizedOptions().overscan, bodyOffset);

    return items.map((item) => ({
      index: item.index,
      start: Math.max(0, item.start - bodyOffset),
      end: Math.max(0, item.end - bodyOffset)
    }));
  });

  private readonly controller: NatTableVirtualizerController = {
    items: this.virtualItems,
    rowHeight: this.rowHeight,
    measure: () => this.virtualizer.measure(),
    scrollToIndex: (index, options) => this.virtualizer.scrollToIndex(index, options),
    scrollToOffset: (offset, options) => this.virtualizer.scrollToOffset(offset, options)
  };

  private readonly strategy: NatTableRowRenderStrategy = {
    items: this.virtualItems,
    totalSize: this.virtualizer.getTotalSize,
    rowHeight: this.rowHeight
  };

  public constructor() {
    const unregister = this.registry.register(this.strategy);

    this.focus.connect(this.controller);
    this.validation.connect(this.rowHeight, this.virtualItems);
    this.destroyRef.onDestroy(unregister);
    this.registerOptionValidationEffect();
    this.registerRowModelResetEffect();
  }

  private readonly estimateRowSize = (): number => this.rowHeight();
  private readonly getRowKey = (index: number): string | number => this.state.bodyRows()[index]?.id ?? index;
  private readonly getInitialOffset = (): number => this.state.tableRegionRef()?.nativeElement.scrollTop ?? 0;

  private registerRowModelResetEffect(): void {
    let previousData: readonly TData[] | null = null;
    let previousRowKey: string | null = null;

    effect(() => {
      const data = this.state.data();
      const rowKey = this.state
        .bodyRows()
        .map((row) => row.id)
        .join('\u0000');
      const rowHeight = this.rowHeight();
      const shouldReset = previousData !== null && (previousData !== data || previousRowKey !== rowKey);

      previousData = data;
      previousRowKey = rowKey;

      untracked(() => {
        this.controller.measure();

        if (shouldReset) {
          this.focus.reset();
          this.controller.scrollToOffset(0, { align: 'start' });
        }
      });

      void rowHeight;
    });
  }

  private registerOptionValidationEffect(): void {
    effect(() => {
      const { rowHeight, overscan } = this.natTableVirtualize();

      if (isDevMode() && (!Number.isFinite(rowHeight) || rowHeight <= 0)) {
        console.warn('[ng-advanced-table] natTableVirtualize.rowHeight must be a finite number greater than zero.');
      }

      if (isDevMode() && overscan !== undefined && (!Number.isFinite(overscan) || overscan < 0)) {
        console.warn('[ng-advanced-table] natTableVirtualize.overscan must be a finite number greater than or equal to zero.');
      }
    });
  }
}
