import type { Signal } from '@angular/core';

/** Position of a toolbar item inside the flex row. */
export type NatToolbarItemPosition = 'start' | 'center' | 'end';

/** Raw value accepted by the `natToolbarItem` attribute. Empty string means `'end'`. */
export type NatToolbarItemPositionInput = '' | NatToolbarItemPosition;

/** Roving tab stop value: `0` for the single active item, `-1` for the rest. */
export type NatToolbarTabIndex = 0 | -1;

/**
 * Contract every registered toolbar item exposes to the shell and to its own
 * hosting component. Implemented by the `NatToolbarItem` directive and
 * provided as `NAT_TOOLBAR_ITEM`.
 */
export type NatToolbarItemRef = {
  /** Stable id used in roving-tabindex bookkeeping. */
  readonly id: string;
  /**
   * Host element. MUST be a direct flex child of the toolbar row — the shell
   * physically reorders it so DOM order matches visual order.
   */
  readonly element: HTMLElement;
  /** Resolved position (`''` input normalized to `'end'`). */
  readonly position: Signal<NatToolbarItemPosition>;
  /** Roving tab stop value for this item's focus target. */
  readonly tabIndex: Signal<NatToolbarTabIndex>;
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
  /** Focuses `focusTarget()`. Used by shell arrow navigation. */
  focus(): void;
};

/**
 * Contract the toolbar shell exposes to registered items (and built-ins).
 * Implemented and self-provided by `NatTableToolbar`:
 *   providers: [{ provide: NAT_TABLE_TOOLBAR, useExisting: NatTableToolbar }]
 */
export type NatTableToolbarRef = {
  /**
   * Id of the item owning the roving tab stop. Never `null` while at least
   * one item exists (shell defaults it to the first item in visual order).
   */
  readonly activeItemId: Signal<string | null>;
  /** Items call this on focusin so the shell moves the roving tab stop. */
  registerFocus(itemId: string): void;
};
