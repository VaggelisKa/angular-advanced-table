# ng-advanced-table

Signals-first Angular data table built on [TanStack Table](https://tanstack.com/table). The core primitives plus the optional UI, utilities, and i18n layers ship in **one package** through subpath entry points — the same shape as `@angular/cdk`.

## Install

For an Angular app that already declares `@angular/core` and `@angular/common`, add the table package plus the required Angular companion peers:

```bash
npm install ng-advanced-table @angular/aria @angular/cdk
```

If your workspace does not already declare Angular framework packages, install the full required peer set:

```bash
npm install ng-advanced-table @angular/core @angular/common @angular/aria @angular/cdk
```

`@tanstack/angular-table` ships as a runtime dependency of `ng-advanced-table`. Install it directly only when your app imports TanStack APIs or types from `@tanstack/angular-table`.

Resolved published ranges and dependency classifications:

| Package                   | Published range | Classification                                                |
| ------------------------- | --------------- | ------------------------------------------------------------- |
| `@angular/core`           | `^22.0.2`       | Required peer; Angular framework singleton                    |
| `@angular/common`         | `^22.0.2`       | Required peer; Angular framework APIs                         |
| `@angular/aria`           | `^22.0.2`       | Required peer; grid, toolbar, and menu behaviors              |
| `@angular/cdk`            | `^22.0.2`       | Required peer; drag-drop, bidi, and overlay integrations      |
| `@tanstack/angular-table` | `^8.21.4`       | Runtime dependency; table runtime and public column contracts |
| `tslib`                   | `^2.8.1`        | Runtime dependency installed with `ng-advanced-table`         |

No Angular peers are optional. `@angular/aria` and `@angular/cdk` are required by production entry points, not only tests.

## Entry points

| Import from                        | What you get                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ng-advanced-table`                | Core table (`NatTable`, `NatTableService`, state, accessibility, keybindings)                                                       |
| `ng-advanced-table/components`     | Composable UI: surface, pagination, column visibility, scroll controls, toolbar, header actions, selection column, export directive |
| `ng-advanced-table/render-metrics` | Optional render-metrics store, filter, panel, and synthetic metrics column                                                          |
| `ng-advanced-table/locale`         | Built-in locale registry and `provide*Locales()` helpers                                                                            |

Each entry point is built and tree-shaken independently (`sideEffects: false`), so importing `ng-advanced-table/components` never pulls in `ng-advanced-table/render-metrics`.

```ts
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';
import { provideNatTableLocales } from 'ng-advanced-table/locale';
```

## Migrating from 1.x (separate packages → 2.0)

The standalone `ng-advanced-table-ui`, `ng-advanced-table-utils`, and `ng-advanced-table-locales` packages are no longer published. Install only `ng-advanced-table` and rewrite the import specifiers:

| 1.x package                 | 2.x entry point                    |
| --------------------------- | ---------------------------------- |
| `ng-advanced-table-ui`      | `ng-advanced-table/components`     |
| `ng-advanced-table-utils`   | `ng-advanced-table/render-metrics` |
| `ng-advanced-table-locales` | `ng-advanced-table/locale`         |

The core `ng-advanced-table` import and every exported symbol are unchanged — only the package layout moved.

## Docs

Usage guides, examples, and the full API live in the [showcase docs](https://github.com/VaggelisKa/angular-advanced-table/tree/main/apps/showcase/public/docs).

## License

MIT
