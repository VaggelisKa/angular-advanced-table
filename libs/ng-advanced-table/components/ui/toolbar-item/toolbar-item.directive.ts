import { ToolbarWidget } from '@angular/aria/toolbar';
import { Directive, inject, input } from '@angular/core';

import { NAT_TOOLBAR_ITEM } from '../../common/toolbar-tokens.const';
import type { NatToolbarItemPosition, NatToolbarItemRef } from '../../common/toolbar-tokens.type';

/**
 * Marks an interactive element (a `<button>`, `<input>`, …) as a toolbar item,
 * so it joins the toolbar's roving keyboard focus (Left/Right, Home/End) and
 * matches screen-reader order.
 *
 * Plain action buttons need nothing more than the bare attribute:
 * ```html
 * <button natToolbarItem natToolbarItemPosition="start">Export</button>
 * ```
 *
 * For toggle or otherwise selectable items, give each one a unique `value` as a
 * stable identity — one string per item, unique within the toolbar:
 * ```html
 * <button natToolbarItem="bold">Bold</button>
 * <button natToolbarItem="italic">Italic</button>
 * ```
 *
 * `natToolbarItemPosition="start" | "center" | "end"` (default `start`) picks
 * the toolbar slot. It MUST be a static attribute — a binding
 * (`[natToolbarItemPosition]="expr"`) always lands in the start slot.
 *
 * Items only work inside a `<nat-table-toolbar>`.
 *
 * @example
 * ```html
 * <nat-table-toolbar>
 *   <button natToolbarItem natToolbarItemPosition="start">Export</button>
 *   <input natToolbarItem type="search" aria-label="Filter" />
 * </nat-table-toolbar>
 * ```
 */
@Directive({
  selector: '[natToolbarItem]',
  providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }],
  // Aria's `value` is required; aliasing it to the always-present
  // selector attribute lets a bare `natToolbarItem` satisfy it with `''`. Bare
  // items then share value `''` (non-unique) — harmless while selection is
  // disabled; pass a string per item if Aria selection is ever re-enabled.
  hostDirectives: [{ directive: ToolbarWidget, inputs: ['value: natToolbarItem', 'disabled', 'id'] }]
})
export class NatToolbarItem implements NatToolbarItemRef {
  public readonly natToolbarItemPosition = input<NatToolbarItemPosition>('start');

  private readonly widget = inject(ToolbarWidget, { self: true });

  public get id(): string {
    return this.widget.id();
  }

  public get element(): HTMLElement {
    return this.widget.element;
  }

  public readonly position = this.natToolbarItemPosition;

  public focus(): void {
    this.element.focus();
  }
}
