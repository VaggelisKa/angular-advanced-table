---
ng-advanced-table: major
ng-advanced-table-ui: patch
---

**Breaking (`ng-advanced-table`):** Remove multi-column sorting (`enableMultiSort`, TanStack `maxMultiSortColCount`). Sorting is always single-column: merged state normalizes to one entry, TanStack is configured with `enableMultiSort: false` and `isMultiSortEvent` never true. Remove `NatTableAccessibilitySortingEntry` and the `sortings` field from `NatTableAccessibilitySortingAnnouncementContext`.

**`ng-advanced-table-ui`:** Header sort control calls `column.toggleSorting()` again (no `getToggleSortingHandler` / Shift path).

Other recent `NatTable` additions (for example `(rowActivate)` and controlled-state documentation) are unchanged by this removal.
