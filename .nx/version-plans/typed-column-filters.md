---
ng-advanced-table: minor
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
---

Add declarative typed column filters: the new `natTypedFilterFn` predicate (exported with the `NatTableFilterType`, `NatTableFilterOperator`, `NatTableColumnFilterConfig`, and `NatTableColumnFilterValue` types) applies operator-based text, number, date, and set comparisons from a `{ operator, value }` column-filter entry, and `NatTableColumnMeta` gains an optional `meta.filter` block (type, offered operators, set options) so columns can describe their filter UI declaratively across the table, companion UI, and render-metrics contracts.
