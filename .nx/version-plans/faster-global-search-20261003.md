---
ng-advanced-table: patch
---

The built-in global search filter does less work per cell: plain (non-array) values skip the nested-value traversal and its allocations, the query is normalized once per search instead of once per cell, and a row's id is matched once per row instead of once per column. Results are unchanged. On 100,000 rows × 20 columns a search that matches nothing drops from about 1.08 s to 0.75 s, and a matching search from about 620 ms to 360 ms.
