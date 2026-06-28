# ng-advanced-table

Signals-first Angular data table built on [TanStack Table](https://tanstack.com/table). The core primitives plus the optional UI, utilities, and i18n layers ship in **one package** through subpath entry points — the same shape as `@angular/cdk`.

## Install

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

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
