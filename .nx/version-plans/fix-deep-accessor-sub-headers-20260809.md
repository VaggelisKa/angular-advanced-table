---
ng-advanced-table: patch
---

Fix sub-header grouping for columns that use deep accessor keys such as `account.status`.

TanStack normalizes dots in an `accessorKey` to underscores when it creates the runtime column id. The library's column-definition helper kept the unnormalized accessor key, so `subHeaderColumn="account_status"` was rejected as unknown and a configured sub-header order could not patch the column's sorting function.

Column-definition ids now follow TanStack's normalization, keeping sub-header validation and custom group ordering aligned with the actual table column ids.
