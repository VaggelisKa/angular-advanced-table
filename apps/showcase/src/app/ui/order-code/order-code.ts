import { UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-order-code',
  imports: [UpperCasePipe],
  template: `{{ code() | uppercase }}`,
  styleUrl: './order-code.css'
})
export class OrderCode {
  public readonly code = input.required<string>();
}
