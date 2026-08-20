---
ng-advanced-table: minor
---

Keyboard accessibility overhaul across the table header, toolbar items, pagination, and pinned zones.

- Header cells now carry `natTableCell`, so sort and column-menu buttons are managed cell controls instead of ~22 stray tab stops; headers follow the body-cell model (arrows between cells, Enter into controls, Tab within the cell, Escape back), and sorting-only headers still sort with a single Enter.
- The header column menu is keyboard-operable end to end: activation goes through the aria menu's `itemSelected` output (Enter/Space never fired the old `(click)` handlers), keyboard-opening focuses the first item, the phantom `ngGridCellWidget` tab stop is removed, and focus returns to the menu trigger after pinning or moving a column.
- Fixed the Shift+Tab loop that made sorting-only headers impossible to leave backwards (delegation now fires on arrival only).
- New `natToolbarItemFocusTarget`: a selector nominating the inner control of a wrapped toolbar item (design-system/Stencil components, open shadow roots included) as the focus target; suppression of its extra tab stop is fully reversible.
- `NatTablePagination` renders labelled `role="group"` blocks instead of a toolbar, so the page-size select and both pager buttons are ordinary tab stops and disabled pagers use native `disabled`.
- Pinned zones stay above and opaque under focused or hovered scrolled content (focused non-pinned cells keep their own stacking layer; row tints layer over the pinned background instead of replacing it).
