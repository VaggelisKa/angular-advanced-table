import type { Signal, TemplateRef } from '@angular/core';

/** Position of a toolbar item inside the flex row. */
export type NatToolbarItemPosition = 'start' | 'end';

/** Raw value accepted by the `natToolbarItem` attribute. Empty string means `'end'`. */
export type NatToolbarItemPositionInput = '' | NatToolbarItemPosition;

/** Collapse eligibility of a toolbar item. */
export type NatToolbarOverflowMode = 'auto' | 'never' | 'always';

/**
 * Programmatic overflow metadata registered by components hosting the
 * `natToolbarItem` directive (built-ins and rich client widgets) via
 * `NAT_TOOLBAR_ITEM.setOverflowSpec(...)`.
 */
export type NatToolbarOverflowSpec = {
  /** Hard override of the collapse mode. Built-in search passes `'never'`. */
  readonly mode?: NatToolbarOverflowMode;
  /**
   * Spec-level collapse priority. When set, overrides the `natToolbarOverflowPriority`
   * input on the directive. Lower values collapse first (default 0).
   */
  readonly priority?: number;
  /** Mirror label factory for the More-menu entry. */
  readonly label?: () => string;
  /**
   * Menu-content template factory. When provided, the More menu renders this
   * item as `ngMenuItem [submenu]` wrapping the returned template (exactly one
   * live instance — the original overlay is force-closed on overflow).
   */
  readonly menuContent?: () => TemplateRef<unknown> | null;
  /** Called by the shell right before hiding (`true`) / after re-showing (`false`). */
  readonly onOverflowChange?: (hidden: boolean) => void;
};

/**
 * Contract every registered toolbar item exposes to the shell and to its own
 * hosting component. Implemented by the `NatToolbarItem` directive and
 * provided as `NAT_TOOLBAR_ITEM`.
 */
export type NatToolbarItemRef = {
  /** Stable id used in `hiddenIds`, fit bookkeeping, and roving tabindex. */
  readonly id: string;
  /** Host element. MUST be a direct flex child of the toolbar row. */
  readonly element: HTMLElement;
  /** Resolved position (`''` input normalized to `'end'`). */
  readonly position: Signal<NatToolbarItemPosition>;
  /** Raw `natToolbarOverflow` input. Fit decisions use `effectiveOverflowMode`. */
  readonly natToolbarOverflow: Signal<NatToolbarOverflowMode>;
  /** Lower collapses first. Default 0. */
  readonly natToolbarOverflowPriority: Signal<number>;
  /**
   * Effective collapse priority: `overflowSpec().priority` when set, otherwise
   * `natToolbarOverflowPriority()`. The fit engine always reads this value.
   */
  readonly effectivePriority: Signal<number>;
  readonly natToolbarOverflowLabel: Signal<string | undefined>;
  readonly natToolbarOverflowTemplate: Signal<TemplateRef<unknown> | undefined>;
  /**
   * Mode after host heuristics: `spec.mode` ?? explicit input ?? (`'auto'` for
   * button-like hosts or hosts with mirror metadata, else `'never'` + dev warning).
   */
  readonly effectiveOverflowMode: Signal<NatToolbarOverflowMode>;
  /** Spec registered through `setOverflowSpec`, if any. */
  readonly overflowSpec: Signal<NatToolbarOverflowSpec | null>;
  /** True while collapsed into the More menu (derived from the shell's hiddenIds). */
  readonly hidden: Signal<boolean>;
  /** Roving tab stop value for this item's focus target. */
  readonly tabIndex: Signal<0 | -1>;
  /** Programmatic hook for hosting components (built-ins use exactly this). */
  setOverflowSpec(spec: NatToolbarOverflowSpec): void;
  /**
   * Composite items (search input, menu triggers) point the roving tabindex at
   * an inner focusable element. `null` resets to the host element. While a
   * custom target is set, the host's own `tabindex` attribute is removed and
   * the hosting component MUST bind `[attr.tabindex]="itemRef.tabIndex()"` on
   * the target element itself.
   */
  setFocusTarget(target: HTMLElement | null): void;
  /** Element that receives focus for this item (custom target ?? host). */
  focusTarget(): HTMLElement;
  /** Focuses `focusTarget()`. Used by shell arrow navigation / focus rescue. */
  focus(): void;
  /** Shell calls this before hiding / after re-showing; forwards to spec callback. */
  notifyOverflowChange(hidden: boolean): void;
  /**
   * Mirror-label resolution (read lazily at More-menu open):
   * `natToolbarOverflowLabel` -> `spec.label()` -> host `aria-label` ->
   * `textContent.trim()`. Returns `''` when all empty (item must then be
   * treated as `'never'` by the caller + dev warning).
   */
  resolveOverflowLabel(): string;
};

/**
 * Contract the toolbar shell exposes to registered items (and built-ins).
 * Implemented and self-provided by `NatTableToolbar`:
 *   providers: [{ provide: NAT_TABLE_TOOLBAR, useExisting: NatTableToolbar }]
 */
export type NatTableToolbarRef = {
  /** Ids of items currently collapsed into the More menu. */
  readonly hiddenIds: Signal<ReadonlySet<string>>;
  /**
   * Id of the item owning the roving tab stop, or
   * `NAT_TOOLBAR_MORE_BUTTON_ID` for the More button. Never `null` while at
   * least one visible item exists (shell defaults it to the first visible item).
   */
  readonly activeItemId: Signal<string | null>;
  /** Measured toolbar content-box width in px; 0 until first measurement. */
  readonly containerWidth: Signal<number>;
  /** Items call this on focusin so the shell moves the roving tab stop. */
  registerFocus(itemId: string): void;
};
