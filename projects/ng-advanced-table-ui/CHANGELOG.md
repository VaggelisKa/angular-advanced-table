# ng-advanced-table-ui

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
