# ng-advanced-table

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
