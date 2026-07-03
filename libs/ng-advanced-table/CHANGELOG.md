## 2.1.0 (2026-07-03)

### 🚀 Features

- Replace page size selection button chips with an HTML select dropdown in the bundled pagination controls. ([#188](https://github.com/VaggelisKa/angular-advanced-table/pull/188), [#196](https://github.com/VaggelisKa/angular-advanced-table/issues/196))
- Mark object type properties as `readonly` across the library public contracts, companion entry points, locale dictionaries, render-metrics contracts, internal testing contract mirror, showcase examples, and e2e type helpers. Keep only compiler-proven mutable helper shapes writable where code assigns to marker or recursive column properties. ([#185](https://github.com/VaggelisKa/angular-advanced-table/pull/185), [#198](https://github.com/VaggelisKa/angular-advanced-table/pull/198), [#190](https://github.com/VaggelisKa/angular-advanced-table/issues/190))
- Rename two companion subpath entry points for clarity (breaking import change): `ng-advanced-table/ui` → `ng-advanced-table/components` and `ng-advanced-table/utils` → `ng-advanced-table/render-metrics`. `/utils` was a misnomer — it only ever exported the render-metrics store, filter, panel, and column builder. The `.` (core) and `/locale` entry points are unchanged. Consumers update their import specifiers accordingly. ([#185](https://github.com/VaggelisKa/angular-advanced-table/pull/185), [#198](https://github.com/VaggelisKa/angular-advanced-table/pull/198), [#190](https://github.com/VaggelisKa/angular-advanced-table/issues/190))
- Replace the separate built-in English locale alias constants with the single `NAT_EN_LOCALE_ID` export. Update core, companion UI, render-metrics, and locale internals to use the shared locale id directly. ([#203](https://github.com/VaggelisKa/angular-advanced-table/pull/203))
- Unify the bundled table, companion control, and render-metrics CSS theme contract around the shared `--nat-table-*` semantic palette. ([#219](https://github.com/VaggelisKa/angular-advanced-table/pull/219))

  Document the published theming API with a distinct light/dark consumer theme example, remove the legacy shorthand CSS variable fallbacks, add table stacking tokens, and deduplicate pagination control styles so page-size and pager controls share one CSS source.

- Update render metrics health thresholds to 12ms (watch) and 16.66ms (slow) to align with 60fps frame budgets. ([#225](https://github.com/VaggelisKa/angular-advanced-table/pull/225))
- Forward the TanStack Angular Table export surface through `ng-advanced-table` so consumer docs import table authoring contracts and helpers from the package itself. Clarify install guidance by documenting Angular Aria and CDK as required peers while keeping TanStack Table out of consumer install steps. ([#221](https://github.com/VaggelisKa/angular-advanced-table/pull/221))
- Ship `@tanstack/angular-table` as a runtime dependency while keeping Angular framework, Aria, and CDK packages as required peers. Document the resolved published ranges plus required Angular peer install requirements. ([#220](https://github.com/VaggelisKa/angular-advanced-table/pull/220))
- Extract NatTableState as a per-table-instance state owner, consolidating TanStack wiring, internal state signals, column width resolution, resize/reorder state, and a11y announcements out of the NatTable component. The component becomes a thin template consumer + DOM-coupled lifecycle manager. Also merges the duplicate `table.util.ts` into `table-utils.ts`. ([#204](https://github.com/VaggelisKa/angular-advanced-table/pull/204))

  Renames the public API type `NatTableState` → `NatTableUserState` to disambiguate from the new internal `NatTableState` class. The `NatTableUiState` alias continues to work as before.

- refactor: convert host directives to injectable services ([#204](https://github.com/VaggelisKa/angular-advanced-table/pull/204))

  Replace `NatTableA11yDirective`, `NatTableResizeDirective`, `NatTableReorderDirective`, and `NatTableHeaderObservationDirective` with injectable services (`NatTableA11yService`, `NatTableResizeService`, `NatTableReorderService`, `NatTableHeaderMeasurementService`).

  The directives were not using any directive-specific features (host bindings, host listeners, ElementRef). They all accessed the DOM through a manually-wired `tableRegionRef` signal, making them effectively services wrapped in `@Directive`. Converting them to `@Injectable` services:

  - Removes the `hostDirectives` array and the 4-way `tableRegionRef` fan-out effect
  - Consolidates `tableRegionRef` on `NatTableState` as a single shared signal
  - Merges the a11y directive's snapshot/diffing/announce logic into the existing `NatTableA11yService`
  - Makes all services injectable from anywhere in the DI subtree
  - Moves the component closer to a pure presentational shell

  **Breaking:** The public API no longer exports `NatTableA11yDirective`, `NatTableResizeDirective`, `NatTableReorderDirective`, or `NatTableHeaderObservationDirective`. These were internal implementation details and should not have been consumed directly.

### 🩹 Fixes

- Fix vanishing page sizer on reload by ensuring initial library-seeded state synchronizes correctly back to consumer signals. ([#225](https://github.com/VaggelisKa/angular-advanced-table/pull/225))
- Move locale parameter interpolation from plain describe wrappers into the parameterized test titles so unit test output reports the active locale id. ([#193](https://github.com/VaggelisKa/angular-advanced-table/pull/193))
- Update the package test script to cover the current core, components, render-metrics, and locale Nx projects after the companion entry-point rename. ([#206](https://github.com/VaggelisKa/angular-advanced-table/pull/206))
- fix(core): allow nullable `patchState` fields to be cleared back to `undefined` ([#225](https://github.com/VaggelisKa/angular-advanced-table/pull/225))

  Remove the `!== undefined` guard from `manualPageCount`, `locale`, and `direction` in `NatTableService.patchState()` so that transitioning these optional inputs from a concrete value back to `undefined` propagates correctly instead of silently retaining the stale value.

- Hide the bottom separator on the final rendered table body row so the last row does not double up against the table region border. ([9117009](https://github.com/VaggelisKa/angular-advanced-table/commit/9117009))

  Honor the table border-width design tokens so consumers can remove the outer table boundary or dividers without retaining a transparent one-pixel gap.

- Adopt module-boundary enforcement and an internal element-layer structure (#185). Each subpath entry point is now a tagged Nx project (`type:core`/`ui`/`utils`/`locale`) guarded by `@nx/enforce-module-boundaries`, and source within each entry point is organized into `common`/`utils`/`domain-logic`/`ui`/`feature` element folders enforced by `eslint-plugin-boundaries`. Internal refactor and tooling only — no public API, `exports`, or runtime behavior change; the published bundles are unchanged. ([#185](https://github.com/VaggelisKa/angular-advanced-table/pull/185), [#198](https://github.com/VaggelisKa/angular-advanced-table/pull/198), [#190](https://github.com/VaggelisKa/angular-advanced-table/issues/190))
- Refactor large spec files, unify input synchronization in `NatTableSurface`, and ensure `patchState` merges state/initialState instead of replacing them. ([#225](https://github.com/VaggelisKa/angular-advanced-table/pull/225))
- Migrate the remaining unit specs to the formal Gherkin Given/When/Then structure while preserving existing assertions and source test counts. ([#193](https://github.com/VaggelisKa/angular-advanced-table/pull/193))
- Define Documentation Topic, Documentation Group, Table Capability, Manual Data Handling, Example Gallery, Topic Example, Docs Block, Topic Layout, and Usage Boundary as the canonical language for the topic-first documentation structure. ([#190](https://github.com/VaggelisKa/angular-advanced-table/pull/190))

  Move feature guidance into topic pages with curated local TOCs, embedded live examples, preview/code tabs, and manually curated snippets. Keep Quick start directly under Docs, group Composition with the Core principles topics, keep only broad scenarios in the gallery, and record the decision to defer generated API reference.

- Document the core table border-width theme tokens so consumers can remove the table boundary or dividers intentionally. ([#194](https://github.com/VaggelisKa/angular-advanced-table/pull/194))
- Correct maintainer and consumer documentation for current stylelint scripts, package install examples, locale domain wording, controller imports, and render-metrics tone thresholds. ([#230](https://github.com/VaggelisKa/angular-advanced-table/pull/230))
- Reorganize the core `ng-advanced-table` entry into feature folders. Leaf capabilities move under `src/feature/<name>/` — `hotkey-a11y/`, `cell-interaction/`, `reorder/`, and `resize/` — each nesting its own `common`/`utils`/`domain-logic` element folders so their consts, pure helpers, services, and directives are boundary-typed by the deepest folder. The shared `common`/`utils`/`ui`/`domain-logic` layers, the `src/feature/table.ts` shell, and the per-instance state hub (`src/domain-logic/table.state.ts` plus the TanStack table instance) stay core. Internal refactor and file layout only — no public API, `exports`, or runtime behavior change; the published bundles are unchanged. ([#224](https://github.com/VaggelisKa/angular-advanced-table/pull/224))
- refactor(core,components): break NatTableState ↔ NatTableA11yService circular import ([#225](https://github.com/VaggelisKa/angular-advanced-table/pull/225))

  Move column reorder announcements from `NatTableState.applyVisibleZoneReorder` to the
  interaction-site callers (`NatTableReorderService` for drag-drop/keyboard and
  `NatTableHeaderActions` for header-action menus). `applyVisibleZoneReorder` and
  `moveColumnByDelta` now return a `NatTableColumnReorderResult | null` so callers can
  announce the move themselves. This eliminates the static import cycle between
  `table.state.ts` and `table-a11y.service.ts`.

# 2.0.0 (2026-06-26)

### 🚀 Features

- Add built-in row id resolution for rows that expose a string or number `id` property. Consumers can still pass `getRowId` for custom, composite, or nested row identity, and rows without a usable `id` fall back to namespaced positional ids. ([#189](https://github.com/VaggelisKa/angular-advanced-table/pull/189))

  Companion export data and render-metrics events now receive those stable row ids by default when rows expose `id`.

- Constrain column resizing in `fill` mode to "fit": a pointer, touch, or keyboard resize can grow a column only into the space the other columns leave, so a filled table never becomes wider than its visible region. A column stops growing once the table is full (to widen one, shrink another), it never reaches a `maxSize` larger than the remaining space, and an already-overflowing table can still be shrunk. The fit limit drives the drag guide, the keyboard `End` jump, and the committed and announced width. In `fixed` sizing mode the table is authoritative and scrolls past the viewport instead, so the fit cap does not apply there. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))
- Rework keyboard and fill-layout column resizing. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))

  Fill layout now resizes pixel-exact. When at least one column opts into resizing, fill mode renders authoritative widths (a colgroup under `table-layout: fixed`) that sum to the visible region: resized columns keep their exact width and the remaining columns flex — each at or above its `minSize` — to keep the table filled. Resizing a column (pointer or keyboard) reflows the others to absorb the change, so the table never overflows or leaves a gap and a column can only grow into the space the others can yield. Previously fill used `table-layout: auto`, which treated widths as hints, so a resize redistributed space unpredictably and a single keyboard step could jump a column far past one increment. The resize base is also clamped to the column's own `minSize`/`maxSize`, so a fill-stretched measurement can no longer seed an out-of-range base.

  Keyboard resizing moves entirely onto the column header — the resize handle is now a mouse-only drag affordance (`aria-hidden`, no longer a tab stop), removing one tab stop per resizable column. Focus a header and press `Alt`+Left/Right Arrow to step the width or `Alt`+Home/End to jump to its min/max bound (RTL-aware, fit-clamped, announced through the existing live region). The previous `role="separator"` window-splitter control and its `Shift` big-step are removed.

  BREAKING: the `columnResizeHandleLabel` and `columnResizeHandleValueText` accessibility-text formatters and the `NatTableAccessibilityColumnResizeHandleContext` type are removed from the public API of `ng-advanced-table` and `ng-advanced-table/locale` (the separator they labelled no longer exists). The `resizeKeyboardInstructions` locale default now describes the `Alt`+Arrow / `Alt`+Home/End header gesture. The per-column `enableResizing` opt-in and `fill` vs `fixed` sizing modes are documented in the README.

- Fix render-metrics package boundaries, panel locale fallback, bounded/defaulted store retention, readonly exposed metrics, and Safari-safe style fallbacks. Render-metrics controls now accept an explicit structural table controller instead of importing the core table service. ([#178](https://github.com/VaggelisKa/angular-advanced-table/pull/178))
- Add the `NatTableHotkeyA11y` directive to provide screen reader readouts for configured keyboard shortcuts, automatically updating `aria-keyshortcuts` and appending to `aria-label` without losing base text. ([ede3b37](https://github.com/VaggelisKa/angular-advanced-table/commit/ede3b37))
- Replace the keyboard shortcut for column reordering with the platform primary modifier plus Shift and Left/Right Arrow: Ctrl on Windows/Linux and Command on macOS. Add composable Move left and Move right actions to the built-in header actions menu so drag/drop reordering has a non-drag pointer alternative without requiring pin actions, keep reordered headers scrolled into view, update the built-in English instructions and examples for screen-reader and sighted keyboard users, and expose stable table region/header/menu/live-region test IDs for browser coverage. ([#135](https://github.com/VaggelisKa/angular-advanced-table/pull/135))
- Make column resizing per-column instead of a table-wide switch, matching how sorting, filtering, and pinning are configured. The `enableColumnResizing` input is removed from `<nat-table-surface>`; a column is now resizable only when its `ColumnDef` opts in with `enableResizing: true` (mirroring `enablePinning`). The resize handle, keyboard resizing, and the appended resize keyboard instructions activate per resizable column rather than for the whole table. Consumers that set `enableColumnResizing` on the surface must move the opt-in onto each resizable column definition. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))
- Remove the deprecated table action bar component and use the table toolbar for bundled UI control rows, including pagination. ([#123](https://github.com/VaggelisKa/angular-advanced-table/pull/123))
- Remove the `<nat-table-search>` component (class `NatTableSearch`) and its internal `createIdGenerator` helper from `ng-advanced-table/ui`. Global search builds on the public `NatTableService` registration API, so it belongs in consumer code rather than the library. The showcase ships a reference `app-table-search` implementation that consumers can copy and own. ([#112](https://github.com/VaggelisKa/angular-advanced-table/pull/112))
- Require Angular 22. Each package's `@angular/*` peer dependencies are bumped to `^22.0.0` (`@angular/core` and `@angular/common`, plus `@angular/cdk` and `@angular/aria` for the table and UI packages) as part of upgrading the workspace to Angular 22, TypeScript 6.0, ng-packagr 22, and Nx 23.1. Consumers must be on Angular 22 or later. ([#141](https://github.com/VaggelisKa/angular-advanced-table/pull/141), [#116](https://github.com/VaggelisKa/angular-advanced-table/issues/116))

  Applying the Angular 22 schematic migrations and follow-up cleanup moved the workspace fully onto Angular 22 defaults: explicit `ChangeDetectionStrategy.OnPush` was removed from every component and the migration's `Eager` opt-out was dropped, so all components rely on the framework default (`OnPush`). Example docs were updated to match, and stale `@angular/aria` preview wording was removed now that Angular Aria is stable in v22.

- Add row selection to `<nat-table>`: new `enableRowSelection` and `selectionMode` inputs, a `rowSelection` state slice with controlled/uncontrolled support and single-mode normalization, `aria-selected` on body rows, grid-level `aria-multiselectable` in multiple mode, and a polite live announcement for selection changes. Selection state flows through `NatTableService`, and `<nat-table-surface>` exposes it via a new `rowSelectionChange` output alongside the other slice outputs. `ng-advanced-table/ui` gains `withNatTableSelectionColumn(...)` plus the `NatTableSelectionCheckbox` component with locale-resolved labels, `ng-advanced-table/locale` gains the `selectionChange` announcement formatter and the UI `selection` label section, and `ng-advanced-table/utils` picks up the `rowSelection` field in its render-metrics state contract. ([#128](https://github.com/VaggelisKa/angular-advanced-table/pull/128))
- Add the `NatTableExport` Table Action directive to `ng-advanced-table/ui`, with automatic client-side CSV export, `exportFileName`, per-instance `exportHandler`, app-level `provideNatTableExport(...)` configuration, and an exported directive instance with `trigger(...)` for bridging custom activation events. Export handlers receive the resolved table, all client-held rows, visible exportable leaf columns, the normalized file name, `getData()` for lazily resolving a normalized export data snapshot, and `exportCsv()` for delegating to the built-in CSV handler. ([#143](https://github.com/VaggelisKa/angular-advanced-table/pull/143))

  Extend `NatTableColumnMeta` with `meta.export` options so shared column definitions can opt columns in or out, override exported headers, and map raw cell values for export. The core, UI, and utils public metadata contracts stay aligned.

- Add column metadata for body-cell height and line clamping. Core table body cells now clamp content to two lines by default, with per-column overrides for fixed height, custom line count, or disabling the clamp with `Infinity`. ([#114](https://github.com/VaggelisKa/angular-advanced-table/pull/114))
- Add a `columnSizingMode` input (`'fill'` default, or `'fixed'`) to the table surface and a matching layout mode in the table. `'fill'` keeps the existing behavior where columns stretch to fill the container. `'fixed'` makes column widths authoritative via `table-layout: fixed` and a generated `<colgroup>`, sizing the table to the exact sum of its columns so the region scrolls horizontally — which makes pointer and keyboard resizing pixel-exact (the dragged edge tracks the cursor) and the drag guide land exactly where the column edge will. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))

  Also fixes column-resize correctness in both modes:

  - Resized widths are clamped to each column's `minSize`/`maxSize` everywhere they are read and committed, so a drag past a bound can no longer store or render an out-of-range width.
  - Pointer and touch resizing now announce the final width through the live region when the drag ends, matching the keyboard path, reading the committed width even under a controlled `columnSizing` binding.
  - The drag guide is clamped to the column bounds (no overshoot past min/max) and mapped to the correct screen direction in RTL.
  - `columnResizeDirection` is forwarded to TanStack from the resolved text direction so pointer-drag resizing is mirrored correctly in RTL.

- Add interactive column resizing: an `enableColumnResizing` input renders a pointer/touch resize handle on each resizable header (`columnResizeMode` `'onEnd'` or `'onChange'`), with keyboard resizing on the focused column header (Alt+Left / Alt+Right to step the width and Alt+Home / Alt+End for the min/max bound, RTL-aware). The new `columnSizing` state slice flows through `state`/`initialState`/`stateChange` plus a granular `columnSizingChange` output, resized widths drive both header and body cells, and every user-facing string (resize keyboard instructions, live width announcement) resolves through `ng-advanced-table/locale`. The companion UI and utils state contracts gain the matching `columnSizing` field. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))
- Add support for configurable keyboard shortcuts (keybindings). All standard keyboard interactions (row activation, cell control navigation, column reordering) can now be overridden globally via the `NAT_TABLE_KEYBINDINGS` injection token or locally via `keybindings` inputs on the table and surface components. ([347e06e](https://github.com/VaggelisKa/angular-advanced-table/commit/347e06e))
- Add Alt+Arrow keyboard resizing from a focused column header. When a resizable column's header is focused, Alt+Left / Alt+Right resize that column by one step — RTL-aware, fit/min/max clamped, and announced live — without tabbing to the separate resize handle, mirroring the separator's arrow behavior. Alt+Shift+Arrow still reorders the column. A shared resize-step routine now backs both the separator handle and the header shortcut. The English `resizeKeyboardInstructions` copy documents the new header shortcut. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))

### 🩹 Fixes

- Strengthen column-resize test coverage in the core table package. Add an explicit LTR ArrowLeft regression test asserting the first keystroke shrinks the column (region 140 → 132) instead of reversing direction, guarding the reported first-keystroke direction bug. Rework the pointer-drag announcement test to dispatch a real `mousemove`/`mouseup` with movement deltas rather than a no-op down/up sequence, so it exercises an actual resize and can catch a frozen-width regression instead of passing on a zero-delta gesture. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))
- Remove the TypeScript 6 and Angular compiler diagnostic shims from the workspace configuration. Package, showcase, and spec tsconfigs no longer rely on `baseUrl`, `ignoreDeprecations`, `nullishCoalescingNotNullable` suppression, or `optionalChainNotNullable` suppression, and test path mappings now use explicit relative targets. ([#141](https://github.com/VaggelisKa/angular-advanced-table/pull/141), [#116](https://github.com/VaggelisKa/angular-advanced-table/issues/116))
- Document that agents must run the workspace Prettier format check before merging or asking the user to merge a PR. ([#169](https://github.com/VaggelisKa/angular-advanced-table/pull/169))
- Document local agent guidance for removed action-bar usage, companion-control accessible names, and hidden header label coverage. ([#126](https://github.com/VaggelisKa/angular-advanced-table/pull/126))
- Document local agent guidance for pnpm catalog workflows, companion-owned table export behavior, and table keybinding accessibility contract updates. ([#154](https://github.com/VaggelisKa/angular-advanced-table/pull/154))
- Document agent guidance for render-metrics controller wiring and non-JSON-safe UI table-state comparisons. ([#164](https://github.com/VaggelisKa/angular-advanced-table/pull/164))
- Document local agent guidance for keeping pure table helpers in the table utilities module. ([#138](https://github.com/VaggelisKa/angular-advanced-table/pull/138))
- Replace standard component `id` attributes with `data-testid` attributes in `hotkey-a11y.directive.spec.ts` test host component templates, updating the queries accordingly to use stable data-testid selectors. ([5ec08a9](https://github.com/VaggelisKa/angular-advanced-table/commit/5ec08a9))
- Source `ng-advanced-table`'s `tslib` dependency from the shared pnpm catalog so it matches the companion packages. This raises the published `tslib` floor from `^2.3.0` to `^2.8.1`. ([#146](https://github.com/VaggelisKa/angular-advanced-table/pull/146))
- Refactor the `NatTableHotkeyA11y` directive mutation observer spec to wait deterministically for the DOM changes via a `MutationObserver` promise helper instead of using a hardcoded `setTimeout(50)` delay. ([86f376a](https://github.com/VaggelisKa/angular-advanced-table/commit/86f376a))
- Correct the docs for the current UI package surface by removing stale `NatTableSearch` references, clarifying consumer-owned search controls and controller resolution, and documenting the exported table state template directives. ([#148](https://github.com/VaggelisKa/angular-advanced-table/pull/148))
- Document the current keyboard shortcut configuration hierarchy after the table-level keybindings input was removed. ([#157](https://github.com/VaggelisKa/angular-advanced-table/pull/157))
- Document the workspace lint, Stylelint, and Prettier validation commands now that the repository uses lint-suite-backed tooling and Nx-inferred lint targets. ([#163](https://github.com/VaggelisKa/angular-advanced-table/pull/163))
- Document the package-manifest Nx project configuration pattern and the strip-nx packaging step for published library manifests. ([#181](https://github.com/VaggelisKa/angular-advanced-table/pull/181))
- Document the package layering rule and remove the stale core-library path mapping to the companion UI package so the core table package stays independent from companion packages. ([#121](https://github.com/VaggelisKa/angular-advanced-table/pull/121))
- Fix column resizing so a column without an explicit `minSize` can no longer be shrunk until its resize handle disappears or the table overflows. Such columns now floor at a 48px default minimum (twice the 24px resize-handle hit target) instead of TanStack's 20px default, which was narrower than the handle. This keeps the handle grabbable when a column is dragged to its minimum and, in `fill` layout, stops a growing column from collapsing its neighbours to a sliver and pushing the table past its visible region. An explicit `minSize` on a column definition is still honoured exactly as declared. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))
- Fix the first pointer-drag resize of an auto-sized column (no `size` in its column def) when the surface passes a controlled `columnSizing` state binding. The pre-drag seed that exposes a column's rendered width to TanStack's resize handler now also applies through a transient overlay merged into `columnSizing`, so `column.getSize()` reports the measured width synchronously even though a controlled binding (which can only update on a later change-detection cycle) shadows the internal sizing signal. Previously `getResizeHandler` captured TanStack's 150px default as the drag start size, so the column jumped on the first drag; later drags were unaffected because a `columnSizing` entry already existed. The overlay is cleared once the start size is captured, so it never blocks a later controlled reset, and uncontrolled resizing is unchanged. ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))
- Fix core table footguns around caption-only accessible names, Space shortcut matching, controller cleanup, state-template injection, DOM-light hotkey setup, and filter snapshot serialization. Also document Safari 16.2+ as the workspace browser support floor. ([#179](https://github.com/VaggelisKa/angular-advanced-table/pull/179))
- Add a regression guard that keeps the public `NatTableSortIndicatorContext` type aligned with the internal table contract source of truth. ([#176](https://github.com/VaggelisKa/angular-advanced-table/pull/176))
- Refactor the `NatTableKeyboard` interface in `libs/ng-advanced-table/src/lib/components/table/keybindings.ts` to be an inferred type alias via `ReturnType<typeof createNatTableKeyboard>`, eliminating redundant type maintenance. ([9c84754](https://github.com/VaggelisKa/angular-advanced-table/commit/9c84754))
- Keep the normal Nx `serve` target building upstream package outputs, compile showcase unit tests against library source, and add a dedicated `serve-e2e` target so Playwright can start the showcase dev server without recursively re-entering package builds. ([#155](https://github.com/VaggelisKa/angular-advanced-table/pull/155))
- Remove the redundant `keybindings` input from the core `<nat-table>` component, consolidating custom shortcut configuration to `<nat-table-surface>` and `NatTableService.surfaceKeybindings`. ([e7d56fa](https://github.com/VaggelisKa/angular-advanced-table/commit/e7d56fa))
- Add showcase-hosted Markdown usage docs with syntax-highlighted fenced code blocks under `/docs`, expand table usage guides for columns, state, data lifecycle, composition, selection/export, render metrics, theming, and accessibility, move live showcase routes under `/examples`, document the repository rule separating user-facing usage docs from maintainer material, and remove duplicated root/package Markdown docs that only repeated or linked back to usage guidance. ([#149](https://github.com/VaggelisKa/angular-advanced-table/pull/149))
- Refactor table code by splitting internal helper utility functions out of table.ts into a new table-utils.ts file. ([2b565ed](https://github.com/VaggelisKa/angular-advanced-table/commit/2b565ed))
- Reformat component CSS to the Stylelint baseline (lint-suite preset) and replace the deprecated `clip` visually-hidden rule with the modern `clip-path: inset(50%)` recipe. ([#160](https://github.com/VaggelisKa/angular-advanced-table/pull/160))
- Add regression coverage that verifies every built-in companion UI and utils locale includes non-empty consumer-facing labels and formatter output for table controls and render-metrics helpers. ([#177](https://github.com/VaggelisKa/angular-advanced-table/pull/177))
- Refine column resizing for accessibility and correctness: ([#124](https://github.com/VaggelisKa/angular-advanced-table/pull/124))

  - Keyboard resizing now announces when a column reaches its minimum or maximum width. Stepping into a bound, or pressing Alt+Home / Alt+End, emits a localized "(minimum)" / "(maximum)" marker through the live region instead of hitting a silent wall, so keyboard and screen-reader users learn a column's range. The `columnResize` announcement context gains additive `atMinimum` / `atMaximum` flags, and the built-in locale formatters append the marker.
  - `columnSizingMode: 'fixed'` is authoritative again: a resize can grow a column past the visible region and the table scrolls, as fixed layout was designed to. The viewport "fit" cap now applies to `fill` mode only.
  - Fill-flex layout honors each column's `maxSize` and distributes the surplus with integer math so the resolved column widths sum exactly to the region (no sub-pixel overflow).

- Tighten table accessibility labels, hidden header label rendering, and English companion-control copy. ([#122](https://github.com/VaggelisKa/angular-advanced-table/pull/122))

### ⚠️ Breaking Changes

- Consolidate the four published packages into a single `ng-advanced-table` package that exposes its layers through ng-packagr subpath entry points — `ng-advanced-table/ui`, `ng-advanced-table/utils`, and `ng-advanced-table/locale` — mirroring how `@angular/cdk` ships `@angular/cdk/table`, `@angular/cdk/overlay`, etc. One install, one version, atomic releases; the wildcard internal `ng-advanced-table-locales` dependency is gone (locales is now an entry point, not a published dependency). ([#186](https://github.com/VaggelisKa/angular-advanced-table/pull/186), [#191](https://github.com/VaggelisKa/angular-advanced-table/pull/191))

  BREAKING CHANGE: the standalone `ng-advanced-table-ui`, `ng-advanced-table-utils`, and `ng-advanced-table-locales` packages are no longer published. Install only `ng-advanced-table` and update imports:

  - `ng-advanced-table-ui` → `ng-advanced-table/ui`
  - `ng-advanced-table-utils` → `ng-advanced-table/utils`
  - `ng-advanced-table-locales` → `ng-advanced-table/locale`

  The core entry point (`ng-advanced-table`) and every exported symbol are unchanged.

## 1.2.0 (2026-06-16)

### 🚀 Features

- Add the ARIA grid cell-interaction keyboard model: Enter moves focus from a focused grid cell into its first interactive control, Tab and Shift+Tab walk between the grid's controls, and Escape returns focus to the cell. A cell whose entire content is one arrow-safe control (button, link, checkbox) delegates focus straight to that control — matching `@angular/aria`'s single-widget mode — so it activates with a single Enter. This closes a WCAG 2.1.1 gap where `flexRender`-ed in-cell widgets (sort buttons, action buttons) were not keyboard reachable, and updates the English `keyboardInstructions` copy to describe the new behavior. ([#102](https://github.com/VaggelisKa/angular-advanced-table/pull/102))
- Enforce that the core `<nat-table>` component must be used inside a `<nat-table-surface>` component. ([ced374f](https://github.com/VaggelisKa/angular-advanced-table/commit/ced374f))
  Remove the `[for]` input binding from all companion components (`nat-table-search`, `nat-table-pager`, `nat-table-page-size`, `nat-table-column-visibility`, `nat-table-scroll-control`, `nat-render-metrics-filter`).
  Migrate view state inputs and outputs from `<nat-table>` to `<nat-table-surface>` to centralize state management.

- Replace ambiguous accessibility naming inputs for table and companion UI controls. `NatTable` now uses `accessibleName` for hidden grid names and supports a semantic visible `caption`; companion UI controls and UI locale dictionaries now use `groupAriaLabel` for group names. This intentionally removes the previous `ariaLabel` public inputs for these surfaces while keeping the release plan at `minor` per current project policy. ([#97](https://github.com/VaggelisKa/angular-advanced-table/pull/97))
- Add `hiddenHeaderLabel` column metadata so compact utility columns can suppress redundant visible titles while preserving accessible labels. ([#99](https://github.com/VaggelisKa/angular-advanced-table/pull/99))
- Add locale dictionaries with reactive table locale switching for generated accessibility labels. ([#90](https://github.com/VaggelisKa/angular-advanced-table/pull/90))
- Add provider-level localization defaults for table accessibility copy, optional UI labels, render-metrics labels, and shared number formatting. ([#90](https://github.com/VaggelisKa/angular-advanced-table/pull/90))
- Add support for granular manual mode configuration on `<nat-table-surface>` and `<nat-table>`. The `mode` option can now accept either a single string `'auto' | 'manual'`, or a custom object configuration `Partial<{ pagination: 'auto' | 'manual', sorting: 'auto' | 'manual', filtering: 'auto' | 'manual' }>` to control client-side processing of individual slices independently. ([ced374f](https://github.com/VaggelisKa/angular-advanced-table/commit/ced374f))
- Add multi-column sorting: a new `enableMultiSort` input keeps every deduped sort entry and treats Shift+click (or Shift+Enter on a focused sort button) as a multi-sort event, header actions render an aria-hidden sort-priority badge while folding the "N of M" ordinal into the sort button's accessible name, and the sorting live announcement now receives `sortedColumns` in priority order so the English locale reads combined sorts as "Sorted by A ascending, then B descending." ([#110](https://github.com/VaggelisKa/angular-advanced-table/pull/110))
- Make the template reference variable `#grid="natTable"` and `[for]` inputs optional for all UI companion controls when placed inside `<nat-table-surface>`. ([ee6b3cc](https://github.com/VaggelisKa/angular-advanced-table/commit/ee6b3cc))
- Promote table configuration inputs (`manualPageCount`, `stickyHeader`, `enableAnnouncements`, `locale`, `accessibilityText`) from `<nat-table>` to the `<nat-table-surface>` component. Also completely remove the redundant `enableColumnPinning` and `enableColumnReorder` inputs, since column pinning and column reordering capabilities are always supported by default and driven by the state model. ([ced374f](https://github.com/VaggelisKa/angular-advanced-table/commit/ced374f))
- Declare `NatTable`'s `accessibleName` input as required so Angular enforces the grid naming contract through the component API. ([#97](https://github.com/VaggelisKa/angular-advanced-table/pull/97))
- Add table-owned loading, empty, and error body states with named loading/error/success status constants, custom state templates with table-managed focusable controls, built-in localized loading/error copy, rendered-row-count-aware summaries, and accessible announcements for data lifecycle transitions. ([#109](https://github.com/VaggelisKa/angular-advanced-table/pull/109))
- Add a reduced-motion-aware default enter transition for loading, empty, and error table state rows with CSS variables for consumers to customize or disable the motion. ([#109](https://github.com/VaggelisKa/angular-advanced-table/pull/109))

### 🩹 Fixes

- Tighten NatTable JSDoc comments while preserving non-obvious controlled-state and pinning behavior. ([#89](https://github.com/VaggelisKa/angular-advanced-table/pull/89))
- Remove default table cell padding so cells only opt into spacing through explicit CSS variables. ([#93](https://github.com/VaggelisKa/angular-advanced-table/pull/93))
- Add `ng-advanced-table-locales` as the source of truth for built-in English locale labels, with table-first `provideNatTableLocales()` and optional `/ui` and `/utils` companion locale providers. ([#90](https://github.com/VaggelisKa/angular-advanced-table/pull/90))
- Limit `aria-sort` to the primary sorted header during multi-column sorts. The table still preserves the full multi-sort state, priority badges, and combined live announcement, but secondary sort columns no longer advertise competing header-level sort semantics. ([#110](https://github.com/VaggelisKa/angular-advanced-table/pull/110))
- Fix page overscroll when sticky header is active by adding relative positioning to the table region container. ([#95](https://github.com/VaggelisKa/angular-advanced-table/pull/95))
- Float CSS variables defining table layout and region properties to the `<nat-table-surface>` component host. This includes splitting `--nat-table-region-overflow` into `--nat-table-region-overflow-x` and `--nat-table-region-overflow-y` to support independent control of table overflow on each axis. ([ced374f](https://github.com/VaggelisKa/angular-advanced-table/commit/ced374f))
- Replace core table CSS `color-mix()` fallback values with Safari 16-safe defaults while preserving theme customization through CSS variables. ([#109](https://github.com/VaggelisKa/angular-advanced-table/pull/109))

### 🧱 Updated Dependencies

- Updated ng-advanced-table-locales to 1.1.0

## 1.1.0 (2026-06-02)

### 🚀 Features

- Use TanStack `size`, `minSize`, and `maxSize` as the rendered column sizing API and add `maxSize` support to the render-metrics column helper. ([#80](https://github.com/VaggelisKa/angular-advanced-table/pull/80))
- Respect input modality for table focus and hover affordances. ([#60](https://github.com/VaggelisKa/angular-advanced-table/pull/60))
- Remove the built-in expanded-row capability from `NatTable`, including the `expanded` state slice, `canExpandRow` and `expandedRow` inputs, `(expandedChange)` output, expanded-row public types, renderer support, and associated theme tokens. ([#83](https://github.com/VaggelisKa/angular-advanced-table/pull/83))
- Add a companion horizontal scroll control for tables, with accessible left and right controls and a range bar that reflects and updates the table scroll position. ([#62](https://github.com/VaggelisKa/angular-advanced-table/pull/62))

### 🩹 Fixes

- Document accessible custom cell and row action recipes for `ng-advanced-table` consumers. ([#84](https://github.com/VaggelisKa/angular-advanced-table/pull/84))
- Clarify partial-control `NatTableState` ownership and remove full-state round-tripping from quick-start examples. ([#79](https://github.com/VaggelisKa/angular-advanced-table/pull/79))
- Document the horizontal scroll control in the root and UI package references, including its controller contract and accessibility label surface. ([#78](https://github.com/VaggelisKa/angular-advanced-table/pull/78))
- Align public documentation with the exported UI controls, recommended surface composition, and named `NatTableA11y` type namespace import. ([#77](https://github.com/VaggelisKa/angular-advanced-table/pull/77))
- Remove the stale migration-notes link from the `ng-advanced-table` package README now that the root workspace README no longer publishes a migration section. ([#55](https://github.com/VaggelisKa/angular-advanced-table/pull/55))
- Add the private `ng-advanced-table-types` contract library, align the public table metadata and state contracts against it, add type coverage to catch future drift, and document the preferred public imports. ([#86](https://github.com/VaggelisKa/angular-advanced-table/pull/86))
- Declare the `@angular/common` peer dependency for packages that import Angular Common APIs and align the published install documentation. ([#77](https://github.com/VaggelisKa/angular-advanced-table/pull/77))
- Add MIT license metadata and include the project license text. ([#56](https://github.com/VaggelisKa/angular-advanced-table/pull/56))

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

### ⚠️ Breaking Changes

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
- bf70ecf: Expose a fully CSS-variable-driven theming API for `<nat-table>`. Every color, border, radius, spacing, font, transition, focus ring, and shadow used by the component is now resolved from a `--nat-table-*` custom property, so any visual detail can be overridden without targeting internal class names. A semantic palette layer (`--nat-table-color-accent`, `--nat-table-color-text`, `--nat-table-color-surface`, etc.) drives the rest of the tokens via `color-mix()`.

### Patch Changes

- d511e2e: Fix sticky left offset calculations for pinned columns so gaps do not appear when columns are pinned in an order that differs from their natural visible order.
- c6dc4cf: Refine column reordering so draggable headers can be grabbed from the full header surface instead of a small dedicated handle. Drag previews now inherit the active table theme more faithfully, and the built-in sort and pin buttons continue to behave like buttons while reordering is enabled.
- 8b025e9: Showcase app: rename move column headers from `24h $` / `24h %` to `Chg $` / `Chg %` so the '24h' label is not repeated on adjacent columns in the live market demo.

## 0.0.2

### Patch Changes

- b6b4809: Add Changesets-based versioning, npm package metadata, and CI validation for the publishable table packages.
