---
ng-advanced-table: minor
---

**Breaking:** Move to TanStack Table v9 (`@tanstack/angular-table` 9.3). Tables are built with one fixed feature set (filtering, global filter, sorting, pagination, visibility, ordering, pinning, sizing, resizing, row selection), and `ng-advanced-table` exports TanStack's types with that feature set applied, so `ColumnDef<Row>`, `Row<Row>`, `Column<Row>`, `CellContext<Row>`, `TableOptions<Row>`, `TableState`, the column definition variants, and the other forwarded types keep their v8 generic shape. `NatTableFeatures` is exported for TanStack types the library does not alias.

Consumer changes:

- `columnPinning` state uses `start`/`end` instead of `left`/`right`, and needs both keys.
- Column definitions use `sortFn` instead of `sortingFn`.
- `table.getState().<slice>` becomes `table.atoms.<slice>.get()`; the whole state is `table.store.get()`.
- `RowSelectionState` is typed `Record<string, true>`, and `getIsSomeRowsSelected()` is also `true` when every row is selected.
- A cell renderer typed with a concrete value (`CellContext<Row, number>`) takes `CellContext<Row, unknown>` and narrows with `getValue<number>()`.
- `ColumnMeta` and `TableMeta` augmentations take the feature set as their first type parameter.
- `*flexRender` `props` must keep the same object until its inputs change.
- The `datetime` sort function compares `Date` subclasses by `getTime()`, and two `undefined` values with `sortUndefined: 'first' | 'last'` now tie instead of being ordered.

Pinned columns now stick with `inset-inline-start`/`inset-inline-end`, the pinned edge shadows mirror in right-to-left tables, and keyboard focus scrolls a cell out from under the pinned columns in both directions, so a start-pinned column stays in view in RTL.

The package ships a codemod for these changes: `npx -p ng-advanced-table ng-advanced-table-migrate-v9 [--dry-run] src`. The new "TanStack v9 migration" docs topic lists every change and how the codemod handles it.
