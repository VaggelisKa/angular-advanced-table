## Release Workflow

- Every change that affects library behavior, public API, docs, examples, or tests gets a Nx version plan in `.nx/version-plans/` in the same task, unless the user says otherwise. One plan per unreleased unit of work: fold follow-ups (review fixes, hardening, regressions) into the pending plan that already covers the work and fix any sentence they made inaccurate; add a new plan only for work no pending plan describes. Do not edit unrelated plans.
- Frontmatter uses explicit package names (`ng-advanced-table: patch` / `ng-advanced-table: minor`), never `__default__`. Showcase-only changes get no plan.
- The project does not follow strict SemVer. Breaking changes are recorded as `minor` (public API replacements, new features, broad behavior changes) or `patch` (bug fixes, refactors, docs-only, test-only). Never create a `major` plan unless the user explicitly asks.
- Nightly `@next` publishing is snapshot-only: `tools/set-nightly-version.mjs` stamps the built manifest from the highest pending plan bump plus commits since the last `v*` tag. Do not run `nx release` or consume pending plans, changelogs, or tags for it.

## Workspace Tooling

- Use `pnpm` (via Corepack) for installs, scripts, Nx commands, and CI examples. Keep `pnpm-lock.yaml` current; no `package-lock.json`.
- Shared dependency versions live in the `pnpm-workspace.yaml` catalogs, not as literals in package manifests.
- Workspace validation: `pnpm run format:check`, `pnpm run lint`, `pnpm run stylelint`. Run `format:check` and fix Prettier drift before a PR is merged.
- Nx project config lives in each project `package.json` `nx` block; published manifests must not ship it (the `strip-nx` target / `pnpm run pack:dry-run` handle that).
- In `.github/workflows/` and `.github/actions/`, keep third-party action SHAs pinned and `actions/checkout` on `persist-credentials: false`. In `api/mcp.mjs`, keep trusted-origin handling, the raw/declared/parsed request-size checks, and the JSON-RPC batch/response caps; run `pnpm run test:mcp`.

## Entry-Point Layering

`ng-advanced-table` ships as one package with secondary entry points: `ng-advanced-table` (core), `ng-advanced-table/components`, `ng-advanced-table/render-metrics`, `ng-advanced-table/virtualization`, and `ng-advanced-table/locale`. The dependency graph is enforced by lint (`@nx/enforce-module-boundaries` in `eslint.config.base.mjs`), by the ng-packagr build, and by `pnpm run size:check` against the built bundles:

- Core must not import any companion (`components`, `render-metrics`, `virtualization`).
- Companions may import core.
- `locale` is the leaf: anyone may import it; it imports none of the others.
- Cross-entry imports use the package specifier (`from 'ng-advanced-table/locale'`), never a deep relative path, which would inline the code and break tree-shaking. Do not add path mappings, dependencies, or re-exports that make core depend on a companion.
- Source path mappings for the package live only in `tsconfig.paths.json` (used by the showcase and the spec config), not `tsconfig.base.json`, so the production build resolves the specifiers through `node_modules` like a real consumer. Entry files are `index.ts`.
- Size ceilings live in `tools/package-size-budget.json`; raising one needs a reason in the PR body.

## Element Layering

Inside each entry point, `eslint-plugin-boundaries` (shared config in the `lint-suite` package) types every file by its deepest folder named `common`, `utils`, `domain-logic`, `ui`, `data-access`, or `feature`; other folder names (entry roots, capability wrappers such as `resize/` or `hotkey-a11y/`) do not decide the layer. A layer may import itself and everything below it:

- `feature` → `ui`, `domain-logic`, `utils`, `common`
- `domain-logic` → `data-access`, `utils`, `common`
- `data-access` → `utils`, `common` (intentionally unused; stateful services injected by features are `domain-logic`)
- `ui` → `utils`, `common`
- `utils` → `common`; pure functions only, and never export a type from `utils`
- `common` → `common`; the only layer that exports types

Place new files in the folder matching their role. If the imports would cross the graph, split or relocate rather than disabling the rule. Only `*.stories.ts` are exempt.

## Package Boundaries

