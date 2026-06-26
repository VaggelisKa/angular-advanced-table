---
ng-advanced-table: major
---

Consolidate the four published packages into a single `ng-advanced-table` package that exposes its layers through ng-packagr subpath entry points — `ng-advanced-table/ui`, `ng-advanced-table/utils`, and `ng-advanced-table/locale` — mirroring how `@angular/cdk` ships `@angular/cdk/table`, `@angular/cdk/overlay`, etc. One install, one version, atomic releases; the wildcard internal `ng-advanced-table-locales` dependency is gone (locales is now an entry point, not a published dependency).

BREAKING CHANGE: the standalone `ng-advanced-table-ui`, `ng-advanced-table-utils`, and `ng-advanced-table-locales` packages are no longer published. Install only `ng-advanced-table` and update imports:

- `ng-advanced-table-ui` → `ng-advanced-table/ui`
- `ng-advanced-table-utils` → `ng-advanced-table/utils`
- `ng-advanced-table-locales` → `ng-advanced-table/locale`

The core entry point (`ng-advanced-table`) and every exported symbol are unchanged.
