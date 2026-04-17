# ng-advanced-table-ui

Optional UI primitives for [`ng-advanced-table`](../ng-advanced-table/README.md).

This package keeps the table core composable: you import only the controls and visual shell you want.

## Exports

- `NatTableSurface`: themed card/surface wrapper and `--nat-table-*` token owner
- `NatTableSearch`: global search field wired to `NatTable.patchState(...)`
- `NatTableColumnVisibility`: column toggle chip group
- `NatTablePageSize`: page-size chip group
- `NatTablePager`: previous/next pager
- `withNatTableHeaderActions(...)`: wraps column headers with optional sort/pin buttons

## Installation

```bash
npm install ng-advanced-table-ui ng-advanced-table @tanstack/angular-table @angular/aria
```

## Example

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePageSize,
  NatTablePager,
  NatTableSearch,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface OrderRow {
  id: string;
  symbol: string;
  desk: string;
  notional: number;
}

const columns = withNatTableHeaderActions<OrderRow>([
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enablePinning: true,
    meta: { label: 'Symbol' },
    cell: (context) => context.getValue<string>(),
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    meta: { label: 'Desk' },
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
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSearch,
    NatTableSurface,
  ],
  template: `
    <nat-table
      #grid="natTable"
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [enablePagination]="true"
      [getRowId]="getRowId"
      ariaLabel="Orders"
      (stateChange)="tableState.set($event)"
    />

    <nat-table-surface>
      <nat-table-search [for]="grid" />
      <nat-table-column-visibility [for]="grid" />
      <nat-table-page-size [for]="grid" [pageSizeOptions]="[25, 50, 100]" />
      <nat-table-pager [for]="grid" />
    </nat-table-surface>
  `,
})
export class OrdersTableComponent {
  readonly rows = signal<OrderRow[]>([]);
  readonly columns = columns;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 0, pageSize: 25 },
  };
  readonly getRowId = (row: OrderRow) => row.id;
}
```

## Notes

- `NatTableSearch`, `NatTableColumnVisibility`, `NatTablePageSize`, and `NatTablePager` all take `for: NatTable<TData>`.
- `NatTableSurface` owns the default `--nat-table-*` variables that used to live in core.
- `withNatTableHeaderActions(...)` is additive: it preserves the original header content and only adds controls when the underlying column can sort or pin.

## Building

```bash
npx ng build ng-advanced-table-ui
```
