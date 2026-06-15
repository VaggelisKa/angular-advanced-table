---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-locales: minor
---

Add multi-column sorting: a new `enableMultiSort` input keeps every deduped sort entry and treats Shift+click (or Shift+Enter on a focused sort button) as a multi-sort event, header actions render an aria-hidden sort-priority badge while folding the "N of M" ordinal into the sort button's accessible name, and the sorting live announcement now receives `sortedColumns` in priority order so the English locale reads combined sorts as "Sorted by A ascending, then B descending."
