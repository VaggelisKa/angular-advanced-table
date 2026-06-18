import { computed, inject, Injectable, InjectionToken, signal } from '@angular/core';
import type { RowData } from '@tanstack/angular-table';
import { NAT_TABLE_KEYBINDINGS, mergeNatTableKeybindings } from './keybindings';
import type {
  NatTableMode,
  NatTableModeConfiguration,
  NatTableState,
  NatTableUiController,
  NatTableAccessibilityText,
  NatTableKeybindings,
} from './table.types';

/** Injection token for the active table UI controller in the current DI scope. */
export const NAT_TABLE_UI_CONTROLLER = new InjectionToken<NatTableUiController<any>>(
  'NAT_TABLE_UI_CONTROLLER',
);

/**
 * Scoped service to share the active table controller instance within a DI hierarchy.
 */
@Injectable()
export class NatTableService<TData extends RowData = RowData> {
  private readonly controllerSignal = signal<NatTableUiController<TData> | null>(null);
  readonly controller = this.controllerSignal.asReadonly();

  // Model state bound from the surface component
  private readonly stateSignal = signal<Partial<NatTableState>>({});
  readonly state = this.stateSignal.asReadonly();

  readonly surfaceInitialState = signal<Partial<NatTableState>>({});
  readonly surfaceMode = signal<NatTableMode | NatTableModeConfiguration>('auto');

  readonly manualPageCount = signal<number | undefined>(undefined);
  readonly enableAnnouncements = signal(true);
  readonly stickyHeader = signal(true);
  readonly enableMultiSort = signal(false);
  readonly locale = signal<string | undefined>(undefined);
  readonly accessibilityText = signal<NatTableAccessibilityText>({});

  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
  readonly surfaceKeybindings = signal<NatTableKeybindings>({});
  readonly tableKeybindings = signal<NatTableKeybindings>({});

  readonly keybindings = computed(() =>
    mergeNatTableKeybindings(
      this.tableKeybindings(),
      mergeNatTableKeybindings(
        this.surfaceKeybindings(),
        this.globalKeybindings,
      ),
    ),
  );


  readonly manualPagination = computed(() => {
    const mode = this.surfaceMode();
    if (typeof mode === 'string') {
      return mode === 'manual';
    }
    return mode.pagination === 'manual';
  });

  readonly manualSorting = computed(() => {
    const mode = this.surfaceMode();
    if (typeof mode === 'string') {
      return mode === 'manual';
    }
    return mode.sorting === 'manual';
  });

  readonly manualFiltering = computed(() => {
    const mode = this.surfaceMode();
    if (typeof mode === 'string') {
      return mode === 'manual';
    }
    return mode.filtering === 'manual';
  });

  // Self-registrations for components
  private readonly paginationRegistrations = signal(0);
  readonly hasPagination = computed(() => this.paginationRegistrations() > 0);

  private readonly searchRegistrations = signal(0);
  readonly hasSearch = computed(() => this.searchRegistrations() > 0);

  // Writable signal to emit state updates from NatTable back to NatTableSurface
  readonly stateChangeEvent = signal<NatTableState | null>(null);

  setController(controller: NatTableUiController<TData> | null): void {
    this.controllerSignal.set(controller);
  }

  notifyStateChange(state: NatTableState): void {
    this.stateChangeEvent.set(state);
  }

  updateState(updater: (current: Partial<NatTableState>) => Partial<NatTableState>): void {
    this.stateSignal.update(updater);
  }

  setState(value: Partial<NatTableState>): void {
    this.stateSignal.set(value);
  }

  registerPagination(): void {
    this.paginationRegistrations.update((count) => count + 1);
  }

  unregisterPagination(): void {
    this.paginationRegistrations.update((count) => Math.max(0, count - 1));
  }

  registerSearch(): void {
    this.searchRegistrations.update((count) => count + 1);
  }

  unregisterSearch(): void {
    this.searchRegistrations.update((count) => Math.max(0, count - 1));
  }
}
