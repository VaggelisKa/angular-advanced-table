---
ng-advanced-table: minor
---

**Breaking:** Virtualized tables now reuse row views while scrolling instead of destroying the rows that leave the window and building new ones for the rows that enter. A row entering the window takes over the `<tr>`, cells, and cell renderers of a row that left, and a component cell receives the new row through its inputs instead of being created again, so cell components and templates must derive everything they show from their inputs or context and keep per-row UI state in the row data or keyed by row id. Rows that stay mounted, including the focused row, keep their DOM. Scroll frames on a 10,000 × 20 virtualized table drop from about 33 ms to 17 ms (60 fps), and from about 67 ms to 33 ms on 100,000 × 40 with selection and pinned columns. Non-virtualized tables are unchanged.
