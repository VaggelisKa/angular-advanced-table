import { Component, input, output } from '@angular/core';

/**
 * On/off switch for a demo setting.
 *
 * Wraps the showcase stylesheet's `.toggle-control` / `.slider` treatment,
 * which every demo previously ignored in favour of its own bare checkbox
 * markup. The real `<input type="checkbox">` stays in the accessibility tree
 * and drives the visual state through CSS sibling selectors.
 */
@Component({
  selector: 'app-demo-switch',
  imports: [],
  templateUrl: './demo-switch.html',
  styleUrl: './demo-switch.css'
})
export class DemoSwitch {
  public readonly label = input.required<string>();
  public readonly checked = input.required<boolean>();
  public readonly testId = input<string>();

  public readonly checkedChange = output<boolean>();

  protected onToggle(event: Event): void {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.checkedChange.emit(target.checked);
    }
  }
}
