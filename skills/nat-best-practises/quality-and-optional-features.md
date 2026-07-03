# Quality And Optional Features

For accessibility, read [accessibility.md](accessibility.md). For styling, read [styling.md](styling.md).

## Localization

- Use `provideNatTableLocales(...)` for core grid copy.
- Use `provideNatTableControlsLocales(...)` for companion controls.
- Use `provideNatTableRenderMetricsLocales(...)` for render metrics.
- When visible text or `aria-label` copy changes, keep visible words inside accessible names.

## Export

- Use `natTableExport` and `provideNatTableExport(...)` from `ng-advanced-table/components`.
- Keep file names, export scope, server export calls, and permission checks in the app.
- Use column export metadata for column-level export behavior.

## Render Metrics

- Use `ng-advanced-table/render-metrics` only for opt-in diagnostics.
- Wire `NatRenderMetricsFilter` and `NatRenderMetricsPanel` through an explicit `[controller]`.
- Do not place `NatRenderMetricsFilter` inside `<nat-table-toolbar>`; it is its own labeled button group.

## Review Checklist

- Use public entry-point imports only.
- Keep app workflow logic outside table primitives.
- Controlled state updates preserve unrelated slices.
- Loading, empty, and error states use `dataStatus`.
- Toolbar participants use `natToolbarItem` or `NatToolbarGroup`.
- Accessibility checks from [accessibility.md](accessibility.md) are covered.
- Styling checks from [styling.md](styling.md) are covered.
- Optional locale/export/render-metrics features use their companion entry points.
