---
ng-advanced-table-ui: minor
---

Add the structural column helpers `withRowNumberColumn` and `withActionsColumn` to `ng-advanced-table-ui`. `withRowNumberColumn` prepends a column showing each row's 1-based position in the current filtered and sorted row model (continuous across pages), and `withActionsColumn` appends a non-sortable, non-hidable actions column rendered through a consumer callback. Both helpers follow the `(columns) => columns` composition shape and ship no hardcoded copy: the actions header is a required option and the row-number accessible label is an optional one, so consumers route real words through their active locale.
