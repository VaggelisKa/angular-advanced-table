## When To Use Virtualization

Use row virtualization when a client-side table contains thousands of rows and rendering every row would create unnecessary DOM and change-detection work. Prefer pagination when users work naturally in pages, when the data is remote, or when a smaller working set is easier to understand.

Virtualization changes rendering only. Sorting, filtering, selection, pagination, export, column layout, and the TanStack row model continue to describe the complete logical dataset.

## Install

Virtualization ships in its own entry point, `ng-advanced-table/virtualization`. Nothing extra to install — the row-windowing engine is the library's own and depends on no virtual-scroll library, so importing this entry point adds no new dependency.

The engine stays internal: applications do not wire a virtual-scroll viewport or scroll strategy themselves.

```bash
pnpm add ng-advanced-table @angular/aria @angular/cdk
```

## Basic Wiring

Import `NatTableVirtualize` from the virtualization entry point, give the table region a bounded height, and place the directive on the existing table.

```ts
import { NatTable } from 'ng-advanced-table';
import { NatTableVirtualize } from 'ng-advanced-table/virtualization';
```

```html
<nat-table-surface class="orders-surface">
  <nat-table [columns]="columns" [data]="rows" [natTableVirtualize]="{ rowHeight: 44 }" accessibleName="Orders" />
</nat-table-surface>
```

```css
.orders-surface {
  --nat-table-height: 30rem;
}
```

The viewport height and row-window size are separate concerns. `--nat-table-height` or `--nat-table-max-height` bounds the existing table region. The options object is typed as `NatTableVirtualizationOptions`: `rowHeight` describes the fixed body-row height, while the optional `overscan` (default `5`) is the number of extra rows mounted beyond each visible edge — the window only remounts once fewer than half of those rows remain on the side being scrolled toward, so scrolling re-renders in batches instead of on every frame. Invalid option values are normalized to safe defaults at runtime, and development builds warn about them.

## Fixed Row Height Contract

The first virtualization strategy requires every body row to have the configured height — sub-header rows included, since the engine sizes data rows and sub-header rows on one fixed-height grid. Keep cell renderers, sub-header content, padding, and wrapping within that height. Clamp long text with `meta.cellMaxLines`, and do not use this mode for detail rows or cells whose height grows with content.

Development builds warn when a mounted row differs from `rowHeight` or when the table region is not bounded.

Server rendering emits a small deterministic bootstrap window. After hydration, the scroll strategy measures the real table region and replaces that bootstrap range with the viewport-specific range.

## Composition

Virtualization is a body-row rendering strategy, not table state. It composes with the existing surface and controller:

- sticky headers remain inside the same scroll region;
- pinned columns retain their normal sticky offsets;
- sorting and filtering operate on the complete logical row model;
- sub-header group rows render inside the window (see the next section);
- resizing and reordering continue to use the existing column state;
- selection remains keyed by stable row id; and
- row activation and render metrics use the real mounted TanStack rows.

Virtualized layout uses the existing authoritative `<colgroup>` path so column widths do not shift when a different row window mounts. Provide stable, unique string row ids, or use `getRowId` when identity lives somewhere other than `row.id`. IDs may contain any string character; identity comparison does not depend on a reserved separator.

## Sub-Header Group Rows

`subHeaderColumn` composes with virtualization. The windowing engine sizes data rows and sub-header rows on one composite fixed-height grid: every sub-header row occupies one `rowHeight` slot, a group-opening row and its sub-header mount and scroll together as one block, and spacer heights account for the sub-header rows that sit above or below the mounted window. Keyboard navigation that lands on a group-opening row — Control/Command + Home, or arrow moves across a window boundary — reveals the sub-header above it, and absolute ARIA row positions include the sub-header rows the window skipped. The example below groups its ten thousand rows by region.

The fixed-height contract extends to sub-header rows: keep their content within the configured `rowHeight`, and development builds warn when a rendered sub-header row diverges from it.

During horizontal scrolling the group label stays pinned to the visible left edge of the table region and carries its own padding, so it does not shift while the full-width row scrolls beneath pinned columns. Sub-header rows draw the same row separator as data cells (the `--nat-table-cell-border-width` and `--nat-table-cell-border-color` tokens), and their background comes from `--nat-table-sub-header-background`, which defaults to transparent. See the Theming topic for the full token list and the Sub-header rows topic for general grouping behavior.

## Pagination And Manual Data

Virtualization consumes the final row model. With automatic pagination it virtualizes the current page and reports page-local ARIA row positions. This is valid for unusually large pages, but virtualizing a small page usually adds no value.

In manual mode the consuming app still owns fetching, sorting, filtering, and paging. The directive virtualizes only the rows supplied to the current table instance.

Sorting, filtering, page changes, and replacement of the supplied data reset the vertical window to the first logical row when focus is outside the body. Replacing data with the same stable ID sequence—for example, a polling refresh—keeps an unfocused reader at the current window. When keyboard focus is inside a row that survives a change, the window follows that stable row ID and restores the same column; if the row disappears, focus moves to the first surviving row in that column. If loading, empty, or error replaces the data rows, focus moves to the mounted state cell and returns to the first data row when the body recovers. Core's live region continues to announce those state changes without moving focus when focus was outside the body.

## Accessibility And Keyboard

The grid exposes the complete logical `aria-rowcount` and absolute `aria-rowindex` values even though most body rows are absent from the DOM. Spacer rows are hidden from Angular Aria, focus order, render metrics, and the accessibility tree.

Arrow navigation crossing a mounted-window boundary scrolls and mounts the next logical row before restoring the same column. Page Up and Page Down move by the body slots visible below the current caption/header overlay, counting sub-header rows when a group boundary crosses the page. Control/Command + End mounts and focuses the final logical cell, while Control/Command + Home focuses the first grid cell in the always-mounted header row. The last focused row remains mounted during pointer scrolling—and while focus visits other cells inside the table—so browser focus and the grid's roving-tabstop memory are not discarded.

`NatTableRowRenderStrategy` and `NatTableRowRenderStrategyRegistry` are the low-level geometry SPI that keeps core independent of a windowing engine. Core sorts and normalizes the supplied items, discards invalid or duplicate logical indices, hides spacer rows, exposes logical ARIA positions, and falls back to the full-row renderer when global metrics are invalid. A custom adapter still owns range retention, cross-window keyboard movement, focus recovery across row-model and state changes, measurement, observers/listeners and cleanup, SSR-safe initialization, and misuse diagnostics. Those safeguards are included by `NatTableVirtualize`; registering geometry alone does not provide them.

Virtualized grids still require keyboard-only and screen-reader testing. The library tests automated ARIA and Axe behavior, while applications should verify their custom cells with the assistive technologies they support.

## Limitations

- Variable-height and expanded body rows are not supported yet.
- Sub-header rows must keep the same fixed `rowHeight` as the data rows; development builds warn when a rendered sub-header row diverges from the configured height.
- Column virtualization is not supported.
- Browser Find, DOM selection, and copy-all cannot discover unmounted rows.
- Export and consumer-owned global search still operate on the complete logical dataset.
- Printing currently reflects the mounted window; use export or temporarily render a non-virtual table for print workflows.
- Safari 16.5 is supported, but custom interactive cells still need application-level VoiceOver testing.
