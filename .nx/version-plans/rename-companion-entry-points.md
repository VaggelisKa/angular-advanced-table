---
ng-advanced-table: minor
---

Rename two companion subpath entry points for clarity (breaking import change): `ng-advanced-table/ui` → `ng-advanced-table/components` and `ng-advanced-table/utils` → `ng-advanced-table/render-metrics`. `/utils` was a misnomer — it only ever exported the render-metrics store, filter, panel, and column builder. The `.` (core) and `/locale` entry points are unchanged. Consumers update their import specifiers accordingly.
