# ng-advanced-table

`ng-advanced-table` is the bare core table package in this workspace. It renders the table itself and owns the TanStack state integration, but it does not ship opinionated controls or card styling.

## What Stays In Core

- standalone `NatTable`
- TanStack sorting, filtering, visibility, pinning, and optional pagination state
- sticky header and sticky pinned-column layout
- controlled or uncontrolled `NatTableState`
- typed column metadata through `NatTableColumnMeta`
- optional `(rowRendered)` instrumentation for performance tooling

## What Moved Out

Use [`ng-advanced-table-ui`](../ng-advanced-table-ui/README.md) for:

- search input
- column visibility chips
- page-size chips
- pager buttons
- sort/pin header actions
- themed card/surface styling

## Installation

```bash
npm install ng-advanced-table @tanstack/angular-table @angular/aria
```

Add `ng-advanced-table-ui` only if you want the companion controls:

```bash
npm install ng-advanced-table-ui
```

## Quick Start

```ts
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

interface ServiceRow {
  id: string;
  service: string;
  region: string;
  latencyMs: number;
}

@Component({
  selector: 'app-service-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [state]="tableState()"
      [initialState]="initialState"
      [enablePagination]="true"
      [getRowId]="getRowId"
      ariaLabel="Service latency"
      (stateChange)="tableState.set($event)"
    />
  `,
})
export class ServiceTableComponent {
  readonly rows = signal<ServiceRow[]>([]);
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly columns: ColumnDef<ServiceRow>[] = [
    {
      accessorKey: 'service',
      header: 'Service',
      enablePinning: true,
      meta: { label: 'Service' },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'region',
      header: 'Region',
      meta: { label: 'Region' },
      cell: (context) => context.getValue<string>(),
    },
    {
      accessorKey: 'latencyMs',
      header: 'Latency',
      meta: { label: 'Latency', align: 'end' },
      cell: (context) => `${context.getValue<number>()} ms`,
    },
  ];
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 0, pageSize: 25 },
  };
  readonly getRowId = (row: ServiceRow) => row.id;
}
```

## Core API

### Inputs

- `data`: required table rows
- `columns`: required TanStack column definitions
- `ariaLabel`: required accessible name for the grid
- `enableGlobalFilter`: enables global filtering for external search controls
- `allowColumnPinning`: enables sticky pinning where columns allow it
- `enablePagination`: enables TanStack pagination row models; defaults to `false`
- `emptyStateLabel`: message shown when the current row model is empty
- `globalFilterFn`: override for the built-in generic global search
- `initialState`: uncontrolled initial state
- `state`: controlled state slices
- `getRowId`: optional stable row id resolver
- `emitRowRenderEvents`: enables `(rowRendered)`

### Outputs

- `stateChange`: emits the next full `NatTableState`
- `rowRendered`: emits per-row paint measurements when instrumentation is enabled

### Public Instance API

- `table`: raw TanStack table instance
- `patchState(...)`: applies state updaters while respecting controlled slices

## `NatTableColumnMeta`

Attach optional metadata through `columnDef.meta`:

- `label`: accessible/friendly label for optional companion controls
- `align`: `'start' | 'end'`
- `cellTone`: returns `'positive' | 'negative' | 'neutral' | 'warning' | null`

## Migration Notes

If you are upgrading from the previous all-in-one `NatTable`:

- replace `showPagination` with `enablePagination`
- remove `pageSizeOptions`, `searchLabel`, `searchPlaceholder`, and `showColumnVisibility` from `NatTable`
- wrap headers with `withNatTableHeaderActions(...)` if you still want built-in sort/pin buttons
- compose search, pager, and visibility with `ng-advanced-table-ui`
