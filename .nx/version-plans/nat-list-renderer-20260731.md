---
ng-advanced-table: minor
---

Add `NatList` (`nat-list`), a list renderer that shares the table engine.

`NatList` is provided by the same `NatTableState` as `nat-table`, so sorting, filtering, column order, column visibility, pagination, row selection, and the data lifecycle drive both renderers from one surface. It implements `NatTableUiController`, so surface-bound companion controls (pagination, column visibility, export, consumer search) resolve it unchanged, and swapping renderers inside one `nat-table-surface` preserves state.

Rendering and styling:

- Every item is a CSS grid of named field areas (`grid-area: <column-id>`), themed through `--nat-table-list-gap` and `--nat-table-list-item-areas` / `-columns` / `-gap` / `-padding` / `-background` / `-background-selected`.
- Fields render through the same `flexRender` pipeline as table cells (text, `flexRenderComponent`, `TemplateRef`). A column's `header` def renders as the field label when no static `meta.label` or string header exists, and a `meta.hiddenHeaderLabel` label renders screen-reader-only.
- Loading, empty, and error items share one base shape with per-state modifier classes, a `data-state` attribute, indicators, and `--nat-table-list-state-*` tokens. They also accept the table's `natTableLoading` / `natTableEmpty` / `natTableError` templates, which is what gives the `[error]` input its payload.

Interaction and accessibility:

- `enableRowSelection` and `selectionMode` bridge the shared selection state; selected items expose `data-selected` rather than `aria-selected`, which is invalid on `role="listitem"`.
- `enableRowActivation` (opt-in) plus a `rowActivate` output emit on click and Enter/Space. Opt-in because a plain `<li>` needs `tabindex` to stay keyboard-operable.
- New locale entries `listSummary`, `listColumnVisibilityChange`, `listPageSizeChange`, and `listPageChange` announce items and fields instead of rows and columns, each falling back to its grid counterpart when only that one is overridden.
- `NatTableA11yService` no longer registers effects in its own constructor: a renderer calls `registerSharedEffects(renderer)` and, for the grid, `registerGridEffects()`. A list therefore skips column-resize announcements, the `aria-multiselectable` writer that queries a rendered `<table>`, and resize/reorder keybinding validation, and the dev-mode accessible-name warning names the real element.
