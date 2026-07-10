import { Injectable, computed, inject, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import type { NatTableMode, NatTableModeConfiguration, NatTableUserState } from '../common/table-state.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NAT_TABLE_KEYBINDINGS } from '../hotkey-a11y/common/keybindings.const';
import type { NatTableKeybindings } from '../hotkey-a11y/common/keybindings.type';
import { createNatTableKeyboard, mergeNatTableKeybindings } from '../hotkey-a11y/utils/keybindings.util';
import { hasNatTableStateValueChanged } from '../utils/table-state-value-equality.util';

export type NatTableColumnResizeMode = 'onEnd' | 'onChange';

export type NatTableColumnSizingMode = 'fill' | 'fixed';

export type NatTableDirection = 'ltr' | 'rtl';

/** Set `target` to `value` when they differ, treating `undefined` as a real value. */
const setSignalIfChanged = <T>(target: WritableSignal<T>, value: T): void => {
  if (target() !== value) {
    target.set(value);
  }
};

/** Set `target` only when `value` is defined and differs from the current value. */
const setSignalIfDefinedChanged = <T>(target: WritableSignal<T>, value: T | undefined): void => {
  if (value !== undefined && target() !== value) {
    target.set(value);
  }
};

export type NatTableConfig = {
  state: Partial<NatTableUserState>;
  initialState: Partial<NatTableUserState>;
  mode: NatTableMode | NatTableModeConfiguration;
  manualPageCount: number | undefined;
  enableAnnouncements: boolean;
  stickyHeader: boolean;
  enableMultiSort: boolean;
  locale: string | undefined;
  accessibilityText: NatTableAccessibilityText;
  keybindings: NatTableKeybindings;
  columnResizeMode: NatTableColumnResizeMode;
  columnSizingMode: NatTableColumnSizingMode;
  enableColumnResizing: boolean;
  enableReordering: boolean;
  enableSorting: boolean;
  enablePinning: boolean;
  direction: NatTableDirection | undefined;
};

/**
 * Scoped service to share the active table controller instance within a DI hierarchy.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table-instance state, provided by NatTable / table-surface (providers: [NatTableService]), not root.
@Injectable()
export class NatTableService<TData extends RowData = RowData> {
  private readonly controllerSignal = signal<NatTableUiController<TData> | null>(null);
  public readonly controller = this.controllerSignal.asReadonly();

  // Model state bound from the surface component
  private readonly stateSignal = signal<Partial<NatTableUserState>>({});
  public readonly state = this.stateSignal.asReadonly();

  public readonly surfaceInitialState = signal<Partial<NatTableUserState>>({});
  public readonly surfaceMode = signal<NatTableMode | NatTableModeConfiguration>('auto');

  public readonly manualPageCount = signal<number | undefined>(undefined);
  public readonly enableAnnouncements = signal(true);
  public readonly stickyHeader = signal(true);
  public readonly enableMultiSort = signal(false);
  public readonly locale = signal<string | undefined>(undefined);
  public readonly accessibilityText = signal<NatTableAccessibilityText>({});
  public readonly columnResizeMode = signal<'onEnd' | 'onChange'>('onEnd');
  public readonly columnSizingMode = signal<'fill' | 'fixed'>('fill');
  public readonly enableColumnResizing = signal(false);
  public readonly enableReordering = signal(false);
  public readonly enableSorting = signal(false);
  public readonly enablePinning = signal(false);
  public readonly direction = signal<'ltr' | 'rtl' | undefined>(undefined);

  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
  public readonly surfaceKeybindings = signal<NatTableKeybindings>({});

  public readonly keybindings = computed(() => mergeNatTableKeybindings(this.surfaceKeybindings(), this.globalKeybindings));

  public readonly keyboard = computed(() => createNatTableKeyboard(this.keybindings()));

  public readonly manualPagination = computed(() => {
    const mode = this.surfaceMode();

    return typeof mode === 'string' ? mode === 'manual' : mode.pagination === 'manual';
  });

  public readonly manualSorting = computed(() => {
    const mode = this.surfaceMode();

    return typeof mode === 'string' ? mode === 'manual' : mode.sorting === 'manual';
  });

  public readonly manualFiltering = computed(() => {
    const mode = this.surfaceMode();

    return typeof mode === 'string' ? mode === 'manual' : mode.filtering === 'manual';
  });

  // Self-registrations for components
  private readonly paginationRegistrations = signal(0);
  public readonly hasPagination = computed(() => this.paginationRegistrations() > 0);

  private readonly searchRegistrations = signal(0);
  public readonly hasSearch = computed(() => this.searchRegistrations() > 0);

  // Writable signal to emit state updates from NatTable back to NatTableSurface
  public readonly stateChangeEvent = signal<NatTableUserState | null>(null);

  public setController(controller: NatTableUiController<TData> | null): void {
    this.controllerSignal.set(controller);
  }

  public clearController(controller: NatTableUiController<TData>): void {
    this.controllerSignal.update((current) => (current === controller ? null : current));
  }

  public notifyStateChange(state: NatTableUserState): void {
    this.stateChangeEvent.set(state);
  }

  public updateState(updater: (current: Partial<NatTableUserState>) => Partial<NatTableUserState>): void {
    this.stateSignal.update(updater);
  }

  public setState(value: Partial<NatTableUserState>): void {
    this.stateSignal.set(value);
  }

  public patchState(config: Partial<NatTableConfig>): void {
    if (config.state !== undefined) {
      this.stateSignal.set(config.state);
    }

    if (config.initialState !== undefined) {
      this.surfaceInitialState.set(config.initialState);
    }

    if (config.mode !== undefined) {
      this.surfaceMode.set(config.mode);
    }

    if (config.accessibilityText !== undefined && hasNatTableStateValueChanged(this.accessibilityText(), config.accessibilityText)) {
      this.accessibilityText.set(config.accessibilityText);
    }

    if (config.keybindings !== undefined && hasNatTableStateValueChanged(this.surfaceKeybindings(), config.keybindings)) {
      this.surfaceKeybindings.set(config.keybindings);
    }

    // `manualPageCount`, `locale`, and `direction` treat `undefined` as a real value.
    setSignalIfChanged(this.manualPageCount, config.manualPageCount);
    setSignalIfChanged(this.locale, config.locale);
    setSignalIfChanged(this.direction, config.direction);

    // Defined-only scalar options: applied when present in the config and actually changed.
    setSignalIfDefinedChanged(this.enableAnnouncements, config.enableAnnouncements);
    setSignalIfDefinedChanged(this.stickyHeader, config.stickyHeader);
    setSignalIfDefinedChanged(this.enableMultiSort, config.enableMultiSort);
    setSignalIfDefinedChanged(this.columnResizeMode, config.columnResizeMode);
    setSignalIfDefinedChanged(this.columnSizingMode, config.columnSizingMode);
    setSignalIfDefinedChanged(this.enableColumnResizing, config.enableColumnResizing);
    setSignalIfDefinedChanged(this.enableReordering, config.enableReordering);
    setSignalIfDefinedChanged(this.enableSorting, config.enableSorting);
    setSignalIfDefinedChanged(this.enablePinning, config.enablePinning);
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
