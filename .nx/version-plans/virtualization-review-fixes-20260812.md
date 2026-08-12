---
ng-advanced-table: patch
---

Harden custom row virtualization after the final review.

Nested tables now retain ownership of their keyboard and focus interactions instead of allowing the outer virtualizer to intercept navigation or recover focus into nested rows. Mounted-range events are deduplicated when appended data leaves the window unchanged, row-model append detection compares arbitrary stable IDs without delimiter collisions, and core discards non-monotonic custom row extents before they can corrupt spacer geometry.
