# angular-advanced-table

Workspace for three Angular packages built around TanStack Table:

- `ng-advanced-table`: bare table primitive with typed state, sticky pinning, and render instrumentation.
- `ng-advanced-table-ui`: optional composable UI controls and themed surfaces.
- `ng-advanced-table-utils`: optional render-metrics tooling.

## Package Roles

### `ng-advanced-table`

Ships `NatTable`, a headless-ish table component that renders only the table structure:

- TanStack sorting, filtering, pinning, visibility, and optional pagination state
- sticky header and pinned column layout
- controlled or uncontrolled `NatTableState`
- semantic cell alignment and tone metadata
- optional `(rowRendered)` instrumentation

It does **not** render search, column toggles, page-size chips, pager controls, or header action buttons.

### `ng-advanced-table-ui`

Ships opt-in presentation and control primitives:

- `NatTableSurface`
- `NatTableSearch`
- `NatTableColumnVisibility`
- `NatTablePageSize`
- `NatTablePager`
- `withNatTableHeaderActions(...)`, including custom sort-indicator content

Use only the pieces you need.

### `ng-advanced-table-utils`

Ships optional performance helpers:

- `NatTableRenderMetricsStore`
- `NatRenderMetricsFilter`
- `NatRenderMetricsPanel`
- `withRenderMetricsColumn(...)`

## Quick Start

```bash
npm install ng-advanced-table ng-advanced-table-ui @tanstack/angular-table @angular/aria
```

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

interface PositionRow {
  id: string;
  symbol: string;
  desk: string;
  price: number;
}

const columns = withNatTableHeaderActions<PositionRow>([
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
    accessorKey: 'price',
    header: 'Price',
    meta: { label: 'Price', align: 'end' },
    cell: (context) => `$${context.getValue<number>().toFixed(2)}`,
  },
]);

@Component({
  selector: 'app-positions-table',
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
      ariaLabel="Open positions"
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
export class PositionsTableComponent {
  readonly rows = signal<PositionRow[]>([]);
  readonly columns = columns;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 0, pageSize: 25 },
  };
  readonly getRowId = (row: PositionRow) => row.id;
}
```

## Breaking Change Summary

Compared with the previous all-in-one `NatTable`:

- `NatTable` is now barebones.
- built-in search, column visibility, page-size, pager, sort buttons, pin buttons, and card styling moved out of core
- `showPagination` was replaced by `enablePagination`
- `enablePagination` defaults to `false`
- `pageSizeOptions`, `searchLabel`, `searchPlaceholder`, and `showColumnVisibility` were removed from `NatTable`

## Repo Scripts

```bash
npm run test:packages
npm run build:packages
npm run build:showcase
npm run pack:dry-run
npm run verify
```

## Release Process

Releases are manual. Run the GitHub Actions `Release` workflow from the `main` branch when you want Changesets to create or update the release PR, or to publish an already versioned release.
