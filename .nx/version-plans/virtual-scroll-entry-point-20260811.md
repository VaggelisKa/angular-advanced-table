---
ng-advanced-table: minor
---

Add the `ng-advanced-table/virtual-scroll` entry point: CDK-powered fixed-height row virtualization for `<nat-table>`.

The new `NatTableVirtualScroll` directive (`nat-table[natTableVirtualScroll]`) hosts a headless `CdkVirtualScrollViewport` inside the table's scroll region and republishes the stock CDK `FixedSizeVirtualScrollStrategy` rendered range through a new core row-window contract (`NAT_TABLE_ROW_WINDOW` / `NatTableRowWindow`). While a window is attached the table mounts only the windowed body rows, fills gaps with fixed-height spacer rows, pins mounted rows to the contracted `rowHeight`, binds absolute `aria-rowindex` values, and reports the full logical grid via `aria-rowcount`. The focused row stays mounted so roving grid focus never dangles; vertical keys targeting unmounted rows pre-scroll and hand focus over after mount; changed row order resets scrolling to the top while pure appends keep the position.

Per-row render events are suppressed while virtualized, and sub-header rows are unsupported in combination with virtualization (dev-mode warnings cover both).
