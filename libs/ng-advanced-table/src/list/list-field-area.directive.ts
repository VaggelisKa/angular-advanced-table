import { Directive, input } from '@angular/core';

/**
 * Assigns a list field to its named grid area (the column id), letting
 * consumers position fields via `--nat-list-item-areas`.
 */
@Directive({
  selector: '[natListFieldArea]',
  host: {
    '[style.grid-area]': 'natListFieldArea()'
  }
})
export class NatListFieldArea {
  public readonly natListFieldArea = input.required<string>();
}
