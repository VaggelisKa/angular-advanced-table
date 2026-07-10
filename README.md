# Angular Advanced Table

A monorepo containing `ng-advanced-table`, a signals-first, accessible data table library for Angular, plus its showcase/documentation site.

## What is ng-advanced-table?

`ng-advanced-table` is a production-ready Angular table built on [TanStack Table](https://tanstack.com/table/latest/docs/framework/angular/angular-table). It provides:

- Core primitives (`NatTable`, `NatTableService`, state management, keyboard/a11y, resizing, reordering, etc.)
- Composable companion UI via subpath imports (`ng-advanced-table/components`)
- Optional render metrics, filtering, and synthetic columns (`ng-advanced-table/render-metrics`)
- Full i18n and locale customization (`ng-advanced-table/locale`)

Everything ships in **one package** using secondary entry points (same pattern as Angular CDK). The library emphasizes accessibility (WCAG AA + axe), theming via CSS custom properties, and clear ownership boundaries between the table and consuming applications.

See the package's own `libs/ng-advanced-table/README.md` for install and API details. Full usage guides and live demos live in the showcase documentation.

## Project Structure

```
.
├── AGENTS.md                 # Mandatory reading for contributors (rules, layering, release process)
├── CONTEXT.md                # Project terminology and domain language
├── apps/
│   └── showcase/             # The documentation site + gallery + live examples
│       ├── public/docs/      # Markdown source for all Documentation Topics
│       └── src/app/docs/     # Angular components that render docs + embedded demos
├── libs/
│   └── ng-advanced-table/    # The published library (single package, multiple entry points)
│       ├── src/              # Core: table component, state, services, utils, a11y, hotkeys
│       ├── components/       # Composable UI (surface, toolbar, pagination, selection, etc.)
│       ├── render-metrics/   # Metrics store + filter/panel components
│       ├── locale/           # Locale data + provide*Locales() helpers
│       └── testing/          # Internal test-only type mirror (never published)
├── e2e/                      # Playwright end-to-end + keyboard/a11y specs
├── docs/
│   ├── adr/                  # Architecture decision records
│   └── specs/                # Design specs for upcoming or complex features
├── tools/                    # Build-time generators (docs, discovery, packaging)
├── package.json              # Root scripts (all use pnpm + Nx)
└── pnpm-workspace.yaml       # Dependency catalogs + workspace configuration
```

### Layering Notes (high level)

- The library enforces strict entry-point boundaries (`core` → companions → `locale` is a leaf). Cross-entry imports are linted and will break the build.
- Inside the library, code is organized by "element layers" (`feature`, `domain-logic`, `ui`, `utils`, `common`) with directional import rules enforced by `eslint-plugin-boundaries`.
- Read the full rules in **AGENTS.md** (sections: Entry-Point Layering, Element Layering).

## Common Commands

All commands run from the repository root:

| Command                   | Description                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| `pnpm install`            | Install dependencies (uses pnpm + Corepack)                            |
| `pnpm start`              | Serve the showcase docs site for local development                     |
| `pnpm run build:packages` | Build the `ng-advanced-table` library                                  |
| `pnpm run build:showcase` | Build the showcase (runs doc generators)                               |
| `pnpm test`               | Run all unit tests (library + showcase)                                |
| `pnpm run e2e`            | Run Playwright e2e + a11y tests                                        |
| `pnpm run lint`           | Lint everything                                                        |
| `pnpm run format:check`   | Check Prettier formatting (required before merge)                      |
| `pnpm run verify`         | Full verification (MCP security + builds + prerender + release + pack) |

## Working on the Project

- **Library source changes**: Edit under `libs/ng-advanced-table/`. Pay attention to which entry point a file belongs to.
- **Documentation**: Edit Markdown under `apps/showcase/public/docs/`. After changes, the showcase build runs `generate-docs`. Do not edit generated files directly.
- **Examples and gallery**: Live demos live in `apps/showcase/src/app/docs/demos/` and `apps/showcase/src/app/gallery/`.
- **Tests**: Co-located `*.spec.ts` for units. E2E specs live in `e2e/<feature>/` (include `.a11y.e2e.ts` for keyboard coverage).
- **Release plans**: Most changes that touch library behavior, public API, docs, or tests require a new file in `.nx/version-plans/`. See AGENTS.md.

## Guidelines

**Read `AGENTS.md` first.** It is the authoritative source for:

- Release workflow and when to create version plans
- Workspace tooling (pnpm only, catalog versions, format/lint before merge)
- Strict architectural rules (entry points, element layers, package boundaries)
- Documentation ownership (showcase docs are the source of truth)
- Angular conventions, accessibility requirements, testing style, and browser support targets

Other useful files:

- `CONTEXT.md` — canonical terminology used across the project and docs.
- `skills/nat-best-practises/` — guidance for AI/agent usage of the library.

Licensed under [MIT](LICENSE).
