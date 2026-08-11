---
ng-advanced-table: patch
---

Reveal focused header cells past sticky pinned columns.

Focusing a body cell already scrolls it clear of the pinned zones, but header cells kept the browser's default behavior, which stops as soon as the cell is inside the region box — so arrow-key navigation along the header row could park a column header underneath a pinned column and paint its text over the pinned content.

The header `focusin` path now performs the same reveal. It is not gated on row virtualization, because the overlap happens in any table with pinned columns and a scrolling region. `revealWindowedCellHorizontally` is renamed to `revealCellHorizontally` now that it serves both body and header cells, and it additionally leaves row-spanning cells (group headers, state rows, spacer rows) alone, since scrolling those would yank the region to their start edge.
