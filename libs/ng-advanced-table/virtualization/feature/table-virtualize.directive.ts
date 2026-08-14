import { DestroyRef, Directive, computed, effect, inject, input, isDevMode, output, untracked } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST, NatTableRowRenderStrategyRegistry, hasNatTableStateValueChanged } from 'ng-advanced-table';
import type { NatTableRowRenderStrategy, NatTableRowWindowHost, NatTableUserState, NatTableVirtualItem } from 'ng-advanced-table';

import type {
  NatTableVirtualRangeChange,
  NatTableVirtualizationOptions,
  NatTableVirtualizerController
} from '../common/table-virtualization.type';
import { NatTableVirtualFocusService } from '../domain-logic/table-virtual-focus.service';
import { NatTableVirtualLayoutService } from '../domain-logic/table-virtual-layout.service';
import { NatTableVirtualScrollEngine } from '../domain-logic/table-virtual-scroll-engine.service';
import { NatTableVirtualValidationService } from '../domain-logic/table-virtual-validation.service';
import {
  createVirtualItems,
  describeNatTableVirtualizationOptionIssues,
  includeVirtualIndex,
  isAppendedRowSequence,
  normalizeNatTableVirtualizationOptions,
  rangeToRowIndexes
} from '../utils/table-virtualization.util';

type NatTableVirtualRowModelState = Pick<NatTableUserState, 'sorting' | 'globalFilter' | 'columnFilters' | 'pagination'>;

@Directive({
  selector: 'nat-table[natTableVirtualize]',
  providers: [
    NatTableVirtualFocusService,
    NatTableVirtualLayoutService,
    NatTableVirtualScrollEngine,
    NatTableVirtualValidationService
  ],
  host: {
    '[style.--sys-nat-table-virtual-row-height.px]': 'rowHeight()'
  }
})
export class NatTableVirtualize<TData extends RowData = RowData> {
  public readonly natTableVirtualize = input.required<NatTableVirtualizationOptions>();
  /** Emits the mounted row window whenever it moves. See `NatTableVirtualRangeChange`. */
  public readonly virtualRangeChange = output<NatTableVirtualRangeChange>();
  private readonly state = inject<NatTableRowWindowHost<TData>>(NAT_TABLE_ROW_WINDOW_HOST);
  private readonly registry = inject(NatTableRowRenderStrategyRegistry);
  private readonly engine = inject<NatTableVirtualScrollEngine<TData>>(NatTableVirtualScrollEngine);
  private readonly focus = inject<NatTableVirtualFocusService<TData>>(NatTableVirtualFocusService);
  private readonly validation = inject<NatTableVirtualValidationService<TData>>(NatTableVirtualValidationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly normalizedOptions = computed(() => normalizeNatTableVirtualizationOptions(this.natTableVirtualize()));
  protected readonly rowHeight = computed(() => this.normalizedOptions().rowHeight);

  /**
   * The engine's contiguous window plus the focused row, kept mounted while it
   * scrolls out of range so roving grid focus never lands on a removed cell.
   */
  private readonly virtualItems = computed<readonly NatTableVirtualItem[]>(() => {
    const rowCount = this.state.bodyRows().length;
    const mountedIndexes = rangeToRowIndexes(this.engine.range(), rowCount);

    return createVirtualItems(
      includeVirtualIndex(mountedIndexes, this.focus.focusedLogicalIndex(), rowCount),
      this.rowHeight(),
      this.state.subHeaderRowOffsets()
    );
  });

  /** Every rendered fixed-height row: the data rows plus one row per sub-header group. */
  private readonly totalSize = computed(
    () => (this.state.bodyRows().length + (this.state.subHeaderRowOffsets().at(-1) ?? 0)) * this.rowHeight()
  );

  private readonly controller: NatTableVirtualizerController = {
    items: this.virtualItems,
    rowHeight: this.rowHeight,
    measure: () => this.engine.measure(),
    scrollToIndex: (index, options) => this.engine.scrollToIndex(index, options?.align ?? 'auto'),
    scrollToOffset: (offset) => this.engine.scrollToOffset(offset)
  };

  private readonly strategy: NatTableRowRenderStrategy = {
    items: this.virtualItems,
    totalSize: this.totalSize,
    rowHeight: this.rowHeight
  };

  public constructor() {
    const unregister = this.registry.register(this.strategy);

    this.engine.connect(this.normalizedOptions);
    this.focus.connect(this.controller);
    this.validation.connect(this.rowHeight, this.virtualItems);
    this.destroyRef.onDestroy(unregister);
    this.registerOptionValidationEffect();
    this.registerRowModelResetEffect();
    this.registerRangeChangeEffect();
  }

  /**
   * The contiguous mounted window: the engine range, not `virtualItems`, whose
   * retained focused row can sit far outside it and misreport the position.
   */
  private readonly mountedRange = computed<NatTableVirtualRangeChange>(
    () => {
      const indexes = rangeToRowIndexes(this.engine.range(), this.state.bodyRows().length);

      return { startIndex: indexes.at(0) ?? 0, endIndex: indexes.at(-1) ?? -1, count: indexes.length };
    },
    {
      equal: (previous, current) =>
        previous.startIndex === current.startIndex && previous.endIndex === current.endIndex && previous.count === current.count
    }
  );

  private registerRangeChangeEffect(): void {
    effect(() => {
      const range = this.mountedRange();

      untracked(() => this.virtualRangeChange.emit(range));
    });
  }

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

  /** Row-id sequence of the current row model, compared position by position by the append test below. */
  private readonly rowIdSequence = computed(() => this.state.bodyRows().map((row) => row.id));

  private registerRowModelResetEffect(): void {
    let previous: {
      readonly bodyState: ReturnType<NatTableRowWindowHost<TData>['bodyState']>;
      readonly rowIdSequence: readonly string[];
      readonly rowModelState: NatTableVirtualRowModelState;
    } | null = null;

    effect(() => {
      // Tracked so any data replacement re-measures, but deliberately not part
      // of the reset condition: live-polling consumers replace the array with
      // identical row ids every cycle, and yanking an unfocused reader back to
      // the top on each poll would make virtualized live data unusable.
      this.state.data();

      const bodyState = this.state.bodyState();
      const rowIdSequence = this.rowIdSequence();
      const rowModelState = this.rowModelState();

      // Tracked so a rowHeight change re-measures the mounted rows.
      this.rowHeight();

      // Reference comparison suffices for rowModelState: the computed's custom
      // equality keeps the previous object whenever the slices are value-equal.
      //
      // A pure append is not a reset: an unchanged prefix means every row the
      // reader is looking at is still where it was, so "load more" fetching
      // keeps its scroll position.
      const shouldReset =
        previous !== null &&
        (previous.bodyState !== bodyState ||
          previous.rowModelState !== rowModelState ||
          !isAppendedRowSequence(previous.rowIdSequence, rowIdSequence));

      previous = { bodyState, rowIdSequence, rowModelState };

      untracked(() => {
        const focusTargetIndex = shouldReset ? this.focus.prepareRowModelReset() : null;

        this.controller.measure();

        if (shouldReset) {
          if (focusTargetIndex === null) {
            this.controller.scrollToOffset(0);
          } else {
            this.controller.scrollToIndex(focusTargetIndex, { align: 'auto' });
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
      for (const issue of describeNatTableVirtualizationOptionIssues(this.natTableVirtualize())) {
        console.warn(`[ng-advanced-table] natTableVirtualize.${issue}`);
      }
    });
  }
}
