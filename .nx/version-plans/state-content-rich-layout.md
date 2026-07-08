---
ng-advanced-table: minor
---

Lay out empty/loading/error state content in a centered flex column so projected rich content (custom elements, block/flex layouts) no longer collapses to zero size. Add a `--nat-table-state-min-height` token to reserve vertical space for state rows (defaults to `--nat-table-min-height`, else `0`).
