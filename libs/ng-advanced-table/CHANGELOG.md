# 1.0.0 (2026-04-29)

### 🚀 Features

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

- DX polish for table identity, row ids, and public type surface. ([#53](https://github.com/VaggelisKa/angular-advanced-table/pull/53))

  - **`tableElementId` as `Signal<string>`.** Replaces the `tableElementId(): string` method on `NatTable`. Companion code and templates should keep calling `tableElementId()` (now a signal read). `NatTableUiController` now requires `readonly tableElementId: Signal<string>` so custom controller wrappers align with the same reactive shape.
  - **`NatTableRowIdGetter` and optional parent row.** Adds exported `NatTableRowIdGetter<TData>` with an optional third `parent` argument matching TanStack Table's `getRowId(originalRow, index, parent?)` callback; `getRowId` input on `NatTable` uses this type.
  - **`NatTableA11y` namespace.** Deep accessibility formatter context types (`NatTableAccessibilitySummaryContext`, sorting/filtering/visibility/pagination/reorder contexts, and the column-visibility change entry) are re-exported only under `import type { NatTableA11y } from 'ng-advanced-table'`. `NatTableAccessibilityText` and all non-a11y types stay at the package root. **Breaking:** remove top-level imports of the former `NatTableAccessibility*` context symbols; use `NatTableA11y.*` instead.
  - **`commitInternalState`:** reads `this.state()` once per update instead of eight separate signal reads.
  - **Docs:** root README documents pagination slice behavior when `enablePagination` is `false`, updates the controller contract and core export list; package README drops the obsolete migration anchor.


### 🩹 Fixes

- Document consumer and agent responsibilities for localizing accessibility labels, summaries, announcements, and optional UI control copy. ([#51](https://github.com/VaggelisKa/angular-advanced-table/pull/51))
- Add consumer-facing theming documentation for table packages. ([#54](https://github.com/VaggelisKa/angular-advanced-table/pull/54))
- Widen the `@tanstack/angular-table` peer dependency from `^8.21.4` to `^8.0.0` so any v8 release satisfies the peer instead of requiring a minimum minor aligned with this repo. ([#52](https://github.com/VaggelisKa/angular-advanced-table/pull/52))
- Add a machine-readable API map to the accessibility internationalization guide for agent consumers. ([#51](https://github.com/VaggelisKa/angular-advanced-table/pull/51))
- Extract accessibility customization guides into root-level `ACCESSIBILITY.md` and update package README links for discoverability. ([5690475](https://github.com/VaggelisKa/angular-advanced-table/commit/5690475))

### ⚠️  Breaking Changes

- **Breaking (`ng-advanced-table`):** Remove multi-column sorting (`enableMultiSort`, TanStack `maxMultiSortColCount`). Sorting is always single-column: merged state normalizes to one entry, TanStack is configured with `enableMultiSort: false` and `isMultiSortEvent` never true. Remove `NatTableAccessibilitySortingEntry` and the `sortings` field from `NatTableAccessibilitySortingAnnouncementContext`. ([#53](https://github.com/VaggelisKa/angular-advanced-table/pull/53))

  **`ng-advanced-table-ui`:** Header sort control calls `column.toggleSorting()` again (no `getToggleSortingHandler` / Shift path).

  Other recent `NatTable` additions (for example `(rowActivate)` and controlled-state documentation) are unchanged by this removal.

## 0.2.1 (2026-04-29)

### 🩹 Fixes

- Migrate the workspace to an Nx monorepo layout and move package versioning, changelogs, and npm publishing to Nx Release. ([#49](https://github.com/VaggelisKa/angular-advanced-table/pull/49))

### ❤️ Thank You

- Vaggelis Karavasileiadis
- VaggelisKa @VaggelisKa

# ng-advanced-table

## 0.2.0

### Minor Changes

- fb7e652: Add expandable row support to `NatTable` with controlled/uncontrolled expansion state, a row-level expansion predicate, and projected detail-row templates.

### Patch Changes

- fc084e6: Remove the showcase table's seeded initial state so examples no longer load with preset sorting, pinning, or a custom page size.
- 3da05b9: Update the GitHub Actions CI and release workflows to use the latest `actions/checkout`
  and `actions/setup-node` majors, and move the Node.js runtime from 22 to 24.
- d5de8ec: Fix three latent bugs in `<nat-table>`:
  - `hasSameColumnVisibility` now compares visibility only, so swapping purely cosmetic column metadata (e.g. i18n label changes or a new `columns` array with different headers but the same visibility map) no longer triggers a misleading "visible columns" announcement on the polite live region.
  - The helper also guards against a missing counterpart column in the previous/next accessibility snapshot, removing an unsafe property access that could throw when consumers swap an entire column set while keeping the leaf count the same.
  - The keyboard focus style no longer forces `position: relative` on pinned or sticky header cells. Sticky left/right pinned body cells and the sticky header row now keep their `position: sticky` context while focused, so keyboard users see pinned columns stay put instead of briefly unsticking when focus lands on them.

## 0.1.2

### Patch Changes

- 04116d6: Add a table options dialog to the showcase page so users can toggle capabilities such as column pinning, column reordering, pagination, search, column visibility controls, and render metrics to quickly test simpler table variants. Also collapse optional control sections entirely when toggled off so extra dividers and empty bars are removed.
- f176a19: Add documentation for building custom Angular cell components with `flexRenderComponent(...)`, including guidance for interactive cell UIs, focus management, outputs, and stable row identity.
- 835df8d: Rewrite the root README into a shorter, example-led API reference with a tighter package matrix, one representative setup example, and compact sections for the core, UI, and render-metrics APIs.
- 5330f50: Improve the showcase options modal by opening it through Angular CDK Dialog so dialog interactions (focus trapping, escape handling, and backdrop close behavior) use the framework's accessible defaults.
- 0f452b3: Document the custom row-actions column pattern, including an accessible three-dots menu example for showcase-style tables.
- 0f452b3: Add an `Actions` column to the showcase table with an accessible three-dots row menu that exposes a few demo-only actions for each instrument.
- 86dd926: Document zoneless Angular support and validate the core and UI component test suites under explicit zoneless change detection.

## 0.1.1

### Patch Changes

- dc47fce: Refine the accessibility customization API by standardizing on accessibility-prefixed label/context types and update the showcased localization examples to Danish.

  `ng-advanced-table` now exposes richer accessibility formatter contexts with localized number strings and semantic states, while `ng-advanced-table-ui` uses `accessibilityLabels` as the single customization entry point for companion controls and header actions.

- d82d039: Reorganize package documentation so the workspace README is the canonical reference and package READMEs act as scoped entry points.

  The updated docs centralize the core table, UI, and render-metrics guidance in one place, add clearer cross-links between packages, and make the published README structure easier for agents and maintainers to parse.

## 0.1.0

### Minor Changes

- 0880ce9: Split the table into a bare core package plus optional UI primitives.

  `ng-advanced-table` now ships a structural `NatTable` that focuses on TanStack state integration, sticky layout, typed metadata, and render instrumentation. Built-in search, visibility chips, page-size controls, pager buttons, header sort/pin actions, and themed card styling were removed from the core component. `showPagination` was replaced with `enablePagination`, which now defaults to `false`.

  `ng-advanced-table-ui` now provides the optional composable UI pieces that were previously bundled into the table component: `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, and `withNatTableHeaderActions(...)`.

  Documentation now includes guidance for consumers who want to replace the shipped UI with their own controls, including a custom pagination example built directly against `NatTable`, `table`, and `patchState(...)`.

- c6dc4cf: Add opt-in reorderable table columns backed by TanStack state and Angular CDK drag-drop. Leaf headers can now be reordered by drag and keyboard, unpinned column order is preserved in table state, pinned columns reorder within their own left and right regions, and the built-in header action buttons continue to work while reordering is enabled.
- bf70ecf: Expose a fully CSS-variable-driven theming API for `<nat-table>`. Every color, border, radius, spacing, font, transition, focus ring, and shadow used by the component is now resolved from a `--nat-table-*` custom property, so any visual detail can be overridden without targeting internal class names. A semantic palette layer (`--nat-table-color-accent`, `--nat-table-color-text`, `--nat-table-color-surface`, etc.) drives the rest of the tokens via `color-mix()`, and legacy shorthand variables (`--accent`, `--surface`, `--text`, …) continue to work as fallbacks for the new color tokens.

### Patch Changes

- d511e2e: Fix sticky left offset calculations for pinned columns so gaps do not appear when columns are pinned in an order that differs from their natural visible order.
- c6dc4cf: Refine column reordering so draggable headers can be grabbed from the full header surface instead of a small dedicated handle. Drag previews now inherit the active table theme more faithfully, and the built-in sort and pin buttons continue to behave like buttons while reordering is enabled.
- 8b025e9: Showcase app: rename move column headers from `24h $` / `24h %` to `Chg $` / `Chg %` so the '24h' label is not repeated on adjacent columns in the live market demo.

## 0.0.2

### Patch Changes

- b6b4809: Add Changesets-based versioning, npm package metadata, and CI validation for the publishable table packages.
