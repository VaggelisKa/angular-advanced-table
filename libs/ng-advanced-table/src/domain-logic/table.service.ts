import { Injectable, computed, inject, signal } from '@angular/core';
import type { Signal } from '@angular/core';

import type { RowData } from '@tanstack/angular-table';

import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { DEFAULT_TABLE_STATE } from '../common/table-state.const';
import type { NatTableMode, NatTableModeConfiguration, NatTableUserState } from '../common/table-state.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NAT_TABLE_KEYBINDINGS } from '../hotkey-a11y/common/keybindings.const';
import type { NatTableKeybindings } from '../hotkey-a11y/common/keybindings.type';
import { createNatTableKeyboard, mergeNatTableKeybindings } from '../hotkey-a11y/utils/keybindings.util';
import { normalizeSortingState } from '../utils/sorting.util';
import { mergeUncontrolledState, resolveControlledState, resolveSeedState } from '../utils/state-seed.util';
import { hasNatTableStateValueChanged } from '../utils/table-state-value-equality.util';

export type NatTableColumnResizeMode = 'onEnd' | 'onChange';

export type NatTableColumnSizingMode = 'fill' | 'fixed';

export type NatTableDirection = 'ltr' | 'rtl';

/**
 * Everything the initiator (`NatTableSurface`, or a host that provides the
 * service itself) hands the state manager. `state` holds the controlled slices
 * of a `[(state)]` binding; every other key is surface-wide configuration.
 */
export type NatTableSurfaceConfig = {
  readonly state: Partial<NatTableUserState>;
  readonly initialState: Partial<NatTableUserState>;
  readonly mode: NatTableMode | NatTableModeConfiguration;
  readonly manualPageCount: number | undefined;
  readonly enableAnnouncements: boolean;
  readonly stickyHeader: boolean;
  readonly enableMultiSort: boolean;
  readonly locale: string | undefined;
  readonly accessibilityText: NatTableAccessibilityText;
  readonly keybindings: NatTableKeybindings;
  readonly columnResizeMode: NatTableColumnResizeMode;
  readonly columnSizingMode: NatTableColumnSizingMode;
  readonly enableColumnResizing: boolean;
  readonly enableReordering: boolean;
  readonly enableSorting: boolean;
  readonly enablePinning: boolean;
  readonly direction: NatTableDirection | undefined;
};

const DEFAULT_SURFACE_CONFIG: NatTableSurfaceConfig = {
  state: {},
  initialState: {},
  mode: 'auto',
  manualPageCount: undefined,
  enableAnnouncements: true,
  stickyHeader: true,
  enableMultiSort: false,
  locale: undefined,
  accessibilityText: {},
  keybindings: {},
  columnResizeMode: 'onEnd',
  columnSizingMode: 'fill',
  enableColumnResizing: false,
  enableReordering: false,
  enableSorting: false,
  enablePinning: false,
  direction: undefined
};

/** Keys whose `undefined` is a real value (clears the option) instead of "leave unchanged". */
const UNDEFINED_AS_VALUE_KEYS: ReadonlySet<keyof NatTableSurfaceConfig> = new Set(['manualPageCount', 'locale', 'direction']);

/** Keys compared structurally, so a re-created but equal object keeps downstream computeds stable. */
const STRUCTURAL_KEYS: ReadonlySet<keyof NatTableSurfaceConfig> = new Set(['accessibilityText', 'keybindings']);

const hasConfigValueChanged = (key: keyof NatTableSurfaceConfig, current: unknown, next: unknown): boolean =>
  STRUCTURAL_KEYS.has(key) ? hasNatTableStateValueChanged(current, next) : !Object.is(current, next);

const isManualMode = (mode: NatTableMode | NatTableModeConfiguration, concern: keyof NatTableModeConfiguration): boolean =>
  typeof mode === 'string' ? mode === 'manual' : mode[concern] === 'manual';

