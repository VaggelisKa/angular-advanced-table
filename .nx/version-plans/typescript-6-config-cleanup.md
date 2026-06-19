---
ng-advanced-table: patch
ng-advanced-table-ui: patch
ng-advanced-table-utils: patch
ng-advanced-table-locales: patch
---

Remove the TypeScript 6 and Angular compiler diagnostic shims from the workspace configuration. Package, showcase, and spec tsconfigs no longer rely on `baseUrl`, `ignoreDeprecations`, `nullishCoalescingNotNullable` suppression, or `optionalChainNotNullable` suppression, and test path mappings now use explicit relative targets.
