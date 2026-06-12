---
ng-advanced-table: minor
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
---

Add declarative cell display formatting through `meta.valueFormatter`: when a column declares it, `<nat-table>` renders the formatter's locale-aware string (passing the cell value, row, and resolved table locale) instead of the default cell output, while columns without it keep the existing `flexRender` cell-renderer path. The shared `NatTableColumnMeta` contracts in the UI and utils packages gain the matching optional field.
