import { booleanAttribute, ChangeDetectionStrategy, Component, effect, inject, input, model, output } from '@angular/core';
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
  SortingState,
  VisibilityState,
} from '@tanstack/angular-table';
import { NatTableService, type NatTableState, type NatTableMode, type NatTableModeConfiguration, type NatTableAccessibilityText } from 'ng-advanced-table';

@Component({
  selector: 'nat-table-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="surface">
    <ng-content name="table-pager" />

    <ng-content />
  </div>`,
  styleUrl: './table-surface.css',
  providers: [NatTableService],
})
export class NatTableSurface {
  /** Two-way bindable state input representing the current table view state. */
  readonly state = input<Partial<NatTableState>>({});
  /** Emits when the table state changes. */
  readonly stateChange = output<Partial<NatTableState>>();
  /** One-time seed configuration for the table state. */
  readonly initialState = input<Partial<NatTableState>>({});
  /** Operation mode: 'auto' (client-side) or 'manual' (server-side/external), or custom per-slice configuration. */
  readonly mode = input<NatTableMode | NatTableModeConfiguration>('auto');

  /** Total page count for manual (server-side) pagination. */
  readonly manualPageCount = input<number | undefined>(undefined);
  /** Enables polite live announcements for sort/filter/pagination changes. */
  readonly enableAnnouncements = input(true, { transform: booleanAttribute });
  /** Enables sticky positioning for the table header row. */
  readonly stickyHeader = input(true, { transform: booleanAttribute });
  /** Locale id used to resolve generated table accessibility copy. */
  readonly locale = input<string | undefined>(undefined);
  /** Optional accessibility copy and live-announcement formatters. */
  readonly accessibilityText = input<NatTableAccessibilityText>({});

  // Slice-specific change outputs
  readonly sortingChange = output<SortingState>();
  readonly globalFilterChange = output<string>();
  readonly columnFiltersChange = output<ColumnFiltersState>();
  readonly columnVisibilityChange = output<VisibilityState>();
  readonly columnOrderChange = output<ColumnOrderState>();
  readonly columnPinningChange = output<ColumnPinningState>();
  readonly paginationChange = output<PaginationState>();

  private readonly natTableService = inject(NatTableService);

  constructor() {
    // Sync state input property to the service
    effect(() => {
      this.natTableService.setState(this.state());
    });

    // Sync input properties to the service
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
      this.natTableService.locale.set(this.locale());
    });
    effect(() => {
      this.natTableService.accessibilityText.set(this.accessibilityText());
    });

    // Detect internal state changes from the table and emit slice outputs
    let isFirstChange = true;
    let previousState: NatTableState = {
      sorting: [],
      globalFilter: '',
      columnFilters: [],
      columnVisibility: {},
      columnOrder: [],
      columnPinning: { left: [], right: [] },
      pagination: { pageIndex: 0, pageSize: 10 },
    };

    effect(() => {
      const nextState = this.natTableService.stateChangeEvent();
      if (!nextState) {
        return;
      }

      if (isFirstChange) {
        previousState = nextState;
        isFirstChange = false;
      }

      const prev = previousState;
      previousState = nextState;

      const sortingChanged = JSON.stringify(prev.sorting) !== JSON.stringify(nextState.sorting);
      const globalFilterChanged = prev.globalFilter !== nextState.globalFilter;
      const columnFiltersChanged = JSON.stringify(prev.columnFilters) !== JSON.stringify(nextState.columnFilters);
      const columnVisibilityChanged = JSON.stringify(prev.columnVisibility) !== JSON.stringify(nextState.columnVisibility);
      const columnOrderChanged = JSON.stringify(prev.columnOrder) !== JSON.stringify(nextState.columnOrder);
      const columnPinningChanged = JSON.stringify(prev.columnPinning) !== JSON.stringify(nextState.columnPinning);
      const paginationChanged = JSON.stringify(prev.pagination) !== JSON.stringify(nextState.pagination);

      if (
        sortingChanged ||
        globalFilterChanged ||
        columnFiltersChanged ||
        columnVisibilityChanged ||
        columnOrderChanged ||
        columnPinningChanged ||
        paginationChanged
      ) {
        this.stateChange.emit(nextState);
      }

      if (sortingChanged) {
        this.sortingChange.emit(nextState.sorting);
      }
      if (globalFilterChanged) {
        this.globalFilterChange.emit(nextState.globalFilter);
      }
      if (columnFiltersChanged) {
        this.columnFiltersChange.emit(nextState.columnFilters);
      }
      if (columnVisibilityChanged) {
        this.columnVisibilityChange.emit(nextState.columnVisibility);
      }
      if (columnOrderChanged) {
        this.columnOrderChange.emit(nextState.columnOrder);
      }
      if (columnPinningChanged) {
        this.columnPinningChange.emit(nextState.columnPinning);
      }
      if (paginationChanged) {
        this.paginationChange.emit(nextState.pagination);
      }
    });
  }
}
