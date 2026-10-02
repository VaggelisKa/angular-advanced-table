import { Directive, input } from '@angular/core';

/**
 * Assigns a list field to its named grid area (the column id), letting
 * consumers position fields via `--nat-list-item-areas`, and, in the `flow`
 * item layout, writes the field's width value (the consumer's
 * `--nat-list-field-width-<column-id>` token with its default) to the
 * `--sys-*` bridge the flex-basis rule reads (`null` in the `grid` layout, so
 * nothing is written).
 */
@Directive({
  selector: '[natListFieldArea]',
  host: {
    '[style.grid-area]': 'natListFieldArea()',
    '[style.--sys-nat-table-list-field-width]': 'natListFieldWidth()'
  }
})
export class NatListFieldArea {
  public readonly natListFieldArea = input.required<string>();
  /** `flow` layout only: the field's `flex-basis` value, a `var()` of the per-column width token. */
  public readonly natListFieldWidth = input<string | null>(null);
}
