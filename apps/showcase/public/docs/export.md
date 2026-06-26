## Export Button

Table Data Export is an optional Table Action from `ng-advanced-table-ui`. Add `natTableExport` to an interactive host element and place it wherever the command belongs.

```html
<button type="button" natToolbarItem natTableExport exportFileName="services">Export CSV</button>
```

The directive resolves the table controller from the surrounding surface. It sets busy/disabled state while exporting and downloads a CSV by default.

## Export Scope

The default CSV export uses all rows currently held by the client table, visible exportable leaf columns in current column order, and `meta.export` overrides for headers, inclusion, and values.

It does not export all records that may exist in an external data source. Use a custom Export Handler when export scope must include remote records, selected rows, audit logging, or a server-generated file.

## Column Export Metadata

Accessor columns export by default. Display columns opt out unless `meta.export.enabled` is set. Use `meta.export` when exported data should differ from rendered cell text.

## Custom Export Handler

Provide a per-button handler when one export action needs custom behavior, or `provideNatTableExport(...)` when every export button should use the same application service.

Handlers can call `context.getData()` for normalized export data or `context.exportCsv()` to delegate back to the built-in CSV handler.
