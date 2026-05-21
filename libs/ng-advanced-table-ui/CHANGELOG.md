## 1.1.0 (2026-04-29)

### 🚀 Features

- DX polish for table identity, row ids, and public type surface. ([#53](https://github.com/VaggelisKa/angular-advanced-table/pull/53))

  - **`tableElementId` as `Signal<string>`.** Replaces the `tableElementId(): string` method on `NatTable`. Companion code and templates should keep calling `tableElementId()` (now a signal read). `NatTableUiController` now requires `readonly tableElementId: Signal<string>` so custom controller wrappers align with the same reactive shape.
  - **`NatTableRowIdGetter` and optional parent row.** Adds exported `NatTableRowIdGetter<TData>` with an optional third `parent` argument matching TanStack Table's `getRowId(originalRow, index, parent?)` callback; `getRowId` input on `NatTable` uses this type.
  - **`NatTableA11y` namespace.** Deep accessibility formatter context types (`NatTableAccessibilitySummaryContext`, sorting/filtering/visibility/pagination/reorder contexts, and the column-visibility change entry) are re-exported only under `import type { NatTableA11y } from 'ng-advanced-table'`. `NatTableAccessibilityText` and all non-a11y types stay at the package root. **Breaking:** remove top-level imports of the former `NatTableAccessibility*` context symbols; use `NatTableA11y.*` instead.
  - **`commitInternalState`:** reads `this.state()` once per update instead of eight separate signal reads.
  - **Docs:** root README documents pagination slice behavior when `enablePagination` is `false`, updates the controller contract and core export list; package README drops the obsolete migration anchor.


### 🩹 Fixes

- Document consumer and agent responsibilities for localizing accessibility labels, summaries, announcements, and optional UI control copy. ([#51](https://github.com/VaggelisKa/angular-advanced-table/pull/51))
- Add consumer-facing theming documentation for table packages. ([#54](https://github.com/VaggelisKa/angular-advanced-table/pull/54))
- `NatTable` API ergonomics cleanup. Adds granular per-slice change outputs so consumers can subscribe to a single slice without diffing the full state, renames the `allow*` boolean inputs to match the existing `enable*` convention, folds the standalone `ariaDescription`, `keyboardInstructions`, and `emptyStateLabel` inputs into the existing `accessibilityText` object, and tightens the typing of `globalFilterFn`, `getRowId`, and `canExpandRow` so the optional inputs no longer surface an awkward `T | undefined` union in their declarations. The `ng-advanced-table-ui` package picks up a patch bump so its integration suite tracks the renamed `enableColumnReorder` input on `<nat-table>`; its public API is unchanged. ([#53](https://github.com/VaggelisKa/angular-advanced-table/pull/53))

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

- **Breaking (`ng-advanced-table`):** Remove multi-column sorting (`enableMultiSort`, TanStack `maxMultiSortColCount`). Sorting is always single-column: merged state normalizes to one entry, TanStack is configured with `enableMultiSort: false` and `isMultiSortEvent` never true. Remove `NatTableAccessibilitySortingEntry` and the `sortings` field from `NatTableAccessibilitySortingAnnouncementContext`. ([#53](https://github.com/VaggelisKa/angular-advanced-table/pull/53))

  **`ng-advanced-table-ui`:** Header sort control calls `column.toggleSorting()` again (no `getToggleSortingHandler` / Shift path).

  Other recent `NatTable` additions (for example `(rowActivate)` and controlled-state documentation) are unchanged by this removal.

- Widen the `@tanstack/angular-table` peer dependency from `^8.21.4` to `^8.0.0` so any v8 release satisfies the peer instead of requiring a minimum minor aligned with this repo. ([#52](https://github.com/VaggelisKa/angular-advanced-table/pull/52))
- Add a machine-readable API map to the accessibility internationalization guide for agent consumers. ([#51](https://github.com/VaggelisKa/angular-advanced-table/pull/51))
- Extract accessibility customization guides into root-level `ACCESSIBILITY.md` and update package README links for discoverability. ([5690475](https://github.com/VaggelisKa/angular-advanced-table/commit/5690475))

### 🧱 Updated Dependencies

- Updated ng-advanced-table to 1.0.0

## 1.0.4 (2026-04-29)

### 🩹 Fixes

- Migrate the workspace to an Nx monorepo layout and move package versioning, changelogs, and npm publishing to Nx Release. ([#49](https://github.com/VaggelisKa/angular-advanced-table/pull/49))

### 🧱 Updated Dependencies

- Updated ng-advanced-table to 0.2.1

### ❤️ Thank You

- Vaggelis Karavasileiadis
- VaggelisKa @VaggelisKa

# ng-advanced-table-ui

## 1.0.3

### Patch Changes

- 3da05b9: Update the GitHub Actions CI and release workflows to use the latest `actions/checkout`
  and `actions/setup-node` majors, and move the Node.js runtime from 22 to 24.

## 1.0.2

### Patch Changes

- 349ee00: Add right-side pinning support to the shared header actions through a three-dot overflow menu with explicit left and right pin actions.
- 80c69f6: Switch the header pinning menu to Angular Aria menu primitives for stronger built-in keyboard and screen reader behavior, and declare the package's Angular Aria/CDK peer dependencies explicitly.
- 835df8d: Rewrite the root README into a shorter, example-led API reference with a tighter package matrix, one representative setup example, and compact sections for the core, UI, and render-metrics APIs.
- 0f452b3: Document the custom row-actions column pattern, including an accessible three-dots menu example for showcase-style tables.
- 86dd926: Document zoneless Angular support and validate the core and UI component test suites under explicit zoneless change detection.

## 1.0.1

### Patch Changes

- 2addb25: Remove direct package coupling to `ng-advanced-table` by switching the companion UI and render-metrics packages to structural controller/event contracts.

  `<nat-table #grid="natTable">` instances still work as the `for` input in consuming apps, but `ng-advanced-table-ui` and `ng-advanced-table-utils` no longer declare `ng-advanced-table` as a peer dependency or import its runtime/types internally.

- dc47fce: Refine the accessibility customization API by standardizing on accessibility-prefixed label/context types and update the showcased localization examples to Danish.

  `ng-advanced-table` now exposes richer accessibility formatter contexts with localized number strings and semantic states, while `ng-advanced-table-ui` uses `accessibilityLabels` as the single customization entry point for companion controls and header actions.

- d82d039: Reorganize package documentation so the workspace README is the canonical reference and package READMEs act as scoped entry points.

  The updated docs centralize the core table, UI, and render-metrics guidance in one place, add clearer cross-links between packages, and make the published README structure easier for agents and maintainers to parse.

## 1.0.0

### Major Changes

- Split the optional table controls out of the core package into `ng-advanced-table-ui`, keeping the existing `<nat-table #grid="natTable">` usage compatible while publishing the UI package independently.

## 0.0.2

### Patch Changes

- b6b4809: Add Changesets-based versioning, npm package metadata, and CI validation for the publishable table packages.
- Updated dependencies [b6b4809]
  - ng-advanced-table@0.0.2
