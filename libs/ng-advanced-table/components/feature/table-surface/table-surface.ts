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

import type {
  NatTableAccessibilityText,
  NatTableKeybindings,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableUserState
} from 'ng-advanced-table';
import { NatTableService } from 'ng-advanced-table';

import type { SliceEmitter } from '../../utils/table-state-diff.util';
import { computeNatTableStateDiff } from '../../utils/table-state-diff.util';

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
  public readonly state = model<Partial<NatTableUserState>>({});
  /** One-time seed configuration for the table state. */
  public readonly initialState = input<Partial<NatTableUserState>>({});
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
  /** Enables column resizing across the surface. Off by default; a column opts in with `enableResizing: true` or, once the surface is on, opts out with `enableResizing: false`. */
  public readonly enableColumnResizing = input(false, { transform: booleanAttribute });
  /** Enables column drag/drop, keyboard reordering, and table-owned move-column metadata across the surface. Off by default; `meta.reorderable: true` opts one column into reordering (drag, keyboard, menu) while the surface is off, and `meta.reorderable: false` opts one column out once the surface is on. */
  public readonly enableReordering = input(false, { transform: booleanAttribute });
  /** Enables the built-in header sort UI across the surface. Off by default; a column opts in with `enableSorting: true` or, once the surface is on, opts out with `enableSorting: false`. Gates only the sort button and indicator — sort state and programmatic `setSorting` work regardless of this flag. (`enableSortActions` on the header-actions helper is a second, independent UI gate.) */
  public readonly enableSorting = input(false, { transform: booleanAttribute });
  /** Enables column pinning across the surface. Off by default; a column opts in with `enablePinning: true` or, once the surface is on, opts out with `enablePinning: false`. */
  public readonly enablePinning = input(false, { transform: booleanAttribute });
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

  private previousTableState: NatTableUserState = {
    sorting: [],
    globalFilter: '',
    columnFilters: [],
    columnVisibility: {},
    columnOrder: [],
    columnPinning: { left: [], right: [] },
    columnSizing: {},
    rowSelection: {},
    pagination: { pageIndex: 0, pageSize: 0 }
  };

  private firstStateChange = true;

  public constructor() {
    effect(() => {
      const nextState = this.natTableService.stateChangeEvent();

      if (nextState) {
        this.emitStateSliceChanges(nextState);
      }
    });

    effect(() => {
      this.natTableService.patchState({
        state: this.state(),
        initialState: this.initialState(),
        mode: this.mode(),
        manualPageCount: this.manualPageCount(),
        enableAnnouncements: this.enableAnnouncements(),
        stickyHeader: this.stickyHeader(),
        enableMultiSort: this.enableMultiSort(),
        locale: this.locale(),
        accessibilityText: this.accessibilityText(),
        keybindings: this.keybindings(),
        columnResizeMode: this.columnResizeMode(),
        columnSizingMode: this.columnSizingMode(),
        enableColumnResizing: this.enableColumnResizing(),
        enableReordering: this.enableReordering(),
        enableSorting: this.enableSorting(),
        enablePinning: this.enablePinning(),
        direction: this.direction()
      });
    });
  }

  /** Diff incoming table state against the previous and emit each changed slice. */
  private emitStateSliceChanges(nextState: NatTableUserState): void {
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
