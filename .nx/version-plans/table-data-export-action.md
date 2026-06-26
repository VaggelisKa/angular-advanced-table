---
ng-advanced-table: minor
---

Add the `NatTableExport` Table Action directive to `ng-advanced-table/ui`, with automatic client-side CSV export, `exportFileName`, per-instance `exportHandler`, app-level `provideNatTableExport(...)` configuration, and an exported directive instance with `trigger(...)` for bridging custom activation events. Export handlers receive the resolved table, all client-held rows, visible exportable leaf columns, the normalized file name, `getData()` for lazily resolving a normalized export data snapshot, and `exportCsv()` for delegating to the built-in CSV handler.

Extend `NatTableColumnMeta` with `meta.export` options so shared column definitions can opt columns in or out, override exported headers, and map raw cell values for export. The core, UI, and utils public metadata contracts stay aligned.
