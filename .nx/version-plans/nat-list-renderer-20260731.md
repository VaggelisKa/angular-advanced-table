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
- `enableRowActivation` (opt-in) plus a `rowActivate` output emit on click and Enter/Space. The affordance is a real per-item activator `<button>` stretched over the item (WCAG 4.1.2: a focusable `<li>` exposes no interactive role), named from the item's fields via `aria-labelledby`; interactive descendants stack above it, so nested controls (e.g. a selection checkbox) stay operable without triggering activation. Opt-in because it adds a tab stop per item.
- New locale entries `listSummary`, `listColumnVisibilityChange`, `listPageSizeChange`, and `listPageChange` announce items and fields instead of rows and columns, each falling back to its grid counterpart when only that one is overridden.
- `NatTableA11yService` keeps registering the renderer-shared effects (state-change announcements, dev-mode accessible-name check) in its constructor, so a renderer that merely provides the service is never silently inert. The grid-only trio (column-resize announcements, the `aria-multiselectable` writer that queries a rendered `<table>`, resize/reorder keybinding validation) moves behind `registerGridEffects()`, and a non-grid renderer selects its announcement copy with `setRenderer('list')` — the dev-mode accessible-name warning then names the real element.
- The optional stock theme (`ng-advanced-table/components/theme.css`) now themes the list renderer too: item background/padding/gap, selected background, and the list body-state colors derive from the palette tokens.
