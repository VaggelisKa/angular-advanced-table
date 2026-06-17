---
ng-advanced-table: minor
ng-advanced-table-ui: minor
---

Make column resizing per-column instead of a table-wide switch, matching how sorting, filtering, and pinning are configured. The `enableColumnResizing` input is removed from `<nat-table-surface>`; a column is now resizable only when its `ColumnDef` opts in with `enableResizing: true` (mirroring `enablePinning`). The resize handle, keyboard resizing, and the appended resize keyboard instructions activate per resizable column rather than for the whole table. Consumers that set `enableColumnResizing` on the surface must move the opt-in onto each resizable column definition.
