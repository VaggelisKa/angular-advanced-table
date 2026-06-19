import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-keyboard-demo-acknowledge',
  template: `
    <button
      type="button"
      class="btn btn-outline"
      [attr.aria-label]="'Acknowledge ' + name()"
      (click)="pressed.emit(name())"
    >
      Acknowledge
    </button>
  `,
})
export class KeyboardDemoAcknowledgeButton {
  readonly name = input.required<string>();
  readonly pressed = output<string>();
}
