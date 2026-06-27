You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Release Workflow

- For every code change that affects behavior, public API, docs, examples, or tests, add a new Nx version plan file in `.nx/version-plans/` as part of the same task unless the user explicitly says not to.
- Current project release policy intentionally does not follow strict Semantic Versioning. Breaking public API or behavior changes are allowed and should be recorded as `minor` or `patch` version plans for now.
- Do not create a `major` version plan unless the user explicitly asks for one.
- Use `minor` for public API replacements, new features, and broad behavior changes, even when they are breaking.
- Use `patch` for bug fixes, internal refactors, docs-only updates, and test-only updates, even when they include small behavior corrections.
- When the user specifies a release level, use that level. When the level is ambiguous, infer `minor` for public API or behavior changes and `patch` for implementation-only, docs-only, or test-only changes.
- Include all packages meaningfully affected by the change in the version plan frontmatter.
- Do not create Nx version plan files for changes that only affect the showcase app, because showcase-only changes do not affect the published libraries.
- Do not reuse or edit unrelated existing version plan files unless the user asks for that.

## Workspace Tooling

- Use `pnpm` and Corepack for installs, scripts, Nx commands, and CI examples; keep `pnpm-lock.yaml` current and do not reintroduce `package-lock.json`.
- Keep shared dependency versions in `pnpm-workspace.yaml` catalogs (`frontend`, `peers`, `frontend-dev`, `shared`, `shared-dev`) instead of duplicating literal versions in package manifests.
- Use the root lint and format scripts for workspace validation: `pnpm run format:check`, `pnpm run lint`, and `pnpm run lint:styles`. Nx infers project `lint` targets from per-project `eslint.config.mjs` files and project `stylelint` targets from `stylelint.config.mjs` files.
- Before merging or asking the user to merge a PR, run `pnpm run format:check` and fix any Prettier drift in the PR.
- Keep Nx project configuration in each project `package.json` `nx` block. Published library manifests must not ship that `nx` block; rely on the `strip-nx` target or `pnpm run pack:dry-run` before publishing or inspecting package tarballs.

## Entry-Point Layering

The library ships as one `ng-advanced-table` package whose layers are ng-packagr secondary entry points: `ng-advanced-table` (core, primary), `ng-advanced-table/ui`, `ng-advanced-table/utils`, and `ng-advanced-table/locale`. ng-packagr builds each entry point separately and topologically, so this layering is enforced at build time — a cross-entry import is treated as an external dependency, and a circular entry-point dependency is a hard build error. It is **also lint-enforced**: per-layer `no-restricted-imports` rules in `libs/ng-advanced-table/eslint.config.mjs` fail `nx lint` on any cross-entry-point import that violates the graph below, so a break is caught before build/review.

- `ng-advanced-table` (core) must not import from `ng-advanced-table/ui` or `ng-advanced-table/utils`.
- `ng-advanced-table/ui` and `ng-advanced-table/utils` are companion entry points. They may import `ng-advanced-table` (core) when they use its runtime services, injection tokens, components, or public contracts.
- `ng-advanced-table/locale` must remain the leaf — below core and the companions. It may be consumed by `ng-advanced-table`, `ng-advanced-table/ui`, and `ng-advanced-table/utils`, but it must not import from them.
- Cross-entry imports must use the package specifier (e.g. `import { X } from 'ng-advanced-table/locale'`), never a deep relative path across an entry-point boundary — a deep relative import silently inlines the code and breaks tree-shaking. Do not add path mappings, dependencies, or re-exports that make core depend on a companion entry point.
- Source path mappings for `ng-advanced-table` (+ its subpaths) live in `tsconfig.paths.json`, extended only by the showcase config and the library `tsconfig.spec.json` — **not** `tsconfig.base.json`. The production build (`tsconfig.lib*.json`) carries no path mappings and resolves these specifiers via `node_modules` + the package `exports` map, exactly like a published consumer. Keep these mappings out of the shared base so the build stays resolution-faithful; entry files are named `index.ts` (not `public-api.ts`).

## Package Boundaries

- Keep the testing contract mirror internal: it is a source-only, test-only contract mirror living at `libs/ng-advanced-table/testing/`, imported solely by `*.spec.ts` files via a relative path (e.g. `../testing`), which assert production types against it via `Equal<>`. It is never built or published — no production source imports it (so ng-packagr never reaches it) and `tsconfig.lib.json` excludes the `testing/` folder. Published entry points must expose their own local public interfaces or aliases so generated declarations never reference it.
- When changing shared contracts such as `NatTableColumnMeta`, `NatTableState`, sort indicator context, or table controller state, update the core entry point, the `ui` and `utils` entry points, the internal testing contract mirror (`libs/ng-advanced-table/testing/`), public API barrels, and matching contract/type specs in the same change.

## Table Library Patterns

