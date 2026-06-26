---
ng-advanced-table: patch
---

Remove the TypeScript 6 and Angular compiler diagnostic shims from the workspace configuration. Package, showcase, and spec tsconfigs no longer rely on `baseUrl`, `ignoreDeprecations`, `nullishCoalescingNotNullable` suppression, or `optionalChainNotNullable` suppression, and test path mappings now use explicit relative targets.
