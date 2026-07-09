---
ng-advanced-table: major
---

Unify the four header controls (sorting, pinning, reordering, resizing) under a single "surface enabler + per-column override" model. Each control is enabled on `<nat-table-surface>` and a column's availability resolves as `column.<flag> ?? surface.<enabler>`:

- Surface enabler on: every column has the control; opt a column out with `enableSorting: false` / `enablePinning: false` / `enableResizing: false` / `meta: { reorderable: false }`.
- Surface enabler off (the default): opt a column in with `enableSorting: true` / `enablePinning: true` / `enableResizing: true` / `meta: { reorderable: true }`.

`<nat-table-surface>` exposes four enabler inputs, all defaulting to `false`: `enableSorting`, `enablePinning`, `enableReordering`, `enableColumnResizing`.

BREAKING CHANGE: sorting and pinning are no longer on by default.

- Sorting was previously on by default. Tables that relied on the built-in header sort UI must now set `[enableSorting]="true"` on the surface (or `enableSorting: true` on specific columns). Programmatic sorting via `setSorting` and sort state is unaffected; `enableSortActions` still hides only the sort UI while keeping programmatic sorting.
- Pinning was previously always available. Tables that expose the pin menu must now set `[enablePinning]="true"` (or `enablePinning: true` per column). The new `enablePinning` surface input replaces the previously hardcoded table-level pinning.

Non-breaking additions in the same model:

- Resizing keeps its per-column behaviour: `enableResizing: true` still makes a column resizable. The re-introduced `enableColumnResizing` surface input additionally enables resizing for every column at once (opt one out with `enableResizing: false`).
- Reordering keeps its surface-gated behaviour under `[enableReordering]="true"` and gains a per-column opt-out via `meta: { reorderable: false }`. A column can also opt in while the surface enabler is off with `meta: { reorderable: true }`.

Note on sorting/pinning opt-in while the surface is off: because TanStack gates `getCanSort`/`getCanPin` with AND semantics, the surface-off plus per-column opt-in path is handled in the library's own header-actions gating (the sort button and pin menu), while table-level sorting/pinning stay enabled so the operations still work. A column with `enableSorting: true` / `enablePinning: true` is sortable/pinnable even when the surface enabler is off.
