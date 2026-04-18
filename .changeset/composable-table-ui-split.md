---
'ng-advanced-table': minor
'ng-advanced-table-ui': minor
'ng-advanced-table-utils': patch
---

Split the table into a bare core package plus optional UI primitives.

`ng-advanced-table` now ships a structural `NatTable` that focuses on TanStack state integration, sticky layout, typed metadata, and render instrumentation. Built-in search, visibility chips, page-size controls, pager buttons, header sort/pin actions, and themed card styling were removed from the core component. `showPagination` was replaced with `enablePagination`, which now defaults to `false`.

`ng-advanced-table-ui` now provides the optional composable UI pieces that were previously bundled into the table component: `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, and `withNatTableHeaderActions(...)`.

Documentation now includes guidance for consumers who want to replace the shipped UI with their own controls, including a custom pagination example built directly against `NatTable`, `table`, and `patchState(...)`.
