---
ng-advanced-table: patch
---

Fix Nx cache inputs so root and library-level TypeScript configuration changes invalidate cached `test` results.

`sharedGlobals` was empty, so a content change to `tsconfig.base.json` or `tsconfig.paths.json` left `nx affected -t test` replaying cached results. Because `tsconfig.paths.json` is what resolves every `ng-advanced-table/*` specifier in specs, a broken path mapping could pass CI on a stale cache. `sharedGlobals` now carries `.browserslistrc`, `tsconfig.base.json`, and `tsconfig.paths.json`.

The library `tsconfig.json` and `tsconfig.spec.json` live at `libs/ng-advanced-table/`, which is outside every entry-point `projectRoot` (`src`, `components`, `locale`, `render-metrics`), so editing them also invalidated nothing. A new `libEntryPointTsConfigs` named input is now listed in each entry point's `test` inputs.

Entry-point cache isolation is unchanged: a `components` edit still does not invalidate the `locale` test cache. `pnpm-lock.yaml` is deliberately excluded — Nx already hashes resolved external dependencies through the project graph, and adding the lockfile would blanket-invalidate every task on unrelated dependency churn.
