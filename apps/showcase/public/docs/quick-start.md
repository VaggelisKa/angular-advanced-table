Start with `NatTable` inside `NatTableSurface`. The table renders the grid; the surface provides the scoped controller used for state, accessibility copy, locale, and optional companion controls.

## Install

Core table plus the surface and companion controls:

```bash
npm install ng-advanced-table ng-advanced-table-ui @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

Core table, companion controls, render metrics, and built-in locale dictionaries:

```bash
npm install ng-advanced-table ng-advanced-table-ui ng-advanced-table-utils ng-advanced-table-locales @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

## First Table

Define a row type, provide TanStack columns, and render `NatTable` inside `NatTableSurface`. Give every table an accessible name or visible caption, and provide a stable `getRowId` as soon as the table can sort, filter, select rows, paginate, or receive live updates.

```ts
import { Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
}

@Component({
  selector: 'app-positions-table',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface>
      <nat-table
        [data]="rows()"
        [columns]="columns"
        [getRowId]="getRowId"
        accessibleName="Open positions"
      />
    </nat-table-surface>
  `,
})
export class PositionsTable {
  readonly rows = signal<readonly PositionRow[]>([
    { id: 'pos-1', symbol: 'AAPL', desk: 'Momentum', price: 214.3 },
    { id: 'pos-2', symbol: 'MSFT', desk: 'Core', price: 489.1 },
  ]);

  readonly columns: ColumnDef<PositionRow>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true },
    },
    {
      accessorKey: 'desk',
      header: 'Desk',
      meta: { label: 'Desk' },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: { label: 'Price', align: 'end' },
      cell: (context) => `$${context.getValue<number>().toFixed(2)}`,
    },
  ];

  readonly getRowId = (row: PositionRow) => row.id;
}
```

Use a visible `caption` when the page design needs a table title inside the grid. Use `accessibleName` when the surrounding page already provides visible context.

```html
<nat-table [data]="rows()" [columns]="columns" caption="Open positions" />

<nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
```

## Core-Only Scope

When you intentionally use only `ng-advanced-table` without `ng-advanced-table-ui`, provide `NatTableService` at the local wrapper that owns the table. Most application code should prefer `NatTableSurface` because it provides the same scope and unlocks companion controls later.

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/common @angular/aria @angular/cdk
```

```ts
import { Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';
import { NatTable, NatTableService } from 'ng-advanced-table';

interface PositionRow {
  id: string;
  symbol: string;
}

@Component({
  selector: 'app-core-only-table',
  imports: [NatTable],
  providers: [NatTableService],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [getRowId]="getRowId"
      accessibleName="Core-only positions"
    />
  `,
})
export class CoreOnlyTable {
  readonly rows = signal<readonly PositionRow[]>([]);
  readonly columns: ColumnDef<PositionRow>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true },
    },
  ];
  readonly getRowId = (row: PositionRow) => row.id;
}
```

## Add Companion Controls

Use `ng-advanced-table-ui` when you want pagination controls, column visibility, horizontal scroll controls, toolbar behavior, header actions, selection checkbox columns, or export actions.

```ts
import { Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
}

@Component({
  selector: 'app-positions-table',
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePagination,
    NatTableScrollControl,
    NatTableSurface,
  ],
  template: `
    <nat-table-surface [initialState]="initialState">
      <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

      <nat-table
        [data]="rows()"
        [columns]="columns"
        [getRowId]="getRowId"
        accessibleName="Open positions"
      />

      <nat-table-scroll-control />
      <nat-table-column-visibility />
    </nat-table-surface>
  `,
})
export class PositionsTable {
  readonly rows = signal<readonly PositionRow[]>([]);
  readonly getRowId = (row: PositionRow) => row.id;
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 0, pageSize: 25 },
  };

  readonly columns: ColumnDef<PositionRow>[] = withNatTableHeaderActions([
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      meta: { label: 'Symbol', rowHeader: true },
    },
    {
      accessorKey: 'desk',
      header: 'Desk',
      meta: { label: 'Desk' },
    },
    {
      accessorKey: 'price',
      header: 'Price',
      meta: { label: 'Price', align: 'end' },
      cell: (context) => `$${context.getValue<number>().toFixed(2)}`,
    },
  ]);
}
```

`NatTableSurface` provides the scoped table controller used by companion controls. Controls inside the same surface can read table state, patch state, bind `aria-controls`, and resolve locale labels without extra wiring.

## Authoring Defaults

Start with these defaults unless the feature needs something else:

| Need                       | Default choice                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Table identity             | `accessibleName` or visible `caption`                                              |
| Row identity               | `getRowId = (row) => row.id`                                                       |
| Column labels              | `meta.label` on every column                                                       |
| Row header                 | `meta.rowHeader: true` on the primary identifying column                           |
| Numeric columns            | `meta.align: 'end'`                                                                |
| Initial page size or sort  | `[initialState]`                                                                   |
| Persisting one state slice | `[state]` with only that slice plus the matching `*Change` output                  |
| Search and domain filters  | Consumer-owned controls that patch table state                                     |
| Loading, empty, and error  | `dataStatus` plus `natTableLoading`, `natTableEmpty`, or `natTableError` templates |

## Next Steps

- Use `/docs/columns` for column metadata, sizing, custom cell components, header actions, and row activation.
- Use `/docs/state` for controlled and uncontrolled state patterns.
- Use `/docs/data-lifecycle` for loading, empty, error, background refresh, and manual server-side data.
- Use `/docs/composition` for surfaces, toolbars, consumer-owned search, and companion controls.
- Use `/docs/selection-export` for selection checkboxes, bulk actions, and CSV/custom export.
