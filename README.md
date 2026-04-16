# AngularAdvancedTable

This workspace hosts a reusable Angular table library and a showcase application.

- **`projects/ng-advanced-table`** — core `<nat-table>` component and types, publishable as `ng-advanced-table` on npm.
- **`projects/ng-advanced-table-utils`** — optional companion helpers (render metrics, filter / panel components, `withRenderMetricsColumn`). Publishable as `ng-advanced-table-utils` on npm.
- **`src/`** — the Angular application that consumes both libraries and hosts the trading-style showcase page.

## Development server

```bash
ng serve
```

Open your browser at `http://localhost:4200/`.

## Library builds

```bash
ng build ng-advanced-table
ng build ng-advanced-table-utils
```

The packages are written to `dist/ng-advanced-table` and `dist/ng-advanced-table-utils`.

## Running unit tests

```bash
ng test                          # the showcase application
ng test ng-advanced-table        # the core library
ng test ng-advanced-table-utils  # the companion helpers
```
