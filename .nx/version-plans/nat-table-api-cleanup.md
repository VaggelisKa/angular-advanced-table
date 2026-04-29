---
ng-advanced-table: minor
ng-advanced-table-ui: patch
---

`NatTable` API ergonomics cleanup. Adds granular per-slice change outputs so consumers can subscribe to a single slice without diffing the full state, renames the `allow*` boolean inputs to match the existing `enable*` convention, folds the standalone `ariaDescription`, `keyboardInstructions`, and `emptyStateLabel` inputs into the existing `accessibilityText` object, and tightens the typing of `globalFilterFn`, `getRowId`, and `canExpandRow` so the optional inputs no longer surface an awkward `T | undefined` union in their declarations. The `ng-advanced-table-ui` package picks up a patch bump so its integration suite tracks the renamed `enableColumnReorder` input on `<nat-table>`; its public API is unchanged.

**New outputs**

- `(sortingChange)` — emits `SortingState` when the sorting slice actually changed.
- `(globalFilterChange)` — emits `string` when the global filter slice actually changed.
- `(columnFiltersChange)` — emits `ColumnFiltersState` when the column filters slice actually changed.
- `(columnVisibilityChange)` — emits `VisibilityState` when the column visibility slice actually changed.
- `(columnOrderChange)` — emits `ColumnOrderState` when the column order slice actually changed.
- `(columnPinningChange)` — emits `ColumnPinningState` when the column pinning slice actually changed.
- `(paginationChange)` — emits `PaginationState` when the pagination slice actually changed.
- `(expandedChange)` — emits `ExpandedState` when the expanded-rows slice actually changed.

The granular outputs are gated on real changes; `(stateChange)` continues to emit the full state on every update for consumers that prefer the existing surface.

**Breaking changes**

- Renamed input `allowColumnPinning` → `enableColumnPinning`.
- Renamed input `allowColumnReorder` → `enableColumnReorder`.
- Removed input `ariaDescription`. Pass `accessibilityText.description` instead.
- Removed input `keyboardInstructions`. Pass `accessibilityText.keyboardInstructions` instead. The built-in default is preserved when the field is omitted; set it to `''` to suppress instructions entirely.
- Removed input `emptyStateLabel`. Pass `accessibilityText.emptyState` instead. The built-in default is preserved when the field is omitted.
