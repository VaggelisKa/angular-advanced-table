---
ng-advanced-table: minor
---

Add opt-in composite item navigation to `NatList` (`enableItemNavigation`): the APG layout-grid pattern shared with `NatTable` via `@angular/aria/grid` — one tab stop for the whole list, roving Up/Down focus between items rendered as `role="row"`/`role="gridcell"`, the cell-interaction Enter/Tab/Escape model for controls inside items, click/shortcut `rowActivate` matching table rows, `aria-selected` + `aria-multiselectable` selection semantics, and a new item-phrased `listKeyboardInstructions` locale entry (falling back to `keyboardInstructions`). The default plain `role="list"` rendering is unchanged.
