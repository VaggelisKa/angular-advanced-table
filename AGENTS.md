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

## Package Layering

- `ng-advanced-table` is the core package. It must not import from or otherwise depend on `ng-advanced-table-ui` or `ng-advanced-table-utils`.
- `ng-advanced-table-ui` and `ng-advanced-table-utils` are companion packages. They may depend on `ng-advanced-table` when they use its runtime services, injection tokens, components, or public contracts.
- `ng-advanced-table-locales` must remain below the core and companion packages in the dependency graph. It may be consumed by `ng-advanced-table`, `ng-advanced-table-ui`, and `ng-advanced-table-utils`, but it must not import from them.
- Do not add TypeScript path mappings, package dependencies, or re-exports that create a dependency from the core package back to a companion package. If a bundled experience is needed, create a separate wrapper package instead of making the core package depend on companions.

## Package Boundaries

- Keep `ng-advanced-table-types` internal. Published entry points must expose local public interfaces or aliases so generated declarations do not reference the private package.
- When changing shared contracts such as `NatTableColumnMeta`, `NatTableState`, sort indicator context, or table controller state, update the core table package, companion UI package, utils package, internal types package, public API barrels, and matching contract/type specs in the same change.

## Table Library Patterns

- Keep workflow-specific controls such as global search inputs and filter menus consumer-owned unless they are generic table primitives. Showcase examples can implement `app-*` components against `NatTableService`; `ng-advanced-table-ui` should stay focused on generic shells, companion controls, and controller wiring.
- Treat `dataStatus` as the table-owned switch for loading, empty, and error body rows. Keep data fetching, retry handling, and error classification in consuming containers, and render custom state UI through `natTableLoading`, `natTableEmpty`, or `natTableError` templates inside `<nat-table>`.
- For `<nat-table-toolbar>`, projected interactive controls that participate in toolbar navigation must use `natToolbarItem` or `NatToolbarGroup`, with DOM order matching screen-reader and roving-keyboard order.
- Do not use or reintroduce the removed `NatTableActionBar`/`<nat-table-action-bar>` API. Compose bundled control rows with `<nat-table-toolbar>`, `NatToolbarGroup`/`natToolbarItem`, and the pagination or scroll companion controls instead.

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

## Browser Compatibility

- The project must support Safari 16.
- Before using newer browser APIs, CSS features, or Angular/browser platform features, verify compatibility with Safari 16 and provide a compatible fallback or choose an older-supported approach.
- Be especially cautious with recently introduced CSS APIs such as `@starting-style`, View Transitions, newer selectors, and animation features.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
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
