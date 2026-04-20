# ng-advanced-table-ui

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
