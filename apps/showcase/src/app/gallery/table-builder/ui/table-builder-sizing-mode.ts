import { Component, input, output } from '@angular/core';

import type { TableBuilderColumnSizingMode } from '../common';

@Component({
  selector: 'app-table-builder-sizing-mode',
  host: { style: 'display: block' },
  template: `
    <div aria-label="Column sizing mode" class="feature-group" role="group">
      <h3 class="feature-group-title">Column sizing mode</h3>
      <div class="preset-row">
        <button
          [attr.aria-pressed]="mode() === 'fill'"
          [class.is-active]="mode() === 'fill'"
          class="btn btn-sm"
          type="button"
          (click)="modeChange.emit('fill')">
          Fill
        </button>
        <button
          [attr.aria-pressed]="mode() === 'fixed'"
          [class.is-active]="mode() === 'fixed'"
          class="btn btn-sm"
          type="button"
          (click)="modeChange.emit('fixed')">
          Fixed
        </button>
      </div>
    </div>
  `
})
export class TableBuilderSizingMode {
  public readonly mode = input.required<TableBuilderColumnSizingMode>();
  public readonly modeChange = output<TableBuilderColumnSizingMode>();
}
