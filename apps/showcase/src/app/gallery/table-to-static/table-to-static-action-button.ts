import { Component, input, output } from '@angular/core';

/**
 * Plain-button actions cell for the table-to-static demo. Deliberately not an
 * `ngGridCellWidget`: a native button renders in both interaction models — the
 * grid manages it into the cell keyboard model, the static table leaves it in
 * the natural tab order.
 */
@Component({
  selector: 'app-table-to-static-action-button',
  template: `
    <button [attr.aria-label]="'View order ' + orderId()" class="sc-action-button" type="button" (click)="viewOrder.emit(orderId())">
      View
    </button>
  `,
  styles: `
    .sc-action-button {
      padding: 0.25rem 0.625rem;
      font: inherit;
      font-size: 0.8125rem;
      color: var(--sc-text);
      cursor: pointer;
      background: var(--sc-surface);
      border: 1px solid var(--sc-border);
      border-radius: 6px;
    }

    .sc-action-button:hover {
      background: var(--sc-surface-hover);
    }

    .sc-action-button:focus-visible {
      outline: 2px solid var(--sc-accent);
      outline-offset: 1px;
    }
  `
})
export class TableToStaticActionButton {
  public readonly orderId = input.required<string>();
  public readonly viewOrder = output<string>();
}
