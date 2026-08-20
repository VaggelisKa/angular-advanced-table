---
ng-advanced-table: minor
---

Register header cells with the cell control manager so header controls stop being stray tab stops.

Header `<th>` elements were the only grid cells missing `natTableCell`, so `NatTableCellControlManager` never prepared the controls that `withNatTableHeaderActions(...)` renders into them: every sort button and every column-menu button was a natural tab stop. On a table with 11 sortable columns and 14 column menus, walking past the header cost ~22 Tab presses.

Both header rows now carry `natTableCell`, which converges header keyboard interaction on the existing body-cell contract:

- Sort and column-menu buttons are managed controls (`tabindex="-1"` plus `data-nat-table-managed-cell-widget`); the header contributes no extra Tab stops.
- Arrow keys move between header cells; Enter steps into a cell's first control; Tab / Shift+Tab cycle through that cell's controls only; Escape returns focus to the cell.
- A header whose only control is its sort button still delegates focus straight to the button, so a single Enter sorts.

`NatTable.onHeaderKeydown` additionally ignores already-consumed events (`defaultPrevented`), so a key handled by the cell-interaction model can never also trigger column resize or reorder regardless of listener order.

This is a behavior change for keyboard users who relied on Tab reaching header controls directly; the grid's arrow-key + Enter model is now the (single) path, matching the ARIA grid pattern.

The header column menu is now fully keyboard-operable end to end:

- Removed the `ngGridCellWidget` wrapper from `NatTableHeaderActions`. The header cell never registers the widget (`GridCell`'s content query cannot see into the flexRender-created view), but the widget directive still self-assigned `tabindex="0"` while its cell was active — a phantom focus stop between the header cell and its controls that swallowed Tab.
- Menu item activation moved from per-item `(click)` handlers to the menu's `itemSelected` output with stable item values (`pin:left`, `move:right`, …). `@angular/aria` menus activate items — Enter, Space, and pointer click alike — by emitting `itemSelected` with the item's value and never fire a DOM click on the item, so the `(click)`-only wiring made every menu action keyboard-dead.
- Controls inside a menu attached within a cell (`role="menu"`/`role="menubar"`) are excluded from cell-control management and from the cell's Enter/Tab control list; the menu owns its items' roving tabindex, and managing them fought that model.
- Keyboard-opening the menu now reliably focuses its first item. The overlay attaches outside zoneless change detection and the menu's items register after the trigger's pending focus was already consumed, so the trigger re-issues its open once the items have rendered.
- After pinning or moving a column from the menu, focus returns to that column's menu trigger; the action re-inserts the `<th>` elsewhere in the DOM, which previously dropped keyboard focus to `<body>`.
