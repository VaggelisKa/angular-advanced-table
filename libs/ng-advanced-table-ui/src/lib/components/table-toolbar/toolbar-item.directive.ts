import { Directive, computed, inject, input } from '@angular/core';
import { ToolbarWidget } from '@angular/aria/toolbar';

import { NAT_TOOLBAR_ITEM } from './common/toolbar-tokens.const';
import type {
  NatToolbarItemPosition,
  NatToolbarItemPositionInput,
  NatToolbarItemRef,
} from './common/toolbar-tokens.type';

/**
 * Position attribute AND registration directive for toolbar items.
 *
 * `natToolbarItem` / `natToolbarItem=""` / `natToolbarItem="end"` -> end group;
 * `natToolbarItem="start"` -> start group; `natToolbarItem="center"` -> center
 * group. The position MUST be a static attribute — the toolbar places items
 * with compile-time `<ng-content select>` slots, so a property binding
 * (`[natToolbarItem]="expr"`) always lands in the end group.
 *
 * Keyboard navigation comes from the `ToolbarWidget` host directive
 * (`@angular/aria/toolbar`): it registers with the parent `ngToolbar`, owns the
 * roving tabindex and exposes `value`, `disabled` and `id` on this selector.
 * `value` is REQUIRED by Aria and must be unique per toolbar (its selection
 * model is disabled by the toolbar shell, so the value carries no behavior).
 * Items only work inside a `nat-table-toolbar` — outside one, the widget's
 * parent injection throws.
 *
 * @example
 * ```html
 * <nat-table-toolbar>
 *   <button natToolbarItem="start" value="export">Export</button>
 *   <!-- text inputs: bind [value] — a static attribute would prefill the field -->
 *   <input natToolbarItem="end" [value]="'filter'" type="search" aria-label="Filter" />
 * </nat-table-toolbar>
 * ```
 */
@Directive({
  selector: '[natToolbarItem]',
  providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }],
  hostDirectives: [{ directive: ToolbarWidget, inputs: ['value', 'disabled', 'id'] }],
  host: { class: 'nat-toolbar-item' },
})
export class NatToolbarItem implements NatToolbarItemRef {
  public readonly natToolbarItem = input<NatToolbarItemPositionInput>('');

  private readonly widget = inject(ToolbarWidget, { self: true });

  public get id(): string {
    return this.widget.id();
  }

  public get element(): HTMLElement {
    return this.widget.element;
  }

  public readonly position = computed<NatToolbarItemPosition>(() => {
    const raw = this.natToolbarItem();

    return raw === 'start' || raw === 'center' ? raw : 'end';
  });

  public focus(): void {
    this.element.focus();
  }
}
