Virtual scrolling renders only the rows near the viewport and stands in for the rest with fixed-height spacers, so tables with tens of thousands of rows scroll smoothly with a small, constant DOM. It ships as the optional `ng-advanced-table/virtual-scroll` entry point and is powered by the Angular CDK virtual-scroll engine.

## When to use it

Reach for virtualization when a single page of the table renders thousands of rows — dashboards without pagination, log views, long reference lists. If your table already paginates to a few hundred rows per page, pagination alone is usually simpler: virtualization trades away variable row heights and sub-header rows for DOM economy.

## Install

The engine uses `@angular/cdk`, which is already a required peer of the table package:

```bash
pnpm add ng-advanced-table @angular/aria @angular/cdk
# or: npm install ng-advanced-table @angular/aria @angular/cdk
```

## Basic wiring

Add the `natTableVirtualScroll` directive to the table and give the region a bounded height so it can scroll vertically:

```ts
import { Component } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';
import { NatTableVirtualScroll } from 'ng-advanced-table/virtual-scroll';

@Component({
  selector: 'app-event-log',
  imports: [NatTable, NatTableSurface, NatTableVirtualScroll],
  styles: `
    nat-table {
      --nat-table-max-height: 480px;
    }
  `,
  template: `
    <nat-table-surface [stickyHeader]="true">
      <nat-table [columns]="columns" [data]="rows()" [natTableVirtualScroll]="{ rowHeight: 48 }" accessibleName="Event log" />
    </nat-table-surface>
  `
})
export class EventLog {
  /* columns and rows as usual */
}
```

Nothing else about the table changes: sticky headers, pinned columns, selection, sorting, filtering, companion controls, and theming keep working, because the table still renders a real `<table>` — the directive only decides which rows stay mounted.

## How it works

The directive hosts a real, invisible `CdkVirtualScrollViewport` inside the table's scroll region and hands it the region as its scrollable. The stock CDK `FixedSizeVirtualScrollStrategy` audits scrolling and computes the rendered range; the table then mounts exactly those rows and fills the gaps with spacer rows sized `rowCount * rowHeight`. A transform-based CDK viewport cannot wrap a `<table>` without dislocating its sticky header, which is why the viewport runs headless and native spacer rows own the geometry.

## Options

| Option        | Default | Meaning                                                                                    |
| ------------- | ------- | ------------------------------------------------------------------------------------------ |
| `rowHeight`   | —       | Required. Fixed rendered height of every body row in px, including borders.                |
| `minBufferPx` | `100`   | Minimum buffered content beyond the viewport edges before more rows mount (CDK semantics). |
| `maxBufferPx` | `200`   | Buffer restored once the minimum is breached; at least `minBufferPx` (CDK semantics).      |

## The row-height contract

`rowHeight` is load-bearing: spacer heights and scroll positions are computed from it. The table pins mounted data rows to exactly this height, so keep cell content within one line or clip it (for example with `meta.cellMaxLines`). Rows with naturally varying heights are not supported.

Pick a value your content actually fits into, and verify it in the browser. A height on a `<tr>` is a _minimum_, not a fixed size, so a `rowHeight` smaller than one line of text plus the cell padding and row border is silently ignored — rows render taller than declared and the spacer geometry drifts from the real layout. With the stock theme, one line of text plus padding and border measures just under 48px, which is why the example below uses `rowHeight: 48`.

## Scrolling behavior

- A changed row-id sequence (for example after sorting, filtering, paging, or replacement with different records) resets to the top when focus is outside the body. If the focused stable row survives, the directive follows that row to its new logical position and preserves the focused column.
- If a row-model change removes the focused row, focus returns to the matching column header at the reset position.
- Replacing row objects while preserving the same ordered stable ids keeps scroll and focus. Appending rows (infinite loading) also keeps the scroll position; only the trailing spacer grows.
- The directive exports itself as `natTableVirtualScroll`, so a template reference gives you the imperative API: `scrollToIndex(index)`, `scrollToOffset(px)`, `checkViewportSize()`, and the `renderedRowRange` signal.

## Keyboard and focus

The grid's roving focus is preserved: the focused row stays mounted even when it scrolls out of the window, so <kbd>Tab</kbd> returns to where you left. Vertical navigation whose target row is not mounted yet pre-scrolls and waits for the row to mount. <kbd>ArrowUp</kbd>/<kbd>ArrowDown</kbd> preserve the column, <kbd>PageUp</kbd>/<kbd>PageDown</kbd> move by the visible row-page size, and <kbd>Ctrl</kbd>/<kbd>Command</kbd>+<kbd>End</kbd> lands on the bottom-right cell. Focus handoff reveals unpinned columns within the center scroll zone without hiding them behind pinned columns, including in RTL. Rows revealed under a sticky header are nudged below its configured top inset.

## Accessibility

With only a subset of rows in the DOM, the table switches to explicit ARIA indexing: the `<table>` reports the full logical grid via `aria-rowcount`, and every mounted row carries its absolute `aria-rowindex`, so screen readers announce "row 4,832 of 10,001" instead of a position within the rendered window.

## Custom row-window providers

`NAT_TABLE_ROW_WINDOW` and `NatTableRowWindow` are the low-level extension seam for a different virtualization engine. The core table sanitizes the provider's indexes, renders accessible spacer rows, publishes absolute row indices and the logical row count (including server-rendered HTML), retains a focused stable row, reveals focused cells around pinned zones, and falls back to the matching header when that row disappears.

A custom provider still owns viewport measurement, rendered-range updates, fixed-height enforcement, async data synchronization, observer cleanup, and keyboard handoff that requires an unmounted target to be scrolled into range. The bundled `NatTableVirtualScroll` supplies those safeguards; use the low-level token only when the custom engine implements and tests equivalent behavior.

## Limitations

- Sub-header rows (`subHeaderColumn`) are not supported: interleaved group rows break the fixed-row-height geometry. A dev-mode warning fires if both are enabled.
- Per-row render metrics events are suppressed while virtualized, because scroll-mounted rows would report timings against the wrong render cycle.
- Only the table renderer virtualizes; `nat-list` always renders its full page.
- Row heights must be fixed; auto-sized rows are out of scope for the fixed-size engine.
