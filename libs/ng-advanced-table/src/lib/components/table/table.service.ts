import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_KEYBINDINGS, createNatTableKeyboard, mergeNatTableKeybindings } from './keybindings';
import type {
  NatTableAccessibilityText,
  NatTableKeybindings,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableState,
  NatTableUiController,
} from './table.types';

/** Injection token for the active table UI controller in the current DI scope. */
export const NAT_TABLE_UI_CONTROLLER = new InjectionToken<NatTableUiController<RowData>>(
  'NAT_TABLE_UI_CONTROLLER',
);

/**
 * Scoped service to share the active table controller instance within a DI hierarchy.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable / table-surface (providers: [NatTableService]), not root.
@Injectable()
export class NatTableService<TData extends RowData = RowData> {
  private readonly controllerSignal = signal<NatTableUiController<TData> | null>(null);
  public readonly controller = this.controllerSignal.asReadonly();

  // Model state bound from the surface component
  private readonly stateSignal = signal<Partial<NatTableState>>({});
  public readonly state = this.stateSignal.asReadonly();

  public readonly surfaceInitialState = signal<Partial<NatTableState>>({});
  public readonly surfaceMode = signal<NatTableMode | NatTableModeConfiguration>('auto');

  public readonly manualPageCount = signal<number | undefined>(undefined);
  public readonly enableAnnouncements = signal(true);
  public readonly stickyHeader = signal(true);
  public readonly enableMultiSort = signal(false);
  public readonly locale = signal<string | undefined>(undefined);
  public readonly accessibilityText = signal<NatTableAccessibilityText>({});
  public readonly columnResizeMode = signal<'onEnd' | 'onChange'>('onEnd');
  public readonly columnSizingMode = signal<'fill' | 'fixed'>('fill');
  public readonly direction = signal<'ltr' | 'rtl' | undefined>(undefined);

  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
  public readonly surfaceKeybindings = signal<NatTableKeybindings>({});

  public readonly keybindings = computed(() =>
    mergeNatTableKeybindings(
      this.surfaceKeybindings(),
      this.globalKeybindings,
    ),
  );

  public readonly keyboard = computed(() =>
    createNatTableKeyboard(this.keybindings()),
  );

  public readonly manualPagination = computed(() => {
    const mode = this.surfaceMode();

    if (typeof mode === 'string') {
      return mode === 'manual';
    }

    return mode.pagination === 'manual';
  });

  public readonly manualSorting = computed(() => {
    const mode = this.surfaceMode();

    if (typeof mode === 'string') {
      return mode === 'manual';
    }

    return mode.sorting === 'manual';
  });

  public readonly manualFiltering = computed(() => {
    const mode = this.surfaceMode();

    if (typeof mode === 'string') {
      return mode === 'manual';
    }

    return mode.filtering === 'manual';
  });

  // Self-registrations for components
  private readonly paginationRegistrations = signal(0);
  public readonly hasPagination = computed(() => this.paginationRegistrations() > 0);

  private readonly searchRegistrations = signal(0);
  public readonly hasSearch = computed(() => this.searchRegistrations() > 0);

  // Writable signal to emit state updates from NatTable back to NatTableSurface
  public readonly stateChangeEvent = signal<NatTableState | null>(null);

  public setController(controller: NatTableUiController<TData> | null): void {
    this.controllerSignal.set(controller);
  }

  public notifyStateChange(state: NatTableState): void {
    this.stateChangeEvent.set(state);
  }

  public updateState(updater: (current: Partial<NatTableState>) => Partial<NatTableState>): void {
    this.stateSignal.update(updater);
  }

  public setState(value: Partial<NatTableState>): void {
    this.stateSignal.set(value);
  }

  public registerPagination(): void {
    this.paginationRegistrations.update((count) => count + 1);
  }

  public unregisterPagination(): void {
    this.paginationRegistrations.update((count) => Math.max(0, count - 1));
  }

  public registerSearch(): void {
    this.searchRegistrations.update((count) => count + 1);
  }

  public unregisterSearch(): void {
    this.searchRegistrations.update((count) => Math.max(0, count - 1));
  }
}
