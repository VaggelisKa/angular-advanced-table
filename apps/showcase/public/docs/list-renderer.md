`NatList` (`<nat-list>`) renders rows as stacked label/value items instead of a grid, driven by the same shared table state as `NatTable`. Column definitions, surface state, companion controls, and the data lifecycle are shared, so a list is a renderer choice — not a second table implementation.

## When To Use The List

Use the list when a grid stops earning its columns:

- Narrow viewports where a table would scroll horizontally — pair it with a consumer-owned breakpoint to swap renderers.
- Card-like records where each row reads better as a labeled block than as a row of cells.
- Renderer swaps inside one `nat-table-surface`, because the surface state (sorting, column order, visibility, selection, pagination) survives the swap.

The list deliberately ships no header UI, resizing, pinning, or reorder affordances. Sorting and field order are consumer-owned: write the surface state instead.

## Composition

The smallest composition is a surface for the state scope and the list itself:

```html
<nat-table-surface>
  <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" />
</nat-table-surface>
```

`columns` accepts the same TanStack `ColumnDef` array the table uses. Column ids double as grid-area names for item layout (see Item Layout And Theming).

Because list items draw their own chrome, the surface's card padding collapses to `0` around a projected list by default; set `--nat-table-space-card-list` to reopen it. Tables keep the regular `--nat-table-space-card` padding.

## Field Labels

Each item renders one field per visible column, label first, value second:

- `meta.label` (or a string `header`) renders as the visible field label.
- `meta.hiddenHeaderLabel` renders the label screen-reader-only — same contract as the table's hidden headers. Use it when the value is self-describing.
- A non-string `header` def (component, template, or function) renders through `flexRender` as the field label.

Values render through the same `flexRender` pipeline as table cells: strings, `flexRenderComponent`, and `TemplateRef` cells all work unchanged — the live example renders its status field with the same badge component the table cells use. Grid-coupled cell widgets (`ngGridCellWidget`) require the table's Aria grid context and cannot render inside a list.

## Shared State And Companion Controls

`NatList` implements `NatTableUiController`, so surface-bound companion controls resolve it exactly as they resolve a table: `nat-table-pagination` pages it, `nat-table-column-visibility` toggles fields, and consumer search registered through `NatTableService` filters it. Programmatic state flows through the same two-way `state` binding or `patchState`:

```ts
protected sortByTotal(): void {
  this.state.update((current) => ({ ...current, sorting: [{ id: 'total', desc: true }] }));
}
```

## Sub-Header Rows

`subHeaderColumn` groups list items under sub-header items exactly as it groups table rows: the shared engine forces a hidden primary sort so groups stay contiguous, user sorting applies within groups, and each group renders an `<li class="list-sub-header">` announced with item-flavored copy. `subHeaderOrder`, the `natTableSubHeader` template, and the per-renderer `enableSubHeaders` gate all work identically. See Sub-header rows for the full semantics.

## Selection And Activation

`enableRowSelection` and `selectionMode` bridge the shared selection state. Pair them with `withNatTableSelectionColumn(...)` to render a real checkbox per item; selected items expose `data-selected` for styling. `aria-selected` is intentionally absent — it is invalid on `role="listitem"`, and the checkbox conveys the state.

`enableRowActivation` (opt-in) renders a stretched activator button per item and emits `rowActivate` on click and Enter/Space. It is a real `<button>` because a focusable `<li>` exposes no interactive role to assistive technology; interactive controls inside fields stack above the activator, so a selection checkbox never triggers activation.

Two deliberate consequences of the stretched-button design:

- The activator's accessible name is the item's **first visible field** (label plus value, e.g. "Order ORD-201") — concise on purpose, since the item content is read as the list item body anyway. Order the columns so the identifying field comes first.
- The overlay owns mousedown across the item, so field text cannot be selected with the mouse while activation is enabled. Leave activation off (or trigger navigation from a dedicated control) when copyable values matter. A field whose column sets `meta.rowActivation: false` is the exception: it stacks above the activator, so clicks on it never activate and its text stays selectable. When every visible column opts out, no activator is rendered at all.

## Item Navigation

`enableItemNavigation` (opt-in) switches the list to the same composite grid pattern the table uses: the whole list becomes **one tab stop**, Up/Down arrow keys move a roving focus between items, and the cell-interaction model handles controls inside an item — Enter steps in, Tab/Shift+Tab cycle through them, Escape returns to the item. Items render as `role="row"`/`role="gridcell"` instead of plain list items, and screen readers get item-phrased keyboard instructions (the `listKeyboardInstructions` locale entry, falling back to `keyboardInstructions`).

```html
<nat-table-surface>
  <nat-list
    [columns]="columns"
    [data]="data"
    [enableItemNavigation]="true"
    accessibleName="Operations list"
    (rowActivate)="open($event)" />
</nat-table-surface>
```

Behavior changes while it is enabled:

