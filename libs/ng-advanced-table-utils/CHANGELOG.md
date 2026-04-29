## 1.0.5 (2026-04-29)

### 🩹 Fixes

- Add consumer-facing theming documentation for table packages. ([#54](https://github.com/VaggelisKa/angular-advanced-table/pull/54))
- Widen the `@tanstack/angular-table` peer dependency from `^8.21.4` to `^8.0.0` so any v8 release satisfies the peer instead of requiring a minimum minor aligned with this repo. ([#52](https://github.com/VaggelisKa/angular-advanced-table/pull/52))

## 1.0.4 (2026-04-29)

### 🩹 Fixes

- Migrate the workspace to an Nx monorepo layout and move package versioning, changelogs, and npm publishing to Nx Release. ([#49](https://github.com/VaggelisKa/angular-advanced-table/pull/49))

### ❤️ Thank You

- Vaggelis Karavasileiadis
- VaggelisKa @VaggelisKa

# ng-advanced-table-utils

## 1.0.3

### Patch Changes

- 3da05b9: Update the GitHub Actions CI and release workflows to use the latest `actions/checkout`
  and `actions/setup-node` majors, and move the Node.js runtime from 22 to 24.

## 1.0.2

### Patch Changes

- 835df8d: Rewrite the root README into a shorter, example-led API reference with a tighter package matrix, one representative setup example, and compact sections for the core, UI, and render-metrics APIs.

## 1.0.1

### Patch Changes

- 2addb25: Remove direct package coupling to `ng-advanced-table` by switching the companion UI and render-metrics packages to structural controller/event contracts.

  `<nat-table #grid="natTable">` instances still work as the `for` input in consuming apps, but `ng-advanced-table-ui` and `ng-advanced-table-utils` no longer declare `ng-advanced-table` as a peer dependency or import its runtime/types internally.

- d82d039: Reorganize package documentation so the workspace README is the canonical reference and package READMEs act as scoped entry points.

  The updated docs centralize the core table, UI, and render-metrics guidance in one place, add clearer cross-links between packages, and make the published README structure easier for agents and maintainers to parse.

## 1.0.0

### Patch Changes

- 0880ce9: Split the table into a bare core package plus optional UI primitives.

  `ng-advanced-table` now ships a structural `NatTable` that focuses on TanStack state integration, sticky layout, typed metadata, and render instrumentation. Built-in search, visibility chips, page-size controls, pager buttons, header sort/pin actions, and themed card styling were removed from the core component. `showPagination` was replaced with `enablePagination`, which now defaults to `false`.

  `ng-advanced-table-ui` now provides the optional composable UI pieces that were previously bundled into the table component: `NatTableSurface`, `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, `NatTablePager`, and `withNatTableHeaderActions(...)`.

  Documentation now includes guidance for consumers who want to replace the shipped UI with their own controls, including a custom pagination example built directly against `NatTable`, `table`, and `patchState(...)`.

- Updated dependencies [0880ce9]
- Updated dependencies [d511e2e]
- Updated dependencies [c6dc4cf]
- Updated dependencies [c6dc4cf]
- Updated dependencies [8b025e9]
- Updated dependencies [bf70ecf]
  - ng-advanced-table@0.1.0

## 0.0.2

### Patch Changes

- b6b4809: Add Changesets-based versioning, npm package metadata, and CI validation for the publishable table packages.
- Updated dependencies [b6b4809]
  - ng-advanced-table@0.0.2
