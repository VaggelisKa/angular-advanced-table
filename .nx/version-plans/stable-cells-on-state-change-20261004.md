---
ng-advanced-table: patch
---

A table state change that leaves its rows in place, such as a sort or a selection toggle, no longer rebuilds every rendered cell. The table handed TanStack a new but equal column order and pinning on every state change, so every rendered row recreated its cells and re-rendered their content; it now keeps the previous arrays while the ids are unchanged. On a fully rendered 1,000-row × 20-column table a state change that leaves the rows in place drops from about 170 ms to 110 ms. Sorting a large fully rendered table stays slow, because the browser lays out every moved row again; the Virtualization documentation now says when that cost calls for virtualization or pagination.
