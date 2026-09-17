---
ng-advanced-table: minor
---

Add last row/item bottom-border tokens and center pinned-covered cells on focus. `--nat-table-last-row-border-width`/`-color` drive the final body row's bottom edge in `<nat-table>`, and `--nat-list-last-item-border-width`/`-color` drive the final item's bottom edge in `<nat-list>`; both default to `0` (the stock `components/theme.css` restores the list card edge). When keyboard focus lands on a table cell, or a control inside one, that a sticky pinned zone or the region edge hides, the table now scrolls the region so the cell is centered in the unobscured span between the pinned zones; pinned cells and already-visible cells never move.
