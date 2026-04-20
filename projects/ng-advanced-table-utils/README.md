# ng-advanced-table-utils

Optional companion helpers for [`ng-advanced-table`](../ng-advanced-table/README.md). Ship only the pieces you need alongside the core `<nat-table>` component.
This package does not import the core library directly; it works with structural event/controller contracts so consuming apps can compose it with any compatible table implementation.

Currently bundled:

- **Render metrics** — a lightweight instrumentation layer that records per-row render time, aggregates it into a measurement signal, and renders a KPI chip plus a fast / watch / slow filter chip row. Useful for perf demos and render-health dashboards.

## Building

```bash
npm run build:packages
```

Output is written to `dist/ng-advanced-table-utils`.

## Running unit tests

```bash
npm run test:packages
```

To run only this package's tests:

```bash
ng test ng-advanced-table-utils
```

## Versioning

Track publishable changes from the repo root with Changesets:

```bash
npm run changeset
```

Apply pending version bumps and changelog updates before a release:

```bash
npm run version:packages
```

## Publishing

The preferred release path is the repo-level GitHub Actions `Release` workflow.

For a local fallback, prepare and validate the release from the workspace root:

```bash
npm run version:packages
npm install --package-lock-only
npm run verify
```

Then publish this package on its own, or alongside any compatible table package:

```bash
npm run pack:dry-run
npm publish ./dist/ng-advanced-table-utils
```
