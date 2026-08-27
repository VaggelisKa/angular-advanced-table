import type { Signal } from '@angular/core';

/** Position of a toolbar item inside the flex row. */
export type NatToolbarItemPosition = 'start' | 'center' | 'end';

/**
 * Focus behavior of `nat-table-toolbar`.
 *
 * - `'roving'` (default): one Tab stop for the whole toolbar, arrow keys move
 *   between registered `natToolbarItem`/`NatToolbarGroup` widgets.
 * - `'none'`: the toolbar manages no tabindex at all — every projected control
 *   keeps its native Tab stop and arrow keys are left to the controls. Use this
 *   when the projected controls are sealed (e.g. custom elements with a closed
 *   shadow root) and cannot join the roving pattern.
 */
export type NatToolbarFocusManagement = 'roving' | 'none';

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
