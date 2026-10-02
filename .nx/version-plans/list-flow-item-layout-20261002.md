---
ng-advanced-table: minor
---

Add the opt-in `itemLayout="flow"` layout to `<nat-list>` (#386). Flow items render their fields as a wrapping row of proportional slots instead of fixed grid tracks: fields whose values fit stay on one line and align across items, a field whose value is wider than its slot widens to it and the fields that no longer fit wrap to the next line in that item only, values wrap internally first, and values never break mid-word. Slot widths are CSS: the new `--nat-list-field-width-<column-id>` tokens (a percentage of the line, `100%` for a whole-line field, equal split by default) and the new `--nat-list-flow-column-gap` token. The fields of every item now sit in a `.list-item-fields` box that carries the grid or flow layout, while the item keeps its padding, border, and activator. The `grid` layout stays the default and is unchanged; `NatListItemLayout` and `NAT_LIST_ITEM_LAYOUT` are exported from the core entry point.
