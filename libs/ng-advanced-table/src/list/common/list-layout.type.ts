/**
 * How `<nat-list>` lays out the fields inside one item.
 *
 * - `grid` (default): named grid areas per column id, positioned through
 *   `--nat-list-item-areas` / `--nat-list-item-columns`. Fields never move
 *   between items, so a value wider than its track wraps inside the track.
 * - `flow`: a wrapping row of slots sized by `--nat-list-field-width-<id>`.
 *   Fields that fit stay on one line and align across items; a field whose
 *   value is wider than its slot widens to fit it, the fields after it on
 *   that line shift along, and the ones that no longer fit wrap to the next
 *   line in that item only. Values never break mid-word.
 */
export type NatListItemLayout = 'grid' | 'flow';