- Keep workflow-specific controls such as global search inputs and filter menus consumer-owned unless they are generic table primitives. Showcase examples can implement `app-*` components against `NatTableService`; `ng-advanced-table/ui` should stay focused on generic shells, companion controls, and controller wiring.
- Treat `dataStatus` as the table-owned switch for loading, empty, and error body rows. Keep data fetching, retry handling, and error classification in consuming containers, and render custom state UI through `natTableLoading`, `natTableEmpty`, or `natTableError` templates inside `<nat-table>`.
- For `<nat-table-toolbar>`, projected interactive controls that participate in toolbar navigation must use `natToolbarItem` or `NatToolbarGroup`, with DOM order matching screen-reader and roving-keyboard order.
- Do not use or reintroduce the removed `NatTableActionBar`/`<nat-table-action-bar>` API. Compose bundled control rows with `<nat-table-toolbar>`, `NatToolbarGroup`/`natToolbarItem`, and the pagination or scroll companion controls instead.
- Keep pure table-state and column helper functions in `libs/ng-advanced-table/src/components/table/table-utils.ts`; keep `table.ts` focused on Angular wiring, signals, and DOM behavior.
- Keep table data export as optional `ng-advanced-table/ui` Table Action behavior (`natTableExport`/`provideNatTableExport(...)`). The core package may expose shared column metadata such as `NatTableColumnMeta.export`, but it must not own export side effects or file-generation state.
- Keep render-metrics controls (`NatRenderMetricsFilter`, `NatRenderMetricsPanel`) wired through an explicit `[controller]` (`NatTable` or `NatTableRenderMetricsController`). Do not place `NatRenderMetricsFilter` inside `<nat-table-toolbar>` because its internal chip buttons are a standalone labeled button group, not toolbar items.
- When comparing `NatTableState` slices in `ng-advanced-table/ui`, use the local structural equality helper instead of `JSON.stringify`; consumer filter values can include non-JSON-safe values such as `BigInt`, `Set`, `Date`, `RegExp`, or cycles.
- When changing table keybindings, update `keybindings.ts`, `keybindings.md`, `NatTableHotkeyA11y`, public API exports, and table/surface input coverage together so configured shortcuts, conflict warnings, and `aria-keyshortcuts` stay aligned.

## Documentation Ownership

- Keep "how to use the table" guidance in showcase Documentation Topics served under `/docs/*`. Author prose as GitHub-flavored Markdown under `apps/showcase/public/docs/`, register topic routes in `apps/showcase/src/app/showcase-navigation.ts`, and compose local TOCs, related links, snippets, and embedded examples in `apps/showcase/src/app/pages/docs/docs-topics.ts`.
- Keep feature-specific live demos as Topic Examples inside their relevant docs topics, using `DocsTopicExample` preview/code blocks. Reserve `/examples/*` for broad standalone scenarios or tools such as the multiple-features demo and table builder; do not add one-feature gallery routes or new top-level showcase routes such as `/sorting` or `/toolbar`.
- Do not keep root or package README placeholders that only link back to showcase docs. Remove duplicated usage/reference markdown instead of replacing it with link-only docs.
- Keep repository markdown only when it is technical maintainer material: contribution rules, package boundaries, architectural decisions, terminology, changelogs, internal package notes, or "how the table is built" explanations.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- When changing companion-control visible text, `aria-label` copy, or built-in UI locale dictionaries, keep visible words inside accessible names and update the locale specs plus UI component specs that lock that copy.
- Keep `hiddenHeaderLabel` rendered as screen-reader-only header text for both primitive and non-primitive column headers, including columns wrapped with `withNatTableHeaderActions(...)`.

## Testing

- Prefer `data-testid` selectors for automated test hooks. Avoid coupling tests to CSS classes, DOM shape, or incidental implementation attributes when a stable `data-testid` can be added.
- For showcase Playwright coverage, group specs by feature under `e2e/<feature>/`, pair pointer/workflow specs with keyboard accessibility specs named `<feature>.a11y.e2e.ts`, and keep the showcase `e2e` Nx target wired into CI when those files are added or moved.
- Write specs in formal Gherkin: `describe('FEATURE: …')` → `describe('GIVEN: …')` → `describe('WHEN: …')` → `it('THEN: it …')` (Playwright: `test.describe`/`test`). Use behavioral leaf names, and keep one source test as one test when restructuring (never split or merge to fit the shape).
- Vitest `describe` nesting is capped at 3 (`vitest/max-nested-describe`): keep `GIVEN`s as flat siblings, put shared module setup in a FEATURE-level `beforeEach` (not a setup-only `GIVEN` wrapper), and keep `WHEN:` titles unique within a `GIVEN` (`vitest/no-identical-title`) — differentiate repeats by scenario instead of merging non-adjacent tests.
- In e2e, keep a sequential interaction flow as a single test and mark each checkpoint with `await test.step('THEN: …', async () => { … })`; declare any locator or variable shared across steps above the steps, since `test.step` closures do not share scope.

## Browser Compatibility

- The project must support Safari 16.2 and newer.
- Before using newer browser APIs, CSS features, or Angular/browser platform features, verify compatibility with Safari 16.2 and provide a compatible fallback or choose an older-supported approach.
- Be especially cautious with recently introduced CSS APIs such as `@starting-style`, View Transitions, newer selectors, and animation features.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Do NOT set `changeDetection` explicitly; rely on the Angular v22 default (`OnPush`). Only add `changeDetection: ChangeDetectionStrategy.Eager` when a component genuinely requires eager checking
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
