import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo-acknowledge',
  template: `
    <button
      [attr.aria-label]="'Acknowledge ' + name()"
      class="btn btn-outline"
      type="button"
      (click)="pressed.emit(name())"
    >
      Acknowledge
    </button>
  `,
})
export class KeyboardDemoAcknowledgeButton {
  public readonly name = input.required<string>();
  public readonly pressed = output<string>();
}
