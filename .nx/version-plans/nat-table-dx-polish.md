---
ng-advanced-table: minor
ng-advanced-table-ui: minor
---

DX polish for table identity, row ids, and public type surface.

- **`tableElementId` as `Signal<string>`.** Replaces the `tableElementId(): string` method on `NatTable`. Companion code and templates should keep calling `tableElementId()` (now a signal read). `NatTableUiController` now requires `readonly tableElementId: Signal<string>` so custom controller wrappers align with the same reactive shape.
- **`NatTableRowIdGetter` and optional parent row.** Adds exported `NatTableRowIdGetter<TData>` with an optional third `parent` argument matching TanStack Table's `getRowId(originalRow, index, parent?)` callback; `getRowId` input on `NatTable` uses this type.
- **`NatTableA11y` namespace.** Deep accessibility formatter context types (`NatTableAccessibilitySummaryContext`, sorting/filtering/visibility/pagination/reorder contexts, and the column-visibility change entry) are re-exported only under `import type { NatTableA11y } from 'ng-advanced-table'`. `NatTableAccessibilityText` and all non-a11y types stay at the package root. **Breaking:** remove top-level imports of the former `NatTableAccessibility*` context symbols; use `NatTableA11y.*` instead.
- **`commitInternalState`:** reads `this.state()` once per update instead of eight separate signal reads.
- **Docs:** root README documents pagination slice behavior when `enablePagination` is `false`, updates the controller contract and core export list; package README drops the obsolete migration anchor.
