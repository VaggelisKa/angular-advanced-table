---
ng-advanced-table: patch
---

Dragging a column resize handle no longer re-checks every rendered row and cell on each pointer move. The drag guide now updates only itself, so with the default `columnResizeMode: 'onEnd'` a 1,000-row × 20-column table spends about 9 ms per pointer move instead of about 60 ms. The guide looks and behaves the same, including staying on a pinned column's edge while the region scrolls.
