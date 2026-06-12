import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ToolbarWidgetGroup } from '@angular/aria/toolbar';

import type { NatToolbarItemPositionInput } from '../common/toolbar-tokens.type';

/**
 * Groups related toolbar items, proxying `ngToolbarWidgetGroup` from
 * `@angular/aria/toolbar` and adding what the stock directive leaves out:
 * `role="group"`, an accessible name, slot positioning and flex styling.
 *
 * `natToolbarGroup="start" | "center" | "end"` (default end) picks the
 * toolbar slot, same contract as `natToolbarItem` — static attribute only.
 * Items inside keep their own `natToolbarItem` + unique `value`; they are
 * projected with the group, so their own position attribute is ignored.
 *
 * Keyboard: Left/Right (and Home/End) traverse all toolbar items linearly;
 * Up/Down cycle within this group (Aria's group navigation). `disabled`
 * (from the stock directive) soft-disables every item in the group.
 *
 * @example
 * ```html
 * <div natToolbarGroup="end" accessibleName="View density">
 *   <button natToolbarItem value="compact">Compact</button>
 *   <button natToolbarItem value="comfortable">Comfortable</button>
 * </div>
 * ```
 */
@Component({
  selector: 'div[natToolbarGroup], section[natToolbarGroup]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './toolbar-group.css',
  hostDirectives: [{ directive: ToolbarWidgetGroup, inputs: ['disabled'] }],
  host: {
    class: 'nat-toolbar-group',
    role: 'group',
    '[attr.aria-label]': 'accessibleName() ?? null',
  },
})
export class NatToolbarGroup {
  public readonly natToolbarGroup = input<NatToolbarItemPositionInput>('');
  public readonly accessibleName = input<string>();
}
