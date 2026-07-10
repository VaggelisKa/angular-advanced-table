## When To Use Virtualization

Use row virtualization when a client-side table contains thousands of rows and rendering every row would create unnecessary DOM and change-detection work. Prefer pagination when users work naturally in pages, when the data is remote, or when a smaller working set is easier to understand.

Virtualization changes rendering only. Sorting, filtering, selection, pagination, export, column layout, and the TanStack row model continue to describe the complete logical dataset.

## Install

`NatTableVirtualize` uses TanStack Virtual as a required companion peer.

```bash
pnpm add ng-advanced-table @angular/aria @angular/cdk @tanstack/angular-virtual
```

Keep the TanStack Virtual major compatible with the peer range declared by your installed `ng-advanced-table` version.

## Basic Wiring

Import `NatTableVirtualize`, give the table region a bounded height, and place the directive on the existing table.

```ts
import { NatTable, NatTableVirtualize } from 'ng-advanced-table';
```

```html
<nat-table-surface class="orders-surface">
  <nat-table [columns]="columns" [data]="rows" [natTableVirtualize]="{ rowHeight: 44, overscan: 6 }" accessibleName="Orders" />
</nat-table-surface>
```

```css
.orders-surface {
  --nat-table-height: 30rem;
}
```

The viewport height and row-window size are separate concerns. `--nat-table-height` or `--nat-table-max-height` bounds the existing table region. `rowHeight` describes the fixed body-row height, while `overscan` controls how many extra rows remain mounted before and after the visible window.

## Fixed Row Height Contract

The first virtualization strategy requires every body row to have the configured height. Keep cell renderers, padding, and wrapping within that height. Clamp long text with `meta.cellMaxLines`, and do not use this mode for detail rows or cells whose height grows with content.

Development builds warn when a mounted row differs from `rowHeight` or when the table region is not bounded.

Server rendering emits a small deterministic bootstrap window. After hydration, TanStack Virtual measures the real table region and replaces that bootstrap range with the viewport-specific range.

## Composition

Virtualization is a body-row rendering strategy, not table state. It composes with the existing surface and controller:

- sticky headers remain inside the same scroll region;
- pinned columns retain their normal sticky offsets;
- sorting and filtering operate on the complete logical row model;
- resizing and reordering continue to use the existing column state;
- selection remains keyed by stable row id; and
- row activation and render metrics use the real mounted TanStack rows.

Virtualized layout uses the existing authoritative `<colgroup>` path so column widths do not shift when a different row window mounts. Provide stable string row ids, or use `getRowId` when identity lives somewhere other than `row.id`.

## Pagination And Manual Data

Virtualization consumes the final row model. With automatic pagination it virtualizes the current page and reports page-local ARIA row positions. This is valid for unusually large pages, but virtualizing a small page usually adds no value.

In manual mode the consuming app still owns fetching, sorting, filtering, and paging. The directive virtualizes only the rows supplied to the current table instance.

Sorting, filtering, page changes, and replacement of the supplied data reset the vertical window to the first logical row.

## Accessibility And Keyboard

The grid exposes the complete logical `aria-rowcount` and absolute `aria-rowindex` values even though most body rows are absent from the DOM. Spacer rows are hidden from Angular Aria, focus order, render metrics, and the accessibility tree.

Arrow navigation crossing a mounted-window boundary scrolls and mounts the next logical row before restoring the same column. Page Up and Page Down move by the visible row count. Control/Command + End mounts and focuses the final logical cell. The last focused row remains mounted during pointer scrolling so browser focus is not discarded.

Virtualized grids still require keyboard-only and screen-reader testing. The library tests automated ARIA and Axe behavior, while applications should verify their custom cells with the assistive technologies they support.

## Limitations

- Variable-height and expanded body rows are not supported by this first strategy.
- Column virtualization is not supported.
- Browser Find, DOM selection, and copy-all cannot discover unmounted rows.
- Export and consumer-owned global search still operate on the complete logical dataset.
- Printing currently reflects the mounted window; use export or temporarily render a non-virtual table for print workflows.
- Safari 16.5 is supported, but custom interactive cells still need application-level VoiceOver testing.
