---
ng-advanced-table: patch
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
ng-advanced-table-locales: patch
---

Remove the TypeScript 6 deprecation shims from the workspace configuration. Package and spec tsconfigs no longer rely on `baseUrl` or `ignoreDeprecations`, and test path mappings now use explicit relative targets.
