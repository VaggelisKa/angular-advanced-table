/* eslint-disable max-lines */
import { Component, booleanAttribute, effect, inject, input, model, output } from '@angular/core';

import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState
} from '@tanstack/angular-table';
import { NatTableService } from 'ng-advanced-table';
import type {
  NatTableAccessibilityText,
  NatTableKeybindings,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableState
} from 'ng-advanced-table';

const serializeSelectedRowIds = (selection: NatTableState['rowSelection']): string =>
  Object.keys(selection)
    .filter((rowId) => selection[rowId])
    .sort()
    .join('|');

type NatTableStateDiff = {
  sortingChanged: boolean;
  globalFilterChanged: boolean;
  columnFiltersChanged: boolean;
  columnVisibilityChanged: boolean;
  columnOrderChanged: boolean;
  columnPinningChanged: boolean;
  columnSizingChanged: boolean;
  paginationChanged: boolean;
  rowSelectionChanged: boolean;
};

/** A state-slice changed flag paired with the emit action for that slice. */
type SliceEmitter = readonly [changed: boolean, emit: () => void];

const jsonChanged = (a: unknown, b: unknown): boolean => JSON.stringify(a) !== JSON.stringify(b);

const computeNatTableStateDiff = (prev: NatTableState, next: NatTableState): NatTableStateDiff => ({
  sortingChanged: jsonChanged(prev.sorting, next.sorting),
  globalFilterChanged: prev.globalFilter !== next.globalFilter,
  columnFiltersChanged: jsonChanged(prev.columnFilters, next.columnFilters),
  columnVisibilityChanged: jsonChanged(prev.columnVisibility, next.columnVisibility),
  columnOrderChanged: jsonChanged(prev.columnOrder, next.columnOrder),
  columnPinningChanged: jsonChanged(prev.columnPinning, next.columnPinning),
  columnSizingChanged: jsonChanged(prev.columnSizing, next.columnSizing),
  paginationChanged: jsonChanged(prev.pagination, next.pagination),
  rowSelectionChanged: serializeSelectedRowIds(prev.rowSelection) !== serializeSelectedRowIds(next.rowSelection)
});

@Component({
  selector: 'nat-table-surface',
  template: `<div class="surface">
    <ng-content name="table-pager" />

    <ng-content />
  </div>`,
  styleUrl: './table-surface.css',
  providers: [NatTableService]
})
export class NatTableSurface {
  /** Two-way bindable state representing the current table view state. */
  public readonly state = model<Partial<NatTableState>>({});
  /** One-time seed configuration for the table state. */
  public readonly initialState = input<Partial<NatTableState>>({});
  /** Operation mode: 'auto' (client-side) or 'manual' (server-side/external), or custom per-slice configuration. */
  public readonly mode = input<NatTableMode | NatTableModeConfiguration>('auto');

  /** Total page count for manual (server-side) pagination. */
  public readonly manualPageCount = input<number | undefined>(undefined);
  /** Enables polite live announcements for sort/filter/pagination changes. */
  public readonly enableAnnouncements = input(true, { transform: booleanAttribute });
  /** Enables sticky positioning for the table header row. */
  public readonly stickyHeader = input(true, { transform: booleanAttribute });
  /** Allows multiple simultaneous sort columns. Default false (single-column sort). */
  public readonly enableMultiSort = input(false, { transform: booleanAttribute });
  /** Locale id used to resolve generated table accessibility copy. */
  public readonly locale = input<string | undefined>(undefined);
  /** Optional accessibility copy and live-announcement formatters. */
  public readonly accessibilityText = input<NatTableAccessibilityText>({});
  /** Optional overrides for keyboard interaction shortcuts. */
  public readonly keybindings = input<NatTableKeybindings>({});
  /** When to apply resize: `'onEnd'` (default, on pointer release) or `'onChange'` (live). */
  public readonly columnResizeMode = input<'onEnd' | 'onChange'>('onEnd');
  /** Width model: `'fill'` (default — columns stretch to fill the container) or `'fixed'` (column widths are authoritative and the region scrolls horizontally, giving pixel-exact resizing). */
  public readonly columnSizingMode = input<'fill' | 'fixed'>('fill');
  /** Text direction. Falls back to the inherited CDK direction, then `'ltr'`. */
  public readonly direction = input<'ltr' | 'rtl'>();

