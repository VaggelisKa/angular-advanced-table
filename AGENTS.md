## Release Workflow

- Every change touching library behavior, public API, docs, examples, or tests adds a Nx version plan in `.nx/version-plans/` in the same task. One plan per unreleased unit of work: fold follow-ups into the pending plan that already covers them (and fix sentences they made inaccurate) instead of adding a second file. Showcase-only changes get no plan. Do not edit unrelated plans.
- Frontmatter uses explicit names (`ng-advanced-table: patch` / `minor`), never `__default__`.
- Versioning is deliberately not SemVer: breaking changes are `minor` (API replacements, features, broad behavior changes) or `patch` (fixes, refactors, docs, tests). Never create a `major` plan unless the user explicitly asks.
- Nightly `@next` is snapshot-only via `tools/set-nightly-version.mjs`; never run `nx release` or consume pending plans, changelogs, or tags for it.

## Workspace Tooling

- `pnpm` via Corepack; shared dependency versions go in the `pnpm-workspace.yaml` catalogs, not as literals in manifests.
- Run `pnpm run format:check` and fix drift before a PR is merged.
- In `.github/workflows/` and `.github/actions/`, keep third-party action SHAs pinned and `actions/checkout` on `persist-credentials: false`. In `api/mcp.mjs`, keep trusted-origin handling, request-size checks, and JSON-RPC batch/response caps; run `pnpm run test:mcp`.

## Entry-Point Layering

Entry points: `ng-advanced-table` (core), `/components`, `/render-metrics`, `/virtualization`, `/locale`. Core never imports a companion; companions may import core; `locale` is the leaf. Cross-entry imports use the package specifier, never a deep relative path (it inlines the code). Do not add path mappings, dependencies, or re-exports to get around this, and keep the source path mappings in `tsconfig.paths.json` only, never `tsconfig.base.json`, so the production build resolves like a consumer. Raising a ceiling in `tools/package-size-budget.json` needs a reason in the PR body.

## Element Layering

Files are typed by their deepest folder named `common`, `utils`, `domain-logic`, `ui`, `data-access`, or `feature`; other folder names do not count. Allowed imports flow downward only: `feature` → `ui`/`domain-logic` → `data-access` → `utils` → `common`. `utils` is pure and never exports a type; `common` is the only layer that exports types. `data-access` is intentionally unused: stateful services injected by features are `domain-logic`. When lint fails, split or relocate the file; never disable the rule.

## Package Boundaries

- `libs/ng-advanced-table/testing/` is a test-only contract mirror (alias `ng-advanced-table/testing`, not an `exports` subpath). It is never built or published; no production source or generated declaration may reference it. Update it together with core, `components`, `render-metrics`, and the barrels when a shared contract changes.
- Locale copy is split by domain (`accessibility.*`, `controls.*`, `render-metrics.*`) with one provider per domain. Do not reintroduce the old `Ui`/`Utils` locale names. A reactive provider value is a complete override, not an accumulated patch; keep static, signal-backed, and factory configs aligned across all three `provide*Intl` functions.
- `@tanstack/angular-table` stays the only non-peer dependency. Consumer-facing docs import forwarded types and helpers from `ng-advanced-table`, never from `@tanstack/angular-table`.

## Table Library Patterns

- Workflow controls (search inputs, filter menus), data fetching/retry/error classification, and responsive breakpoint handling stay consumer-owned; `dataStatus` plus the `natTableLoading`/`natTableEmpty`/`natTableError` templates are the table's only data-lifecycle surface. The removed `NatTableActionBar` must not come back.
- `NatList` renders over the shared `NatTableState`; it is not a second state engine and gets no header, resize, pinning, or reorder UI.
- Header-action helper options are UI-only; never map them to TanStack table-level sorting/pinning, because programmatic state must keep working. `meta.reorderable: false` is an affordance opt-out, not a frozen-column barrier.
- The sub-header grouping sort entry is TanStack-internal and must never leak into `sortingChange`, `[(state)]`, `initialState`, `aria-sort`, or sort UI.
- Pinned reorder/resize math composes left + center + right visible leaf zones, never bare `getVisibleLeafColumns()`. Remote windowing scroll extent must stay below the documented cross-browser height ceiling.
- Export side effects live only in `components` (`natTableExport`); core exposes `NatTableColumnMeta.export` at most. `NatRenderMetricsFilter` never goes inside `<nat-table-toolbar>`.
- Compare state slices with the structural equality helper from core, never `JSON.stringify`; consumer values may hold `BigInt`, `Set`, `Date`, cycles. Keep walks over consumer values bounded.
- Theming: never declare a public `--nat-table-*`/`--nat-list-*` token on a component host (#243). Defaults live only in the opt-in `components/theme.css`, which must stay under `sideEffects` in the library `package.json`; component CSS reads `var(--nat-table-x, var(--sys-nat-table-x, <fallback>))` and `--sys-*` bridges are never documented as consumer-settable. Do not reintroduce the removed shorthand tokens (`--text`, `--accent`, …) or `--nat-table-list-*`. New public tokens are added to `apps/showcase/public/docs/theming.md`.

## Documentation

- Consumer guidance lives in showcase Documentation Topics (`apps/showcase/public/docs/*.md` plus `docs-topics.ts`); feature demos are Topic Examples there, and `/examples/*` is only for broad standalone scenarios or tools. Repository markdown is maintainer material only; no README placeholders that merely link to the showcase.
- `docs-html-registry.ts`, `docs-search-index.ts`, and `api/markdown-pages.generated.json` are generated; never commit or hand-edit them. After changing doc/example routes, `skills/nat-best-practises/`, or discovery metadata, run the showcase `generate-discovery` target and commit `robots.txt`, `sitemap.xml`, `.well-known/api-catalog`, and `.well-known/mcp/server-card.json`.
- Demos use the shared primitives in `apps/showcase/src/app/ui/`.

## Conventions

- Angular v22: no `standalone: true`, no explicit `OnPush`, no `@HostBinding`/`@HostListener`; `input()`/`output()`, signals, native control flow.
- Must pass AXE and WCAG AA. When changing visible copy, `aria-label`s, or locale dictionaries, update the specs that lock that copy.
- Support Safari 16.5+; check newer CSS/platform features against it and provide a fallback.

## Testing

- Locate elements by `data-testid` (add one if missing), not by CSS classes or DOM shape, even where older specs still do.
- Gherkin shape: `describe('FEATURE: …')` → `describe('GIVEN: …')` → `describe('WHEN: …')` → `it('THEN: it …')`. Nesting is capped at 3, so keep `GIVEN`s flat and shared setup in a FEATURE-level `beforeEach`. When restructuring, one source test stays one test.
- Playwright: `e2e/<feature>/`, each workflow spec paired with `<feature>.a11y.e2e.ts`; sequential flows are one test with `test.step('THEN: …')` checkpoints; media emulation goes through `e2e/support/media.ts` (`page.emulateMedia()`, since `test.use` fixtures are unreliable here).
- Coverage thresholds are enforced per entry point. Never widen an entry point's `coverageInclude` to another's files; ratchet thresholds up when coverage rises, and lower one only with a reason in the PR body.