- `libs/ng-advanced-table/testing/` is a source-only, test-only contract mirror reached through the `ng-advanced-table/testing` path alias. It is never built or published, and no production source or generated declaration may reference it.
- When changing shared contracts (`NatTableColumnMeta`, `NatTableState`, sort indicator context, controller state, and similar), update core, the `components` and `render-metrics` entry points, the testing mirror, the public barrels, and the matching contract specs in one change.
- Locale copy is split by domain in `ng-advanced-table/locale`: `accessibility.*` (+ `accessibility-list.*`) with `provideNatTableLocales`, `controls.*` with `provideNatTableControlsLocales`, and `render-metrics.*` with `provideNatTableRenderMetricsLocales`. Do not reintroduce the old `Ui`/`Utils` locale names or shared built-in locale maps. Keep static, signal-backed, and factory-based configs aligned across `provideNatTableIntl`, `provideNatTableControlsIntl`, and `provideNatTableRenderMetricsIntl`; a reactive provider value is a complete override, not a patch.
- `@tanstack/angular-table` is the only runtime (non-peer) dependency and the only `allowedNonPeerDependencies` entry; Angular, Aria, and CDK stay peers. Consumer-facing docs import forwarded types and helpers (`ColumnDef`, `NatTableUserState`, `flexRenderComponent`, …) from `ng-advanced-table`, not from `@tanstack/angular-table`.

## Table Library Patterns

