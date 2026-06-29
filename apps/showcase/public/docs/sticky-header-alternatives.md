Sticky headers keep columns aligned when scrolling large tables. By default, `NatTable` activates a sticky header layout. However, depending on your application structure and viewport target, you might prefer other layout containment strategies or alternative workflows.

## Default Sticky Behavior

When using `NatTableSurface` with `[stickyHeader]="true"` (which is enabled by default), the table's header row is positioned with CSS `position: sticky`.

```html
<nat-table-surface [stickyHeader]="true">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />
</nat-table-surface>
```

This configuration requires that either:

1. The table’s scrolling container has a restricted height boundary.
2. The page itself scrolls, and the header docks to the top of the viewport.

---

## Alternative 1: Max-Height Containment

To restrict a table's height and keep the sticky header contained within a specific card or section of your page, you can apply a CSS `max-height` rule to the surface using the custom property `--nat-table-max-height`.

```css
.my-bounded-table {
  --nat-table-max-height: 400px;
}
```

```html
<nat-table-surface class="my-bounded-table">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />
</nat-table-surface>
```

This configuration creates a scrollable region inside the table container. The header sticks to the top of this container (`top: 0`), and any rows beyond the vertical budget scroll underneath it.

---

## Alternative 2: Viewport-Level Scrolling

If you prefer a full-page scrolling layout where the table stretches naturally and scrolling occurs at the browser viewport level, you should not set a height restriction. The headers will dock at the top of the browser window.

If your application has a fixed or sticky navigation header at the top of the page, you must adjust the table header's sticky top offset so that the table header is not hidden beneath the navbar. Use the `--nat-table-sticky-top` custom property:

```css
.full-page-table {
  /* Offset by the height of your app navbar (e.g., 64px) */
  --nat-table-sticky-top: 64px;
}
```

```html
<nat-table-surface class="full-page-table">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />
</nat-table-surface>
```

---

## Alternative 3: Pagination

For tables displaying thousands of rows, sticky vertical scrolling can sometimes cause performance issues or result in an overwhelming list of rows. Using pagination is often the best alternative. It limits the page height naturally and eliminates the need for vertical scrolling entirely.

To enable pagination, place the `<nat-table-pagination>` component inside the table surface:

```html
<nat-table-surface [state]="tableState()">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Orders" />
  <nat-table-pagination [pageSizeOptions]="[10, 25, 50]" />
</nat-table-surface>
```

```ts
import { Component, signal, computed } from '@angular/core';
import type { NatTableUserState } from 'ng-advanced-table';

export class OrderTableComponent {
  protected readonly rows = signal(ORDER_DATA);
  protected readonly columns = ORDER_COLUMNS;

  // Let the table handle pagination state internally or control it
  protected readonly tableState = signal<Partial<NatTableUserState>>({
    pagination: { pageIndex: 0, pageSize: 10 }
  });
}
```

---

## Common Layout Pitfalls

- **Missing Scrolling Container Context**: Ensure that parent elements do not specify `overflow: hidden` on pathways leading to your sticky table, as this can break native sticky positioning.
- **Double Scrollbars**: Avoid nesting a max-height table inside another scrollable card or container. If you see double scrollbars, verify whether the height boundaries are applied to the correct container level.
- **Z-Index Conflicts**: The sticky header uses a default `z-index` of `4` (and pinned columns use `5` or `6`). If other page elements (like dropdowns, tooltips, or modals) render behind the table headers, adjust their `z-index` or check their stacking contexts.
