---
ng-advanced-table: minor
---

Re-architect the table controller state around typed commands and selectors (RFC #226). The `NatTableUiController` contract consumed by companion UI controls replaces the single generic `patchState(...)` method with intent-named command methods — `setGlobalFilter`, `setColumnFilter`, `setPageSize`, `goToPage`, `nextPage`, and `previousPage` — and adds typed signal selectors for reads — `pagination`, `pageCount`, `canPreviousPage`, `canNextPage`, `globalFilter`, and `columnFilters`. The raw `table` accessor is now `@deprecated`; it is retained only for rich column-object reads such as column visibility.

**Breaking:** consumers that called `controller.patchState({ ... })` migrate to the matching command (for example `controller.setGlobalFilter(value)`, which also resets pagination to the first page). Consumers that read table state via `controller.table.getState()` should move to the typed selectors (for example `controller.globalFilter()` instead of `controller.table.getState().globalFilter`). `NatTableService.patchState(...)`, used for library-seeded state synchronization, is unaffected.
