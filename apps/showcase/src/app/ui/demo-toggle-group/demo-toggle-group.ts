import { Component, input, output } from '@angular/core';

import type { DemoToggleOption } from './demo-toggle-group.type';

/**
 * Single-select segmented control for demo settings.
 *
 * Replaces the four hand-rolled "which option is on" treatments the demos used
 * to carry (`.btn-group` + `.btn-sm.active`, bespoke `.btn.is-active` accents,
 * native checkbox rows, and `aria-pressed` with no visual state at all). The
 * selected option is announced through `aria-pressed` *and* shown, so the two
 * never drift apart again.
 */
@Component({
  selector: 'app-demo-toggle-group',
  imports: [],
  templateUrl: './demo-toggle-group.html',
  styleUrl: './demo-toggle-group.css'
})
export class DemoToggleGroup<TValue extends string = string> {
  public readonly options = input.required<readonly DemoToggleOption<TValue>[]>();
  public readonly value = input.required<TValue>();
  public readonly accessibleName = input.required<string>();

  public readonly valueChange = output<TValue>();
}
