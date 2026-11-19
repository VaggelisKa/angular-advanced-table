The table runs on TanStack Table v9. Most consumer code keeps working unchanged, because `ng-advanced-table` exports TanStack's types with the library's feature set already applied. This page lists what does change.

## Run The Codemod

The package ships a codemod that applies the changes on this page. Run it from your project root, first as a dry run, then for real, and format afterwards:

```bash
npx ng-advanced-table-migrate-v9 --dry-run src
npx ng-advanced-table-migrate-v9 src
```

It edits TypeScript by syntax, not by text search: pinning keys and reads, `pin()` arguments and comparisons, `sortingFn`, renamed pinning and sorting methods, `getState().<slice>` reads, concretely typed `CellContext` parameters, and type imports from `@tanstack/angular-table`. It lists what needs a decision instead of guessing: whole-state `getState()` reads, the changed `getIsSome...Selected()` predicates, and `*flexRender` `props` built by a method call, in components and in HTML templates. Review the diff before committing.

## What Stays The Same

Import types from `ng-advanced-table`, not from `@tanstack/angular-table`. The library's `ColumnDef`, `Row`, `Column`, `Cell`, `CellContext`, `HeaderContext`, `Header`, `HeaderGroup`, `Table`, `FilterFn`, and `SortFn` keep the v8 generic shape, so a column file like this compiles as before:

```ts
import type { ColumnDef } from 'ng-advanced-table';

export const columns: ColumnDef<Order>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order', rowHeader: true } },
  { accessorKey: 'total', header: 'Total', meta: { label: 'Total', align: 'end' } }
];
```

Typing TanStack's own `ColumnDef` directly would need v9's extra feature-set generic (`ColumnDef<typeof features, Order>`). The library's aliases spare you that.

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

Inside a `computed` or `effect`, the atom read is tracked like any signal. Prefer the surface's `[(state)]` binding or `*Change` outputs when your app owns the state.

## Row Selection

`RowSelectionState` is typed as `Record<string, true>`: a row is selected when its id is a key. Check selection with `id in selection` or `Object.hasOwn(selection, id)`. Selection maps the table emits are plain objects.

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
