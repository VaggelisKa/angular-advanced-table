import { Component, input } from '@angular/core';

/**
 * Demo header component used as a `nat-list` field label: the list renders a
 * column's `header` def through `flexRender` whenever the column has no static
 * `meta.label` or string header.
 */
@Component({
  selector: 'app-custom-cells-field-label',
  template: `
    <span aria-hidden="true" class="field-label-dot"></span>
    {{ text() }}
  `,
  styleUrl: './custom-cells-field-label.css'
})
export class CustomCellsFieldLabel {
  public readonly text = input.required<string>();
}
