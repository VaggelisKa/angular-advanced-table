# ng-advanced-table

Reusable Angular data-table primitives built on [TanStack Table](https://tanstack.com/table). Exposes a signals-first `<nat-table>` component plus companion controls that share state through a lightweight ref pattern.

## Building

```bash
npm run build:packages
```

Output is written to `dist/ng-advanced-table`.

## Running unit tests

```bash
npm run test:packages
```

To run only this package's tests:

```bash
ng test ng-advanced-table
```

## Versioning

Add a changeset from the repo root whenever this package changes in a way that should ship to npm:

```bash
npm run changeset
```

Before cutting a release, update versions and changelogs from the workspace root:

```bash
npm run version:packages
```

## Publishing

The preferred release path is the repo-level GitHub Actions `Release` workflow.

For a local fallback, validate the dist package before a release:

```bash
npm run version:packages
npm install --package-lock-only
npm run verify
```

Then publish from the workspace root:

```bash
npm run pack:dry-run
npm publish ./dist/ng-advanced-table
```