/**
 * The per-surface state manager. Owns the one copy of the table view state
 * that every renderer under the surface reads and writes, plus the surface
 * configuration and companion-control registrations.
 *
 * Data flows one way around it:
 * - the initiator (`NatTableSurface`) pushes its inputs in with `configure()`
 *   and listens to `stateChanges` to drive its outputs;
 * - renderers read `state` and the configuration signals, and write user
 *   intent back with `commitState()`.
 *
 * Because the state lives here rather than in a renderer, swapping
 * `<nat-table>` for `<nat-list>` keeps uncontrolled state too.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-surface state, provided by NatTableSurface (providers: [NatTableService]), not root.
@Injectable()
export class NatTableService<TData extends RowData = RowData> {
  // ─── Configuration (written only through `configure`) ───

  private readonly config = signal<NatTableSurfaceConfig>(DEFAULT_SURFACE_CONFIG);

  private select<K extends keyof NatTableSurfaceConfig>(key: K): Signal<NatTableSurfaceConfig[K]> {
    return computed(() => this.config()[key]);
  }

  /** Slices the initiator controls through `[(state)]`; a slice left `undefined` is owned here. */
  public readonly controlledState = this.select('state');
  /** One-time seed for the slices this service owns. */
  public readonly initialState = this.select('initialState');
  public readonly mode = this.select('mode');
  public readonly manualPageCount = this.select('manualPageCount');
  public readonly enableAnnouncements = this.select('enableAnnouncements');
  public readonly stickyHeader = this.select('stickyHeader');
  public readonly enableMultiSort = this.select('enableMultiSort');
  public readonly locale = this.select('locale');
  public readonly accessibilityText = this.select('accessibilityText');
  public readonly columnResizeMode = this.select('columnResizeMode');
  public readonly columnSizingMode = this.select('columnSizingMode');
  public readonly enableColumnResizing = this.select('enableColumnResizing');
  public readonly enableReordering = this.select('enableReordering');
  public readonly enableSorting = this.select('enableSorting');
  public readonly enablePinning = this.select('enablePinning');
  public readonly direction = this.select('direction');
  /** Keybindings set on the surface, before the global `provideNatTableKeybindings()` merge. */
  public readonly surfaceKeybindings = this.select('keybindings');

  public readonly manualPagination = computed(() => isManualMode(this.mode(), 'pagination'));
  public readonly manualSorting = computed(() => isManualMode(this.mode(), 'sorting'));
  public readonly manualFiltering = computed(() => isManualMode(this.mode(), 'filtering'));

  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};
  public readonly keybindings = computed(() => mergeNatTableKeybindings(this.surfaceKeybindings(), this.globalKeybindings));
  public readonly keyboard = computed(() => createNatTableKeyboard(this.keybindings()));

  // ─── View state ───

  private readonly ownedState = signal<NatTableUserState>(DEFAULT_TABLE_STATE);
  private readonly seeded = signal(false);
  private readonly lastCommit = signal<NatTableUserState | null>(null);

  /**
   * The single source of table view state: each slice comes from the
   * controlled `[(state)]` binding when set, otherwise from the state this
   * service owns. Renderers apply their own read-time gating (search
   * registration, selection mode, column normalization) on top.
   */
  public readonly state = computed(() => resolveControlledState(this.controlledState(), this.ownedState()));

  /** Whether the owned state has been seeded from `initialState`. */
  public readonly hasSeededState = this.seeded.asReadonly();

  /**
   * The latest committed state, including proposed values for controlled
   * slices. The initiator diffs it to emit one output per changed slice.
   */
  public readonly stateChanges = this.lastCommit.asReadonly();

  // ─── Active controller and companion registrations ───

  private readonly controllerSignal = signal<NatTableUiController<TData> | null>(null);
  public readonly controller = this.controllerSignal.asReadonly();

  private readonly paginationRegistrations = signal(0);
  public readonly hasPagination = computed(() => this.paginationRegistrations() > 0);

  private readonly searchRegistrations = signal(0);
  public readonly hasSearch = computed(() => this.searchRegistrations() > 0);

  // ─── Initiator API ───

  /**
   * Applies initiator inputs. Keys left out of `config` keep their value, and
   * `undefined` leaves a boolean or mode option unchanged; for
   * `manualPageCount`, `locale`, and `direction` it is a real value.
   */
  public configure(config: Partial<NatTableSurfaceConfig>): void {
    const current = this.config();
    let next: Record<string, unknown> | null = null;

    for (const key of Object.keys(config) as (keyof NatTableSurfaceConfig)[]) {
      const value = config[key];

      if (value === undefined && !UNDEFINED_AS_VALUE_KEYS.has(key)) {
        continue;
      }

      if (hasConfigValueChanged(key, current[key], value)) {
        (next ??= { ...current })[key] = value;
      }
    }

    if (next) {
      this.config.set(next as NatTableSurfaceConfig);
    }
  }

  // ─── Renderer API ───

  /**
   * Seeds the owned state from `initialState` once per service. Returns
   * `false` when it was already seeded, so a renderer mounting after a swap
   * keeps the current state instead of resetting it.
   */
  public seedState(): boolean {
    if (this.seeded()) {
      return false;
    }

    const seed = resolveSeedState(this.initialState(), DEFAULT_TABLE_STATE);

    this.ownedState.set({ ...seed, sorting: normalizeSortingState(seed.sorting, this.enableMultiSort()) });
    this.seeded.set(true);

    return true;
  }

  /**
   * Commits a fully resolved next state. Uncontrolled slices are stored here;
   * controlled slices only reach the initiator through `stateChanges`, which
   * writes them back through `[(state)]`.
   */
  public commitState(next: NatTableUserState): void {
    this.ownedState.update((owned) => mergeUncontrolledState(owned, next, this.controlledState()));
    this.lastCommit.set(next);
  }

  public setController(controller: NatTableUiController<TData> | null): void {
    this.controllerSignal.set(controller);
  }

  public clearController(controller: NatTableUiController<TData>): void {
    this.controllerSignal.update((current) => (current === controller ? null : current));
  }

  // ─── Companion registrations ───

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
