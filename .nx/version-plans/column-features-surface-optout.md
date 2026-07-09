---
ng-advanced-table: major
---

Unify the four header controls — sorting, pinning, reordering, and resizing — under a single "surface enabler + per-column override" model. Each control is enabled on `<nat-table-surface>` and a column's availability resolves as `column.<flag> ?? surface.<enabler>`:

- Surface enabler ON → every column has the control; opt a column out with `enableSorting: false` / `enablePinning: false` / `enableResizing: false` / `meta: { reorderable: false }`.
- Surface enabler OFF (the default) → no column has the control; opt a column in with `enableSorting: true` / `enablePinning: true` / `enableResizing: true` / `meta: { reorderable: true }`.

`<nat-table-surface>` now exposes four enabler inputs, all defaulting to `false`: `enableSorting`, `enablePinning`, `enableReordering`, `enableColumnResizing`.

BREAKING CHANGE: All four controls are now off by default and must be enabled at the surface.

- Sorting was previously on by default. Tables that relied on the built-in header sort UI must now set `[enableSorting]="true"` on the surface (or `enableSorting: true` on specific columns). Programmatic sorting via `setSorting`/state is unaffected; `enableSortActions` still hides only the sort UI while keeping programmatic sorting.
- Pinning was previously always available. Tables that expose the pin menu must now set `[enablePinning]="true"` (or `enablePinning: true` per column). The new `enablePinning` surface input replaces the previously hardcoded table-level pinning.
- Resizing: a column is no longer resizable just because its `ColumnDef` sets `enableResizing: true`. Set `[enableColumnResizing]="true"` on the surface, then opt columns out with `enableResizing: false`. The trailing fill-sink column keeps `enableResizing: false`.
- Reordering: with `[enableReordering]="true"`, every column is reorderable by default; opt a column out with `meta: { reorderable: false }`. A column may also opt in while the surface enabler is off via `meta: { reorderable: true }`.

Note on sorting/pinning opt-in while the surface is off: because TanStack gates `getCanSort`/`getCanPin` with AND semantics, the surface-off + per-column opt-in path is implemented in the library's own header-actions gating (the sort button / pin menu), while table-level sorting/pinning stay enabled so the operations still work. A column with `enableSorting: true` / `enablePinning: true` is therefore sortable/pinnable even when the surface enabler is off.
