---
ng-advanced-table: patch
---

Fix an inescapable backward-focus loop in header cells whose only control is the sort button.

`handleCellInteractionFocusIn` implements the APG "focus a cell or an element inside it" delegation rule: when a grid cell's entire content is one arrow-safe control, focusing the cell forwards focus to that control so a single Enter activates it. It fired on every `focusin`, including the one raised while focus was travelling _backwards out_ of the cell.

Shift+Tab exits a delegated cell through the cell element itself, so the redirect threw focus straight back into the control, which then stepped back to the cell, and the two ping-ponged indefinitely — the header could not be left in the backward direction at all.

Delegation now only runs when focus is arriving from outside the cell: a `focusin` whose `relatedTarget` is inside the cell is an exit in progress and passes through untouched. Forward Tab, arrow navigation between cells, and Enter-to-activate are unchanged.

The loop only appeared when a header rendered exactly one control. With column pinning or reorder actions enabled the cell also renders a column-menu button, which took the control count past one and disabled delegation entirely — so tabbing behaved correctly there and the bug was specific to sorting-only headers.
