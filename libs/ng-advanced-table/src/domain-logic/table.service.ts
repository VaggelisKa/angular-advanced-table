import { Injectable, computed, inject, signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import { NAT_TABLE_KEYBINDINGS } from '../common/keybindings.provider';
import type { NatTableKeybindings } from '../common/keybindings.type';
import type {
  NatTableAccessibilityText,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableUiController,
  NatTableUserState
} from '../common/table.type';
import { createNatTableKeyboard, mergeNatTableKeybindings } from '../utils/keybindings';
import { hasNatTableStateValueChanged } from '../utils/table-state-value-equality.util';

export type NatTableColumnResizeMode = 'onEnd' | 'onChange';

export type NatTableColumnSizingMode = 'fill' | 'fixed';

export type NatTableDirection = 'ltr' | 'rtl';

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
  public readonly direction = signal<'ltr' | 'rtl' | undefined>(undefined);

  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
  public readonly surfaceKeybindings = signal<NatTableKeybindings>({});

  public readonly keybindings = computed(() => mergeNatTableKeybindings(this.surfaceKeybindings(), this.globalKeybindings));

  public readonly keyboard = computed(() => createNatTableKeyboard(this.keybindings()));

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

  // eslint-disable-next-line -- complexity threshold exceeded but ignored because it is not worth splitting
  public patchState(config: Partial<NatTableConfig>): void {
    if (config.state !== undefined && hasNatTableStateValueChanged(this.stateSignal(), config.state)) {
      this.stateSignal.update((current) => ({ ...current, ...config.state }));
    }

    if (config.initialState !== undefined && hasNatTableStateValueChanged(this.surfaceInitialState(), config.initialState)) {
      this.surfaceInitialState.update((current) => ({ ...current, ...config.initialState }));
    }

    if (config.mode !== undefined && hasNatTableStateValueChanged(this.surfaceMode(), config.mode)) {
      this.surfaceMode.set(config.mode);
    }

    if (config.manualPageCount !== undefined && this.manualPageCount() !== config.manualPageCount) {
      this.manualPageCount.set(config.manualPageCount);
    }

    if (config.enableAnnouncements !== undefined && this.enableAnnouncements() !== config.enableAnnouncements) {
      this.enableAnnouncements.set(config.enableAnnouncements);
    }

    if (config.stickyHeader !== undefined && this.stickyHeader() !== config.stickyHeader) {
      this.stickyHeader.set(config.stickyHeader);
    }

    if (config.enableMultiSort !== undefined && this.enableMultiSort() !== config.enableMultiSort) {
      this.enableMultiSort.set(config.enableMultiSort);
    }

    if (config.locale !== undefined && this.locale() !== config.locale) {
      this.locale.set(config.locale);
    }

    if (config.accessibilityText !== undefined && hasNatTableStateValueChanged(this.accessibilityText(), config.accessibilityText)) {
      this.accessibilityText.set(config.accessibilityText);
    }

    if (config.keybindings !== undefined && hasNatTableStateValueChanged(this.surfaceKeybindings(), config.keybindings)) {
      this.surfaceKeybindings.set(config.keybindings);
    }

    if (config.columnResizeMode !== undefined && this.columnResizeMode() !== config.columnResizeMode) {
      this.columnResizeMode.set(config.columnResizeMode);
    }

    if (config.columnSizingMode !== undefined && this.columnSizingMode() !== config.columnSizingMode) {
      this.columnSizingMode.set(config.columnSizingMode);
    }

    if (config.direction !== undefined && this.direction() !== config.direction) {
      this.direction.set(config.direction);
    }
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