  // Slice-specific change outputs
  public readonly sortingChange = output<SortingState>();
  public readonly globalFilterChange = output<string>();
  public readonly columnFiltersChange = output<ColumnFiltersState>();
  public readonly columnVisibilityChange = output<VisibilityState>();
  public readonly columnOrderChange = output<ColumnOrderState>();
  public readonly columnPinningChange = output<ColumnPinningState>();
  public readonly columnSizingChange = output<ColumnSizingState>();
  public readonly paginationChange = output<PaginationState>();
  public readonly rowSelectionChange = output<RowSelectionState>();

  private readonly natTableService = inject(NatTableService);

  private previousTableState: NatTableState = {
    sorting: [],
    globalFilter: '',
    columnFilters: [],
    columnVisibility: {},
    columnOrder: [],
    columnPinning: { left: [], right: [] },
    columnSizing: {},
    rowSelection: {},
    pagination: { pageIndex: 0, pageSize: 10 }
  };

  private firstStateChange = true;

  public constructor() {
    this.syncInputsToService();

    // Detect internal state changes from the table and emit slice outputs.
    effect(() => {
      const nextState = this.natTableService.stateChangeEvent();

      if (nextState) {
        this.emitStateSliceChanges(nextState);
      }
    });
  }

  /** Mirror each surface input into the table service, one effect per input. */
  private syncInputsToService(): void {
    effect(() => {
      this.natTableService.setState(this.state());
    });

    effect(() => {
      this.natTableService.surfaceInitialState.set(this.initialState());
    });
    effect(() => {
      this.natTableService.surfaceMode.set(this.mode());
    });
    effect(() => {
      this.natTableService.manualPageCount.set(this.manualPageCount());
    });
    effect(() => {
      this.natTableService.enableAnnouncements.set(this.enableAnnouncements());
    });
    effect(() => {
      this.natTableService.stickyHeader.set(this.stickyHeader());
    });
    effect(() => {
      this.natTableService.enableMultiSort.set(this.enableMultiSort());
    });
    effect(() => {
      this.natTableService.locale.set(this.locale());
    });
    effect(() => {
      this.natTableService.accessibilityText.set(this.accessibilityText());
    });
    effect(() => {
      this.natTableService.surfaceKeybindings.set(this.keybindings());
    });
    effect(() => {
      this.natTableService.columnResizeMode.set(this.columnResizeMode());
    });
    effect(() => {
      this.natTableService.columnSizingMode.set(this.columnSizingMode());
    });
    effect(() => {
      this.natTableService.direction.set(this.direction());
    });
  }

  /** Diff incoming table state against the previous and emit each changed slice. */
  private emitStateSliceChanges(nextState: NatTableState): void {
    if (this.firstStateChange) {
      this.previousTableState = nextState;
      this.firstStateChange = false;
    }

    const prev = this.previousTableState;

    this.previousTableState = nextState;

    const diff = computeNatTableStateDiff(prev, nextState);

    if (Object.values(diff).some((changed) => changed)) {
      this.state.set(nextState);
    }

    // One emit per changed slice, in declaration order. Table-driven so the
    // method stays under the complexity budget without losing the 1:1 mapping.
    const sliceEmitters: readonly SliceEmitter[] = [
      [diff.sortingChanged, (): void => this.sortingChange.emit(nextState.sorting)],
      [diff.globalFilterChanged, (): void => this.globalFilterChange.emit(nextState.globalFilter)],
      [diff.columnFiltersChanged, (): void => this.columnFiltersChange.emit(nextState.columnFilters)],
      [diff.columnVisibilityChanged, (): void => this.columnVisibilityChange.emit(nextState.columnVisibility)],
      [diff.columnOrderChanged, (): void => this.columnOrderChange.emit(nextState.columnOrder)],
      [diff.columnPinningChanged, (): void => this.columnPinningChange.emit(nextState.columnPinning)],
      [diff.columnSizingChanged, (): void => this.columnSizingChange.emit(nextState.columnSizing)],
      [diff.paginationChanged, (): void => this.paginationChange.emit(nextState.pagination)],
      [diff.rowSelectionChanged, (): void => this.rowSelectionChange.emit(nextState.rowSelection)]
    ];

    for (const [changed, emit] of sliceEmitters) {
      if (changed) {
        emit();
      }
    }
  }
}
