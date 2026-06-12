---
ng-advanced-table: minor
ng-advanced-table-locales: patch
---

Add server-driven (manual) data modes to `NatTable`: `manualSorting`, `manualFiltering`, and `manualPagination` inputs disable the matching client row models so a server can own those concerns, `rowCount` reports the full server total (driving the summary, page count, and `aria-rowcount`), and `loading` marks the grid busy via `aria-busy` plus an `is-loading` styling hook. The grid now also exposes `aria-rowcount`/`aria-colcount` and per-cell `aria-rowindex`/`aria-colindex` so assistive technology announces each row's absolute position in the full (paged) dataset, and the English `tableSummary` copy now reports "X of Y rows" whenever totals differ from visible rows so server-provided totals read correctly.
