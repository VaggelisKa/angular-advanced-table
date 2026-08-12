---
ng-advanced-table: patch
---

Harden custom row virtualization after the final review.

Nested tables now retain ownership of their keyboard and focus interactions instead of allowing the outer virtualizer to intercept navigation or recover focus into nested rows. Ownership also holds in the other nesting direction: a virtualized table rendered inside another table's row no longer reads that outer row's index for a keydown on its own header cell, so Page Up, Page Down, and arrow keys stay with the header row instead of paging the nested body. Mounted-range events are deduplicated when appended data leaves the window unchanged, row-model append detection compares arbitrary stable IDs without delimiter collisions, and core discards non-monotonic custom row extents before they can corrupt spacer geometry.
