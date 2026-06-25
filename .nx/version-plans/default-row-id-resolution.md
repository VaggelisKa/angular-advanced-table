---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-utils: minor
ng-advanced-table-locales: patch
---

Add built-in row id resolution for rows that expose a string or number `id` property. Consumers can still pass `getRowId` for custom, composite, or nested row identity, and rows without a usable `id` continue to fall back to positional ids.

Companion export data and render-metrics events now receive those stable row ids by default when rows expose `id`.
