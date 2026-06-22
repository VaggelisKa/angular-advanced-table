---
ng-advanced-table: patch
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
ng-advanced-table-locales: patch
---

Move upstream package build dependencies from the global Nx `serve` target to `test` and `e2e` targets so affected CI waits for package outputs without making nested showcase dev-server startup re-enter package build tasks.