- Items emit `rowActivate` on click and on the `rowActivate` shortcut directly — like table rows, and without `enableRowActivation`. The stretched activator button is not rendered (the focusable gridcell already carries an interactive role), so field text becomes mouse-selectable again.
- Native controls inside fields (for example a selection checkbox) are managed into the roving tab order; clicks on them never trigger activation. A column with `meta.rowActivation: false` excludes its whole field from pointer activation, padding included. Keyboard Enter/Space targets the item (focus never sits on a field), so it keeps activating while at least one visible column participates; once every visible column opts out, the item stops emitting `rowActivate` for keyboard and click alike.
- With multi selection the grid carries `aria-multiselectable`, and each item row mirrors its selection state onto `aria-selected` alongside `data-selected`.

Leave it off for short lists: plain `role="list"` semantics are friendlier to screen-reader browse mode, and a handful of tab stops is not a traversal cost. Reach for it when the list is long enough that one tab stop per item would make keyboard traversal expensive.

## Data Lifecycle

`dataStatus` drives the same loading, empty, and error model as the table, rendered as list items with a shared base shape. The table's `natTableLoading` / `natTableEmpty` / `natTableError` templates are accepted unchanged, and the `error` input carries the payload into the error template context.

## Item Layout And Theming

Every item is a CSS grid of named field areas — area names are column ids — so consumers lay fields out freely without touching the renderer:

```css
nat-list {
  --nat-list-item-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  --nat-list-item-areas: 'id id status' 'customer owner total';
}
```

The full token list (`--nat-list-*`, including the body-state tokens) is documented in Theming, and the opt-in stock theme styles the list out of the box.

## Flow Item Layout

Grid tracks cannot wrap per item: when one value is wider than its track (a large number on a narrow screen, say) the grid either breaks it mid-value or lets it overflow, and the only alternative is a layout where every item wraps. `itemLayout="flow"` is the opt-in answer. It lays each item out as a wrapping row of proportional slots instead:

- Fields whose values fit their slot stay on one line and keep the same width in every item, so columns still align across the list.
- A field whose value is wider than its slot widens to fit it, and the fields that no longer fit the line wrap to the next line **in that item only**. Every other item keeps its single line.
- A value that fits its slot wraps internally first, so a secondary part such as `(+4%)` drops to a second line before the field widens or anything moves down.
- Values never break mid-word, so a long number stays whole; only a word wider than the whole item breaks, as a last resort, so it stays readable instead of overflowing. Keep values that must stay on one line free of breakable spaces.

```html
<nat-table-surface>
  <nat-list [columns]="columns" [data]="rows" accessibleName="Orders" itemLayout="flow" />
</nat-table-surface>
```

Slot widths are CSS, one token per column id, exactly like the grid area names: `--nat-list-field-width-<column-id>` is a percentage of the line (`100%` gives the field a whole line of its own). With no tokens set, the visible fields share the line equally. Once you set tokens, set one for every visible column (or hide the rest via column visibility), exactly as with `--nat-list-item-areas`: a column left without a token still takes its equal share of the full line, so a partial set no longer adds up to the line and can push a field onto a second line in every item. The gap between slots is `--nat-list-flow-column-gap` (`1rem`), carried as a gutter inside each slot so the percentages add up exactly. Column ids must be valid CSS identifiers, or escaped the way the token is written below.

```css
nat-list {
  --nat-list-field-width-customer: 50%;
  --nat-list-field-width-total: 25%;
  --nat-list-field-width-change: 25%;
  --nat-list-field-width-note: 100%;
}
```

A field's minimum width is its own minimum content width, label included. With the default row direction that is the label plus the value's longest word, so stack the two (`--nat-list-field-flex-direction: column`) when values should wrap internally as early as possible. `--nat-list-item-areas` and `--nat-list-item-columns` are ignored while the flow layout is active; the `grid` layout stays the default and is unchanged. Both layouts are the same markup, so `enableRowActivation`, `enableItemNavigation`, selection, and sub-headers behave identically. Bind `itemLayout` to a signal to switch layouts with a consumer-owned breakpoint.

## Accessibility

- `accessibleName` is required (the list takes no `caption`); dev mode warns when it is missing.
- The list summary announces items and fields where the grid announces rows and columns, via the `listSummary`, `listColumnVisibilityChange`, `listPageSizeChange`, `listPageChange`, `listSubHeaderRow`, and `listKeyboardInstructions` locale entries — each falls back to its grid counterpart when only that one is overridden.
- State changes (sorting, filtering, selection, pagination) are announced through the same live region as the table.
- With `enableItemNavigation` the keyboard instructions join `aria-describedby`, and the roving gridcells take the same focus ring tokens as table cells (`--nat-table-focus-ring-width`, `--nat-table-focus-ring-color`).

## Limitations

- No header UI, column resizing, pinning, or reorder affordances — drive sorting and field order through surface state.
- Grid-coupled cell widgets (`ngGridCellWidget`) cannot render inside a list.
- `nat-table-scroll-control` expects a scrollable region; the list region does not scroll by default, so give it a height and overflow before pairing the two.
