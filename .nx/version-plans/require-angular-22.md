---
ng-advanced-table: minor
---

Require Angular 22. Each package's `@angular/*` peer dependencies are bumped to `^22.0.0` (`@angular/core` and `@angular/common`, plus `@angular/cdk` and `@angular/aria` for the table and UI packages) as part of upgrading the workspace to Angular 22, TypeScript 6.0, ng-packagr 22, and Nx 23.1. Consumers must be on Angular 22 or later.

Applying the Angular 22 schematic migrations and follow-up cleanup moved the workspace fully onto Angular 22 defaults: explicit `ChangeDetectionStrategy.OnPush` was removed from every component and the migration's `Eager` opt-out was dropped, so all components rely on the framework default (`OnPush`). Example docs were updated to match, and stale `@angular/aria` preview wording was removed now that Angular Aria is stable in v22.
