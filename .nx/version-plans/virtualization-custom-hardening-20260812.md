---
ng-advanced-table: minor
---

Harden the custom row-virtualization engine and narrow what it adds to the core public API.

Appending rows no longer resets the vertical window. The row-model reset now compares the joined row-id sequence and treats an unchanged prefix as an append, so cursor and "load more" fetching keeps the reader's scroll position and mounted window; sorting, filtering, paging, reordering, truncation, and replaced data still reset, and the existing focus-following behavior on reset is unchanged.

`NatTableVirtualize` gains a `(virtualRangeChange)` output emitting `{ startIndex, endIndex, count }` for the mounted window (inclusive bounds in the current row model, batched by the engine's overscan hysteresis) so applications can fetch on approach. `NatTableVirtualRangeChange` is exported from `ng-advanced-table/virtualization`.

Row-render strategies are now resolved with `{ self: true }`, so a nested `<nat-table>` or `<nat-list>` inside a virtualized table can no longer inherit the outer table's row window and render a partial row set.

Row-render metrics keep working under virtualization with corrected cycle semantics: a render cycle is one row-model rebuild, and a moved row window restamps the timing clock without opening a new cycle. Rows that stay mounted across a scroll no longer re-report (they did not re-render), while rows that mount during a scroll report their real mount cost.

Core's public surface for the contract shrinks: `NatTableBodyRenderPlan` and `NatTableRenderedBodyRow` are internal again, `NatTableRowWindowHost` drops its unused `subHeaderGroups` member, and the remaining public names (`NatTableRowRenderStrategy`, `NatTableVirtualItem`, `NAT_TABLE_ROW_WINDOW_HOST`, `NatTableRowWindowHost`, `NatTableRowRenderStrategyRegistry`) move to the `common`/`domain-logic` barrels, leaving core's hand-written `src/index.ts` untouched by virtualization. The `ng-advanced-table` size ceiling stays at its existing 70,000 gzipped bytes — no raise.
