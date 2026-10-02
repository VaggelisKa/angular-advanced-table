import { Directive, input } from '@angular/core';

/**
 * Assigns a list field to its named grid area (the column id), letting
 * consumers position fields via `--nat-list-item-areas`, and, in the `flow`
 * item layout, writes the field's line share to the `--sys-*` bridge the
 * flex-basis rule reads (`null` in the `grid` layout, so nothing is written).
 */
@Directive({
  selector: '[natListFieldArea]',
  host: {
    '[style.grid-area]': 'natListFieldArea()',
    '[style.--sys-nat-table-list-field-share]': 'natListFieldShare()'
  }
})
export class NatListFieldArea {
  public readonly natListFieldArea = input.required<string>();
  /** Fraction of the item line this field takes in the `flow` layout, as a string (e.g. `'0.25'`). */
  public readonly natListFieldShare = input<string | null>(null);
}
