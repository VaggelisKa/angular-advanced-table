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
npm run build:packages
```

The packages are written to `dist/ng-advanced-table` and `dist/ng-advanced-table-utils`.

## Running unit tests

```bash
npm test                         # the showcase application
npm run test:packages           # both publishable libraries
ng test ng-advanced-table       # the core library only
ng test ng-advanced-table-utils # the companion helpers only
```

## Versioning and release prep

This repo uses [Changesets](https://github.com/changesets/changesets) to track package releases for:

- `ng-advanced-table`
- `ng-advanced-table-utils`

Create a changeset in feature branches when package-facing work lands:

```bash
npm run changeset
```

Validate that the branch has the release metadata expected by CI:

```bash
npm run changeset:status
```

When preparing a release, apply the pending version bumps and changelog updates from the repo root:

```bash
npm run version:packages
```

Run the full validation pipeline locally before publishing:

```bash
npm run verify
```

## On-demand releases

Releases are intended to be run manually from GitHub Actions through the `Release` workflow on `main`.

The workflow:

- requires pending changesets
- applies `changeset version`
- refreshes `package-lock.json`
- runs the full verification pipeline on Node 22
- publishes only the packages whose versions changed
- commits the consumed changesets, version bumps, and changelog updates back to the branch
- tags published versions as `ng-advanced-table@x.y.z` and `ng-advanced-table-utils@x.y.z`

Before using it, add an `NPM_TOKEN` repository secret that contains an npm access token with write access for both packages.

## Local publishing fallback

If you need to publish outside GitHub Actions, apply version updates first:

```bash
npm run version:packages
npm install --package-lock-only
npm run verify
```

Then publish changed packages from `dist/`, publishing `ng-advanced-table` before `ng-advanced-table-utils` when both are included in the same release:

```bash
npm publish ./dist/ng-advanced-table
npm publish ./dist/ng-advanced-table-utils
```
