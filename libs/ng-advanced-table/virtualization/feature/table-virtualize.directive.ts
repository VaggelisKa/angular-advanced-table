import { DestroyRef, Directive, computed, effect, inject, input, isDevMode, untracked } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';
import { defaultRangeExtractor, injectVirtualizer } from '@tanstack/angular-virtual';

import { NAT_TABLE_ROW_WINDOW_HOST, NatTableRowRenderStrategyRegistry, hasNatTableStateValueChanged } from 'ng-advanced-table';
import type { NatTableRowRenderStrategy, NatTableRowWindowHost, NatTableUserState, NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualizationOptions, NatTableVirtualizerController } from '../common/table-virtualization.type';
import { NatTableVirtualFocusService } from '../domain-logic/table-virtual-focus.service';
import { NatTableVirtualLayoutService } from '../domain-logic/table-virtual-layout.service';
import { NatTableVirtualValidationService } from '../domain-logic/table-virtual-validation.service';
import {
  NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT,
  createInitialVirtualItems,
  includeVirtualIndex,
  normalizeNatTableVirtualizationOptions
} from '../utils/table-virtualization.util';

type NatTableVirtualRowModelState = Pick<NatTableUserState, 'sorting' | 'globalFilter' | 'columnFilters' | 'pagination'>;

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
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
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

  /**
   * The four state slices whose changes rebuild the row model. The custom
   * equality collapses unrelated state traffic (per-frame columnSizing updates
   * during a drag-resize, selection toggles, visibility changes) so the reset
   * effect below never re-runs, and never re-measures, for them.
   */
  private readonly rowModelState = computed<NatTableVirtualRowModelState>(
    () => {
      const { sorting, globalFilter, columnFilters, pagination } = this.state.mergedState();

      return { sorting, globalFilter, columnFilters, pagination };
    },
    { equal: (previous, current) => !hasNatTableStateValueChanged(previous, current) }
  );

  /**
   * Identity of the visible row sequence. The O(n) join re-runs only when the
   * row-model array itself is rebuilt: TanStack memoizes it, so state changes
   * that cannot reorder rows keep the previous array and skip this entirely.
   */
  private readonly rowIdSequence = computed(() =>
    this.state
      .bodyRows()
      .map((row) => row.id)
      .join('\u0000')
  );

  private registerRowModelResetEffect(): void {
    let previous: {
      readonly data: readonly TData[];
      readonly bodyState: ReturnType<NatTableRowWindowHost<TData>['bodyState']>;
      readonly rowIdSequence: string;
      readonly rowModelState: NatTableVirtualRowModelState;
    } | null = null;

    effect(() => {
      const data = this.state.data();
      const bodyState = this.state.bodyState();
      const rowIdSequence = this.rowIdSequence();
      const rowModelState = this.rowModelState();

      // Tracked so a rowHeight change re-measures the mounted rows.
      this.rowHeight();

      // Reference comparison suffices for rowModelState: the computed's custom
      // equality keeps the previous object whenever the slices are value-equal.
      const shouldReset =
        previous !== null &&
        (previous.data !== data ||
          previous.bodyState !== bodyState ||
          previous.rowIdSequence !== rowIdSequence ||
          previous.rowModelState !== rowModelState);

      previous = { data, bodyState, rowIdSequence, rowModelState };

      untracked(() => {
        const focusTargetIndex = shouldReset ? this.focus.prepareRowModelReset() : null;

        this.controller.measure();

        if (shouldReset) {
          if (focusTargetIndex === null) {
            this.controller.scrollToOffset(0, { align: 'start' });
          } else {
            this.controller.scrollToIndex(focusTargetIndex, { align: 'start' });
          }
        }
      });
    });
  }

  private registerOptionValidationEffect(): void {
    // Diagnostics only — production builds register no effect at all.
    if (!isDevMode()) {
      return;
    }

    effect(() => {
      const { rowHeight, overscan } = this.natTableVirtualize();

      if (!Number.isFinite(rowHeight) || rowHeight <= 0) {
        console.warn('[ng-advanced-table] natTableVirtualize.rowHeight must be a finite number greater than zero.');
      }

      if (overscan !== undefined && (!Number.isFinite(overscan) || overscan < 0)) {
        console.warn('[ng-advanced-table] natTableVirtualize.overscan must be a finite number greater than or equal to zero.');
      }
    });
  }
}