- Workflow-specific controls (global search inputs, filter menus, responsive breakpoint handling) stay consumer-owned; `ng-advanced-table/components` is for generic shells, companion controls, and controller wiring. The removed `NatTableActionBar` must not come back; compose with `<nat-table-toolbar>`, `NatToolbarGroup`/`natToolbarItem`, and the pagination/scroll controls.
- `dataStatus` is the table-owned switch for loading, empty, and error rows; fetching, retry, and error classification belong to the consumer, with custom UI via the `natTableLoading`/`natTableEmpty`/`natTableError` templates.
- Responsibilities: `NatTableState` (`src/domain-logic/table.state.ts`) owns state, TanStack wiring, and derived computeds; `NatTable` (`src/table/table.ts`) owns input/output bridging and DOM handlers; pure helpers are `*.util.ts` modules; capability behavior lives in its flat `src/<capability>/` folder (`resize`, `reorder`, `hotkey-a11y`, `cell-interaction`, `list`). `NatList` is a renderer over the shared `NatTableState`, not a second state engine, and deliberately has no header, resize, pinning, or reorder UI.
- Column controls are gated by surface enablers (`enableSorting`, `enablePinning`, `enableReordering`, `enableColumnResizing`, default off) plus per-column overrides; header-action helper options are a UI-only layer and must not disable TanStack sorting/pinning, because programmatic state has to keep working. `meta.reorderable: false` is an affordance opt-out, not a frozen-column barrier.
- Sub-header grouping (`subHeaderColumn`/`subHeaderOrder`) prepends a hidden TanStack-only sort entry; it must never leak into `sortingChange`, `[(state)]`, `initialState`, `aria-sort`, sort indicators, or multi-sort UI.
- Row virtualization is engine-owned in the `virtualization` entry point. Core consumes only the `NatTableRowRenderStrategy` geometry SPI; nested tables resolve their own strategy. Remote windowing is one contiguous loaded window in logical coordinates; client sorting/filtering/pagination and sub-header rows are disabled for it, and the scroll extent must stay below the documented cross-browser height ceiling.
- Pinned reorder/resize math must compose left + center + right visible leaf zones (not bare `getVisibleLeafColumns()`) and stay scroll- and direction-aware.
- Data export is optional `components` behavior (`natTableExport`/`provideNatTableExport`); core may expose `NatTableColumnMeta.export` but owns no export side effects. Render-metrics controls take an explicit `[controller]`, and `NatRenderMetricsFilter` does not go inside `<nat-table-toolbar>`.
- Compare `NatTableState` slices with the structural equality helper from core, never `JSON.stringify`; consumer values may include `BigInt`, `Set`, `Date`, cycles. Keep walks over consumer values bounded and cycle-safe.
- Toolbar: projected controls that join navigation use `natToolbarItem`/`NatToolbarGroup`, with DOM order matching reading and roving-focus order.
- Keybinding changes touch the whole `src/hotkey-a11y/` set (types, consts, utils, provider, directive, `keybindings.md`) so shortcuts, conflict warnings, and `aria-keyshortcuts` stay aligned.
- Styling contract: public tokens are `--nat-table-*` (and `--nat-list-*` for the list renderer). Never declare public tokens on component hosts (#243); the only defaults live in the opt-in `ng-advanced-table/components/theme.css`, which must stay listed under `sideEffects` in the library `package.json`. Component CSS forwards public tokens into internal `--sys-nat-table-*` bridges and reads `var(--nat-table-x, var(--sys-nat-table-x, <fallback>))`; `--sys-*` tokens are never documented as consumer-settable. New public tokens go into `apps/showcase/public/docs/theming.md` and the theming topic example. Do not reintroduce the removed shorthand tokens (`--text`, `--accent`, …) or the old `--nat-table-list-*` names.

## Documentation Ownership

- Consumer "how to use" guidance lives in showcase Documentation Topics under `/docs/*`: Markdown in `apps/showcase/public/docs/`, routes in `apps/showcase/src/app/shell/showcase-navigation/`, TOCs/snippets/embedded examples in `apps/showcase/src/app/docs/topics/docs-topics.ts`, demos in `apps/showcase/src/app/docs/demos/`.
- `docs-html-registry.ts` and `docs-search-index.ts` are generated (gitignored) by the showcase `generate-docs` target, which runs before `build`/`test`/`lint`/`serve`; never commit or hand-edit them, and keep those `dependsOn` wirings intact.
- After changing canonical doc/example routes, `skills/nat-best-practises/`, or discovery metadata, run the showcase `generate-discovery` target and commit `public/robots.txt`, `public/sitemap.xml`, `public/.well-known/api-catalog`, and `public/.well-known/mcp/server-card.json`. Do not commit `api/markdown-pages.generated.json`.
- Feature demos are Topic Examples inside their docs topic. `/examples/*` is only for broad standalone scenarios and tools; register them in showcase navigation (and `app.route-paths.ts` if not discoverable), never as top-level feature routes.
- Repository markdown is maintainer material only (contribution rules, boundaries, ADRs, terminology, changelogs). No README placeholders that just link to the showcase.
- Showcase demos use the shared primitives in `apps/showcase/src/app/ui/` (`DemoCode`, `DemoLayout`, `DemoSection`, `DemoFacts`, `DemoSwitch`, `DemoToggleGroup`).

## Angular Conventions

- Angular v22 defaults: no `standalone: true`, no explicit `ChangeDetectionStrategy.OnPush`, no `@HostBinding`/`@HostListener` (use the decorator `host` object). Prefer `input()`/`output()`, signals, and `computed()`; native control flow in templates.

## Accessibility

- Must pass AXE and meet WCAG AA (focus management, contrast, ARIA).
- Visible words stay inside accessible names; when changing control copy, `aria-label`s, or locale dictionaries, update the locale and component specs that lock that copy.
- `hiddenHeaderLabel` renders as screen-reader-only header text for every column header kind, including `withNatTableHeaderActions(...)` columns.

## Testing

- Prefer `data-testid` selectors over CSS classes or DOM shape.
- Specs use formal Gherkin: `describe('FEATURE: …')` → `describe('GIVEN: …')` → `describe('WHEN: …')` → `it('THEN: it …')`. Vitest `describe` nesting is capped at 3, so keep `GIVEN`s flat, put shared setup in a FEATURE-level `beforeEach`, and keep `WHEN:` titles unique within a `GIVEN`. When restructuring, one source test stays one test.
- Playwright: group by feature under `e2e/<feature>/`, pair workflow specs with `<feature>.a11y.e2e.ts`, keep sequential flows as one test with `test.step('THEN: …')` checkpoints, and use the `e2e/support/media.ts` / `transitions.ts` helpers for media emulation (`page.emulateMedia()`, not `test.use`).
- Coverage thresholds are enforced per entry point. Never widen an entry point's `coverageInclude` to another's files. Ratchet thresholds up when a change raises coverage; lower one only with a reason in the PR body.

## Browser Compatibility

- Support Safari 16.5+. Verify newer CSS or platform features (e.g. `@starting-style`, View Transitions) against it and provide a fallback or an older approach.
