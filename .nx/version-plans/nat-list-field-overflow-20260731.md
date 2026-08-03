---
ng-advanced-table: patch
---

Keep long `nat-list` field values inside their grid area. `.list-field` now allows shrinking (`min-width: 0`) and the value wraps (`overflow-wrap: anywhere`), so a long value no longer overflows into the neighbouring field area at narrow widths — which also left automated contrast checks unable to resolve a background.
