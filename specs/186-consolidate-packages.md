# 186 — Consolidate libs into one `ng-advanced-table` package (subpath entry points) + tighten release CI

Tracking issue: #186. Status: **approved, blocked on pre-release**.

## Decision summary

- **Consolidate** the 4 published libs into one `ng-advanced-table` package exposing layers via ng-packagr secondary entry points (`/ui`, `/utils`, `/locale`), mirroring `@angular/cdk`.
- **Give up independent per-package versioning** (confirmed). The `"ng-advanced-table-locales": "*"` wildcard deps already prevent true independence; consolidation formalises reality and kills the `core@1.2 + ui@1.0` mismatch footgun.
- **`ng-advanced-table-types` stays untouched.** It is a **test-only contract mirror** — all 4 importers are `.spec.ts`, and production `table.types.ts` never references it. Each lib defines its own copy of the contracts; `-types` is the canonical mirror specs assert against via `Equal<>`. It is never built/published (no `package.json`/`ng-package.json`, source-only alias). NOT folded into core (would leak test contracts), NOT published.
- **Target version: 2.0.0** (breaking — package names change to subpaths).
- **Scope:** one PR — Part A (restructure) then Part B (CI gate).

## Hard ordering gate (owner: maintainer)

Run `nx release` (the `release.yml` workflow_dispatch) to consume the **43 pending version-plans** and publish the final independent 1.x versions **before** this lands. The 43 plans are keyed to the old project names; once projects collapse they break `nx release plan:check`. After release the plans dir is clean. Old packages get `npm deprecate`d post-merge (maintainer).

## Production dependency graph (specs excluded — drives ng-packagr build order)

```
locale → leaf
core    → locale
ui      → core, locale
utils   → locale
types   → (test-only, not in production graph)
```

Every production cross-layer import already uses the package specifier (never deep relative paths), so they already obey ng-packagr's cross-entry-point rule. The codemod is a pure specifier swap, no refactoring.

## Target layout

```
libs/ng-advanced-table/
  package.json        # ONE manifest: name, 2.0.0, peerDeps union, sideEffects:false, nx targets
  ng-package.json     # primary EP → dist/libs/ng-advanced-table
  src/...             # core (unchanged)
  ui/      { ng-package.json, src/ }   → ng-advanced-table/ui
  utils/   { ng-package.json, src/ }   → ng-advanced-table/utils
  locale/  { ng-package.json, src/ }   → ng-advanced-table/locale
  testing/ { public-api.ts, lib/, type-assertions.ts }  # test-only contract mirror (alias ng-advanced-table-types; never bundled)
```

## Phases

### Phase 1 — Restructure

1. `git mv libs/ng-advanced-table-{ui,utils,locales}/src` → `libs/ng-advanced-table/{ui,utils,locales}/src`.
2. Each EP folder gets `ng-package.json`: `{ "lib": { "entryFile": "src/public-api.ts" } }`.
3. Delete the 3 old project folders (their `package.json`/`ng-package.json`/tsconfigs).
4. `ng-advanced-table-types` untouched.

### Phase 2 — Manifest + tsconfig

5. Consolidated `package.json`:
   - `dependencies`: `tslib` only (delete the `ng-advanced-table-locales: "*"` wildcard).
   - `peerDependencies` (union): `@angular/cdk`, `@angular/aria`, `@angular/common`, `@angular/core`, `@tanstack/angular-table` (all `catalog:peers`).
   - `nx.targets`: one `build`/`test-build`/`test` set for the whole package.
   - drop `allowedNonPeerDependencies` from primary `ng-package.json` (locales is no longer a dep).
6. `tsconfig.base.json` paths → `ng-advanced-table`, `ng-advanced-table/ui|utils|locale` (+ `dist/...` fallbacks). Leave `ng-advanced-table-types` alone.

### Phase 3 — Codemod (~50 files, anchor on quotes — `ng-advanced-table` is a prefix of the others)

7. `'ng-advanced-table-ui'` → `'ng-advanced-table/ui'`; `-utils` → `/utils`; `-locales` → `/locale`. Leave `'ng-advanced-table'` and `'ng-advanced-table-types'` unchanged.

### Phase 4 — Release config

8. `nx.json`: `release.projects: ["ng-advanced-table"]`; drop `projectsRelationship: "independent"`; drop the `{projectName}@{version}` tag (default `v{version}`); `workspaceChangelog: true`; keep `versionPlans`.
9. Root `package.json` scripts: `build:packages`/`pack:dry-run` target the one package; drop the 3 `workspace:*` devDeps.
10. Add version plan `consolidate-packages.md` → `ng-advanced-table: major` + breaking-change note.

### Phase 5 — Part B (CI gate)

11. Drop `test:packages` from `verify` (the `checks` job already ran unit tests).
12. Surface `nx release --dry-run` as its own visible step; rename job `release` → `release-gate`. Keep `plan:check`.

### Phase 6 — Docs + verify

13. README/quick-start rewrite: one install, subpath imports + migration table (`-ui` → `/ui`, etc.).
14. Gates:

- `nx build ng-advanced-table` produces `dist/.../{ui,utils,locales}` with a correct `exports` map → confirm via `npm pack --dry-run`.
- **Riskiest:** test count matches the pre-consolidation sum (verify `@angular/build:unit-test` discovers specs across all EP subfolders — don't assume).
- Showcase build + e2e green.
- `nx release --dry-run` shows a single 2.0.0.

## Out of scope (maintainer, post-merge)

- `npm deprecate` the 4 old packages pointing at the new subpaths.

## Amendments (2026-06-26, post-spec)

Refinements made on branch `art/feat/consolidate-packages` after this spec was written. The plan above is kept as the original record; the items below are the current reality where they differ.

- **Entry files renamed `public-api.ts` → `index.ts`** (every entry point + `testing/`). Lets directory specifiers resolve to the folder (e.g. `./ui`). Synced refs: each `ng-package.json` `entryFile`, `package.json` `exports`/`typings`, and the tsconfig path mappings.
- **`ng-advanced-table-types` alias removed** (deviates from "stays untouched" above). The 4 `*.spec.ts` importers now use a relative path (`../testing`, `../../testing`, `../../../testing`). The `testing/` mirror folder and its test-only role are unchanged — only the import mechanism changed (relative instead of the alias).
- **Path mappings moved out of `tsconfig.base.json` → new `tsconfig.paths.json`**, and the `dist/...` fallbacks dropped. Only the showcase config and the library `tsconfig.spec.json` extend `tsconfig.paths.json`. The production build (`tsconfig.lib*.json`) has no path mappings and resolves `ng-advanced-table` (+ subpaths) via `node_modules` + the package `exports` map, like a published consumer.
- **Subpath entry points kept** (`/ui`, `/utils`, `/locale`) — collapse-to-single-entry was considered and rejected. Cross-entry production imports remain package specifiers (ng-packagr hard-errors on relative cross-entry imports — verified).
- Gates after these changes: lib build (4 entry points) green, 267 unit tests green, showcase build green.
