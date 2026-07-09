---
ng-advanced-table: major
---

Gate column reordering on per-column `meta.reorderable`. Columns must now opt in with `meta: { reorderable: true }`; enabling reordering at the table level no longer makes every column draggable. The table builder emits `meta.reorderable` automatically when reordering is enabled.
