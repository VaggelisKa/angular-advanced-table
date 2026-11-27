The table runs on TanStack Table v9. Most consumer code keeps working unchanged, because `ng-advanced-table` exports TanStack's types with the library's feature set already applied. This page lists what does change, and the package ships a codemod that makes most of those changes for you.

## What You Need To Do

| Change                                                                               | Codemod                                           | What is left for you                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------- |
| [Column pinning](#column-pinning) uses `start`/`end`, both keys required             | Rewrites keys, reads, `pin()`, and comparisons    | Nothing                                                    |
| [Sorting functions](#sorting-functions): `sortingFn` becomes `sortFn`                | Rewrites column definitions                       | Rename uses of the `sortingFns` registry, which it reports |
| [Reading table state](#reading-table-state): `getState()` is gone                    | Rewrites `table.getState().<slice>` reads         | Whole-state reads and unclear receivers, which it reports  |
| [Cell renderers](#cell-renderers) typed with a concrete value                        | Retypes the parameter and narrows `getValue<T>()` | Destructured parameters, which it reports                  |
| [Types imported](#what-stays-the-same) from `@tanstack/angular-table`                | Moves them to `ng-advanced-table`                 | Namespace imports (`import * as`), which it reports        |
| [Row selection](#row-selection): `getIsSome...Selected()` also covers "all selected" | Reports unguarded calls                           | Add `&& !getIsAll...Selected()` where you need "some"      |
| [Custom render content](#custom-render-content): stable `*flexRender` `props`        | Reports `props` built by a call, in TS and HTML   | Make those `props` a `computed` or a field                 |
| [Sort order](#sorting-functions) of `Date` subclasses and of two `undefined` values  | No code change                                    | Check sorted output if you rely on either case             |
| [Column and table meta](#column-and-table-meta) augmentations need the feature set   | No code change                                    | Add `TFeatures` as the first type parameter                |

## Run The Codemod

The codemod ships inside the `ng-advanced-table` package as the `ng-advanced-table-migrate-v9` command. Run it from your project root, with your work committed so the diff is easy to review:

1. Update `ng-advanced-table` to the release built on TanStack v9, so the command is installed.
2. Preview the changes. Nothing is written.

   ```bash
   npx -p ng-advanced-table ng-advanced-table-migrate-v9 --dry-run src
   ```

3. Apply them.

   ```bash
   npx -p ng-advanced-table ng-advanced-table-migrate-v9 src
   ```

4. Run your formatter. The codemod keeps the surrounding code as it was but does not reflow lines.
5. Work through the **Needs a manual look** list it prints. Each entry has a `file:line:column` and says what to do.
6. Build or typecheck the project, and review the diff before committing.

`-p ng-advanced-table` tells `npx` which package provides the command, so it never looks up a separate package named `ng-advanced-table-migrate-v9`.

A run prints each file it changes, a total, and the entries that need a decision:

```text
updated src/app/orders/orders.columns.ts (6 edits)
updated src/app/orders/orders.ts (2 edits)

8 edits in 2 of 3 files.

Needs a manual look (2):
  src/app/orders/orders.html:1:15  FlexRender `props` come from a call: make sure it returns the same object until its inputs change (…).
  src/app/orders/orders.ts:5:34  `getState()` is gone in v9: read one slice with `table.atoms.<slice>.get()`, or the whole state with `table.store.get()`.
```

How it works:

- **Paths.** Pass one or more files or folders; it defaults to `src`. It reads every `.ts` and `.html` file, including files that use the table without importing the library, and skips `node_modules`, `dist`, `.angular`, `.git`, `.nx`, `coverage`, `.d.ts` files, and symbolic links.
- **Options.** `--dry-run` is the only option; `--help` prints the usage. Any other option, such as a mistyped `--dryrun`, stops the run before any file is read, so a typo never writes files.
- **By syntax, not text.** It parses TypeScript with your project's own `typescript` package, so `rect.left`, `style.right`, or an unrelated `{ left: 4 }` stay as they are. It exits with an error if your project has no `typescript` installed.
- **Only tables.** Other stores have a `getState()` too, so `getState().<slice>` is rewritten only when all three hold: the file imports `ng-advanced-table` or `@tanstack/angular-table`, the receiver is named like a table (`table`, `this.table()`, `ordersTable`), and the slice is a table state slice such as `sorting` or `pagination`. A read that looks like a table read but misses one of these is reported instead; anything else, such as `settingsStore.getState().theme`, is left alone.
- **Conditional pin sides.** `column.pin(pinned ? false : 'left')` is rewritten too, in either branch.
- **Safe to rerun.** Code that is already on v9 is left alone, so a second run makes no edits.
- **HTML is report-only.** Templates are checked for `*flexRender` `props` but never edited.

## What Stays The Same

Import types from `ng-advanced-table`, not from `@tanstack/angular-table`. The library's `ColumnDef`, `Row`, `Column`, `Cell`, `CellContext`, `HeaderContext`, `Header`, `HeaderGroup`, `Table`, `FilterFn`, and `SortFn` keep the v8 generic shape, so a column file like this compiles as before:

```ts
import type { ColumnDef } from 'ng-advanced-table';

export const columns: ColumnDef<Order>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order', rowHeader: true } },
  { accessorKey: 'total', header: 'Total', meta: { label: 'Total', align: 'end' } }
];
```

Typing TanStack's own `ColumnDef` directly would need v9's extra feature-set generic (`ColumnDef<typeof features, Order>`). The library's aliases spare you that. The same applies to the column definition variants (`AccessorColumnDef`, `AccessorKeyColumnDef`, `AccessorFnColumnDef`, `DisplayColumnDef`, `GroupColumnDef`, `IdentifiedColumnDef`), `TableOptions<Order>`, and `TableState`.

For any other TanStack type that takes the feature set first, pass the library's `NatTableFeatures`:

```ts
import type { NatTableFeatures } from 'ng-advanced-table';
import type { ColumnHelper } from '@tanstack/angular-table';

type OrderColumnHelper = ColumnHelper<NatTableFeatures, Order>;
```

## Column And Table Meta

If you extend `ColumnMeta` or `TableMeta` through module augmentation, add v9's feature-set parameter first. The parameter list must match TanStack's exactly, or the declarations do not merge:

```ts
// Before
declare module '@tanstack/angular-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    hint?: string;
  }
}

// After
declare module '@tanstack/angular-table' {
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue extends CellData = CellData> {
    hint?: string;
  }
}
```

Import `TableFeatures`, `RowData`, and `CellData` from `@tanstack/angular-table` in that file. `TableMeta` takes `<TFeatures extends TableFeatures, TData extends RowData>`. The codemod does not rewrite augmentations.

## Column Pinning

Pinning state uses the logical zones `start` and `end` instead of `left` and `right`, and both keys are required.

```ts
// Before
columnPinning: { left: ['symbol'], right: ['actions'] }

// After
columnPinning: { start: ['symbol'], end: ['actions'] }
```

In a left-to-right table, `start` is the left edge. The same applies to `column.pin('start' | 'end')` and to comparisons with `column.getIsPinned()`.

## Sorting Functions

Column definitions use `sortFn` instead of `sortingFn`. Built-in names (`'alphanumeric'`, `'text'`, `'datetime'`, `'basic'`, and the case-sensitive variants) still work as strings.

```ts
// Before
{ accessorKey: 'symbol', sortingFn: (rowA, rowB) => compareSymbols(rowA.original, rowB.original) }

// After
{ accessorKey: 'symbol', sortFn: (rowA, rowB) => compareSymbols(rowA.original, rowB.original) }
```

Two orderings change:

- The `datetime` sort compares every `Date`, subclasses included, by `getTime()`.
- With `sortUndefined: 'first'` or `'last'`, two rows whose values are both `undefined` tie on that column, so the next sort column decides their order.

## Reading Table State

`table.getState()` no longer exists. Read one slice through its atom:

```ts
// Before
const pageIndex = table.getState().pagination.pageIndex;

// After
const pageIndex = table.atoms.pagination.get().pageIndex;
```

To read the whole state at once, use `table.store.get()`. Inside a `computed` or `effect`, the atom read is tracked like any signal. Prefer the surface's `[(state)]` binding or `*Change` outputs when your app owns the state.

## Row Selection

`RowSelectionState` is typed as `Record<string, true>`: a row is selected when its id is a key. Check selection with `id in selection` or `Object.hasOwn(selection, id)`. Selection maps the table emits are plain objects.

`table.getIsSomeRowsSelected()` and `table.getIsSomePageRowsSelected()` now also return `true` when every row is selected. For an indeterminate "select all" checkbox, guard them:

```ts
const indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
```

## Cell Renderers

A cell function typed with a concrete value no longer fits a column typed `ColumnDef<Row>`. Type the context with `unknown` and narrow the value where you read it:

```ts
// Before
{ accessorKey: 'total', cell: (context: CellContext<Order, number>) => currency.format(context.getValue()) }

// After
{ accessorKey: 'total', cell: (context: CellContext<Order, unknown>) => currency.format(context.getValue<number>()) }
```

Leaving the parameter untyped also works: `cell: (context) => currency.format(context.getValue<number>())`.

## Custom Render Content

When you pass `props` to `*flexRender` yourself, pass the same object until its inputs change, for example from a `computed`. TanStack v9 re-renders the content whenever the `props` object changes identity, so a method that builds a new object on every change-detection pass makes Angular re-render forever and stop with an infinite change detection error (NG0103).

```ts
protected readonly indicatorContext = computed(() => ({ column: this.column(), direction: this.direction() }));
```

```html
<ng-container *flexRender="indicator(); props: indicatorContext(); let rendered">{{ rendered }}</ng-container>
```
