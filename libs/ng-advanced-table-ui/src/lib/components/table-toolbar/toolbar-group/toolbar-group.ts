import { ToolbarWidgetGroup } from '@angular/aria/toolbar';
import { Component, input } from '@angular/core';

import type { NatToolbarItemPosition } from '../common/toolbar-tokens.type';

/**
 * Groups related toolbar items, proxying `ngToolbarWidgetGroup` from
 * `@angular/aria/toolbar` and adding what the stock directive leaves out:
 * `role="group"`, an accessible name, slot positioning and flex styling.
 *
 * `natToolbarGroup="start" | "center" | "end"` (default start) picks the
 * toolbar slot, same contract as `natToolbarItem` — static attribute only.
 * Items inside keep their own `natToolbarItem` (their Aria value); they are
 * projected with the group, so their own `natToolbarItemPosition` is ignored.
 *
 * Keyboard: Left/Right (and Home/End) traverse all toolbar items linearly;
 * Up/Down cycle within this group (Aria's group navigation). `disabled`
 * (from the stock directive) soft-disables every item in the group.
 *
 * @example
 * ```html
 * <div natToolbarGroup="end" accessibleName="View density">
 *   <button natToolbarItem="compact">Compact</button>
 *   <button natToolbarItem="comfortable">Comfortable</button>
 * </div>
 * ```
 */
@Component({
  selector: 'div[natToolbarGroup], section[natToolbarGroup]',
  template: `<ng-content />`,
  styleUrl: './toolbar-group.css',
  hostDirectives: [{ directive: ToolbarWidgetGroup, inputs: ['disabled'] }],
  host: {
    role: 'group',
    '[attr.aria-label]': 'accessibleName() ?? null'
  }
})
export class NatToolbarGroup {
  public readonly natToolbarGroup = input<NatToolbarItemPosition>('start');
  public readonly accessibleName = input<string>();
}
