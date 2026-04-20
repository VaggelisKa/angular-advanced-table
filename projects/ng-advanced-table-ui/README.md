# ng-advanced-table-ui

Optional UI package for the `angular-advanced-table` workspace.

## Canonical Docs

- Workspace and package docs: [../../README.md](../../README.md)
- UI package reference: [../../README.md#ui-package](../../README.md#ui-package)
- Core table reference: [../../README.md#core-table](../../README.md#core-table)
- Install options: [../../README.md#install](../../README.md#install)

This package README is intentionally scoped to package entry-point information. The root README is the canonical source for controller behavior and composition rules.

## Package Scope

Use this package when you want optional companions around `NatTable`:

- `NatTableSurface`
- `NatTableSearch`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `withNatTableHeaderActions(...)`

The package accepts any compatible `NatTableUiController<TData>`. `<nat-table #grid="natTable">` satisfies that contract directly.

## Install

```bash
npm install ng-advanced-table ng-advanced-table-ui @tanstack/angular-table @angular/aria @angular/cdk
```

## Public Exports

- `NatTableSurface`
- `NatTableSearch`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `withNatTableHeaderActions(...)`
- `NatTableHeaderActionsOptions`
- `NatTableSortIndicatorContent`
- `NatTableUiController`
- `NatTableUiState`
- `NatTableColumnMeta`
- `NatTableSortDirection`
- `NatTableSortIndicatorContext`

## Package Notes

- `NatTableSurface` owns the default `--nat-table-*` CSS variables.
- The controller contract is intentionally small: `table`, `enableGlobalFilter()`, `enablePagination()`, `patchState(...)`, and `tableElementId()`.
- `withNatTableHeaderActions(...)` preserves the original header content and only adds controls when the column can sort or pin.
- You can use any subset of this package or replace all of it with custom controls.

## Minimal Example

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTablePager,
  NatTableSearch,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface OrderRow {
  id: string;
  symbol: string;
  notional: number;
}

const columns = withNatTableHeaderActions<OrderRow>([
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    meta: { label: 'Symbol' },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'notional',
    header: 'Notional',
    meta: { label: 'Notional', align: 'end' },
    cell: (context) => `$${context.getValue<number>().toFixed(0)}`,
  },
]);

@Component({
  selector: 'app-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTablePager, NatTableSearch, NatTableSurface],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [enablePagination]="true"
      ariaLabel="Orders"
      (stateChange)="tableState.set($event)"
    />

    <nat-table-surface>
      <nat-table-search [for]="grid" />
      <nat-table-pager [for]="grid" />
    </nat-table-surface>
  `,
})
export class OrdersTableComponent {
  readonly rows = signal<OrderRow[]>([]);
  readonly columns = columns;
  readonly tableState = signal<Partial<NatTableState>>({});
}
```
