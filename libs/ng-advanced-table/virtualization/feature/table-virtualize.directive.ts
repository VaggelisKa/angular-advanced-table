import { DestroyRef, Directive, computed, effect, inject, input, isDevMode, untracked } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_ROW_WINDOW_HOST, NatTableRowRenderStrategyRegistry, hasNatTableStateValueChanged } from 'ng-advanced-table';
import type { NatTableRowRenderStrategy, NatTableRowWindowHost, NatTableUserState, NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualizationOptions, NatTableVirtualizerController } from '../common/table-virtualization.type';
import { NatTableVirtualFocusService } from '../domain-logic/table-virtual-focus.service';
import { NatTableVirtualLayoutService } from '../domain-logic/table-virtual-layout.service';
import { NatTableVirtualScrollEngine } from '../domain-logic/table-virtual-scroll-engine.service';
import { NatTableVirtualValidationService } from '../domain-logic/table-virtual-validation.service';
import {
  createVirtualItems,
  includeVirtualIndex,
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
    '[class.nat-table-virtualized]': 'true',
    '[style.--sys-nat-table-virtual-row-height.px]': 'rowHeight()'
  }
})
export class NatTableVirtualize<TData extends RowData = RowData> {
  public readonly natTableVirtualize = input.required<NatTableVirtualizationOptions>();
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
      readonly rowIdSequence: string;
      readonly rowModelState: NatTableVirtualRowModelState;
    } | null = null;

    effect(() => {
      // Tracked so any data replacement re-measures, but deliberately not part
      // of the reset condition: live-polling consumers replace the array with
      // identical row ids every cycle, and yanking an unfocused reader back to
      // the top on each poll would make virtualized live data unusable.
      this.state.data();

      const rowIdSequence = this.rowIdSequence();
      const rowModelState = this.rowModelState();

      // Tracked so a rowHeight change re-measures the mounted rows.
      this.rowHeight();

      // Reference comparison suffices for rowModelState: the computed's custom
      // equality keeps the previous object whenever the slices are value-equal.
      const shouldReset = previous !== null && (previous.rowIdSequence !== rowIdSequence || previous.rowModelState !== rowModelState);

      previous = { rowIdSequence, rowModelState };

      untracked(() => {
        this.controller.measure();

        if (shouldReset) {
          const focusRestored = this.focus.resetForRowModelChange();

          if (!focusRestored) {
            this.controller.scrollToOffset(0);
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
