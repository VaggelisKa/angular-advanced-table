import type { Signal } from '@angular/core';

/** Position of a toolbar item inside the flex row. */
export type NatToolbarItemPosition = 'start' | 'center' | 'end';

/**
 * Contract every registered toolbar item exposes to the shell and to its own
 * hosting component. Implemented by the `NatToolbarItem` directive and
 * provided as `NAT_TOOLBAR_ITEM`. Registration, roving tabindex and keyboard
 * navigation are delegated to the `ToolbarWidget` host directive from
 * `@angular/aria/toolbar`.
 */
export type NatToolbarItemRef = {
  /** Widget id used in roving-tabindex bookkeeping (Aria `id` input). */
  readonly id: string;
  /** Host element. */
  readonly element: HTMLElement;
  /** Slot the item renders in (defaults to `'start'`). */
  readonly position: Signal<NatToolbarItemPosition>;
  /** Focuses the host element. */
  focus(): void;
};
