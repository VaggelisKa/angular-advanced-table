# ng-advanced-table-utils

Optional companion helpers for [`ng-advanced-table`](../ng-advanced-table/README.md). Ship only the pieces you need alongside the core `<nat-table>` component.

Currently bundled:

- **Render metrics** — a lightweight instrumentation layer that records per-row render time, aggregates it into a measurement signal, and renders a KPI chip plus a fast / watch / slow filter chip row. Useful for perf demos and render-health dashboards.

## Building

```bash
ng build ng-advanced-table-utils
```

Output is written to `dist/ng-advanced-table-utils`.

## Running unit tests

```bash
ng test ng-advanced-table-utils
```
