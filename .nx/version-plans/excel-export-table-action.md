---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-utils: minor
---

Add the `NatTableExportExcel` Table Action directive to `ng-advanced-table-ui`, with automatic client-side `.xlsx` export, `exportFileName`, per-instance `exportHandler`, app-level `provideNatTableExcelExport(...)` configuration, and an exported directive instance with `trigger(...)` for bridging custom activation events. Export handlers receive the resolved table, all client-held rows, visible exportable leaf columns, the normalized file name, and `export()` for delegating to the client-side handler.

Extend `NatTableColumnMeta` with `meta.export` options so shared column definitions can opt columns in or out, override exported headers, and map raw cell values for export. The core, UI, and utils public metadata contracts stay aligned.
