`NatTable` owns how loading, empty, and error states appear inside the table body. Your app owns data fetching, retry handling, request cancellation, error classification, and Manual Data Handling.

## State Model

Use `dataStatus` to tell the table whether rows are loading, errored, or available.

| `dataStatus` | Rows          | Rendered body state                                               |
| ------------ | ------------- | ----------------------------------------------------------------- |
| `'loading'`  | `[]`          | Loading row                                                       |
| `'loading'`  | existing rows | Existing rows remain visible and the grid gets `aria-busy="true"` |
| `'error'`    | any rows      | Error row                                                         |
| `'success'`  | `[]`          | Empty row                                                         |
| `'success'`  | rows          | Data rows                                                         |

The default status is `'success'`.

## Basic Fetching

Keep request state in the consuming component and pass it to the table.

```ts
import { Component, signal } from '@angular/core';
import {
  NAT_TABLE_DATA_STATUS,
  NatTable,
  NatTableEmptyTemplate,
  NatTableErrorTemplate,
  NatTableLoadingTemplate,
  type NatTableDataStatus
} from 'ng-advanced-table';

@Component({
  selector: 'app-positions-table',
  imports: [NatTable, NatTableLoadingTemplate, NatTableEmptyTemplate, NatTableErrorTemplate],
  templateUrl: './positions-table.html'
})
export class PositionsTable {
  readonly rows = signal<readonly PositionRow[]>([]);
  readonly status = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.loading);
  readonly error = signal<unknown>(null);

  load(): void {
    this.status.set(NAT_TABLE_DATA_STATUS.loading);
    this.error.set(null);

    this.positionsApi.list().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.status.set(NAT_TABLE_DATA_STATUS.success);
      },
      error: (error: unknown) => {
        this.error.set(error);
        this.status.set(NAT_TABLE_DATA_STATUS.error);
      }
    });
  }
}
```

```html
<nat-table [data]="rows()" [columns]="columns" [dataStatus]="status()" [error]="error()" accessibleName="Open positions">
  <ng-template natTableLoading>
    <strong>Loading positions</strong>
    <span>Fetching the latest open positions.</span>
  </ng-template>

  <ng-template natTableEmpty let-filtered="filtered">
    <strong>No positions found</strong>
    <span> {{ filtered ? 'No rows match the active filters.' : 'There are no open positions.' }} </span>
  </ng-template>

  <ng-template natTableError let-error>
    <strong>Positions unavailable</strong>
    <span>{{ formatError(error) }}</span>
    <button type="button" (click)="load()">Retry</button>
  </ng-template>
</nat-table>
```

Focusable controls inside state templates are managed by the table. Use normal buttons, links, and inputs.

## Background Refresh

When refreshing existing data, keep the rows visible and set `dataStatus="loading"`.

```ts
refresh(): void {
  this.status.set(NAT_TABLE_DATA_STATUS.loading);

  this.positionsApi.list().subscribe({
    next: (rows) => {
      this.rows.set(rows);
      this.status.set(NAT_TABLE_DATA_STATUS.success);
    },
    error: (error: unknown) => {
      this.error.set(error);
      this.status.set(NAT_TABLE_DATA_STATUS.error);
    },
  });
}
```

If `rows()` still contains data while the status is loading, the table keeps the data rows visible and marks the grid busy. This avoids a disruptive empty loading row for background refreshes.

## Empty State

An empty row is derived from `dataStatus="success"` plus no visible rows. Use the `filtered` template context to distinguish "no data" from "filters removed all rows".

```html
<ng-template natTableEmpty let-filtered="filtered" let-totalRowsValue="totalRowsValue">
  @if (filtered) {
  <strong>No matching positions</strong>
  <span>Clear search or filters to show {{ totalRowsValue }} total rows.</span>
  } @else {
  <strong>No positions yet</strong>
  <span>Create a position to populate this table.</span>
  }
</ng-template>
```

## Error State

Pass the raw error through `[error]` only if the template or logging flow needs it. The visible message should be product copy, not raw exception text.

```ts
protected formatError(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 403) {
    return 'You do not have access to this portfolio.';
  }

  return 'The request failed. Try again.';
}
```

```html
<ng-template natTableError let-error>
  <strong>Portfolio unavailable</strong>
  <span>{{ formatError(error) }}</span>
  <button type="button" (click)="load()">Retry</button>
</ng-template>
```

Keep retry and error classification in the container. The table should not know about HTTP status codes, permissions, or business-specific recovery flows.

## Manual Data Handling

Use manual modes when your app owns pagination, sorting, or filtering outside the table. The surface emits state; your component prepares rows and passes back the current page or row set.

```html
<nat-table-surface
  [mode]="{ pagination: 'manual', sorting: 'manual', filtering: 'manual' }"
  [manualPageCount]="pageCount()"
  [state]="tableState()"
  (stateChange)="onTableStateChange($event)">
  <nat-table-toolbar accessibleName="Positions toolbar">
    <app-table-search label="Search positions" />
    <button type="button" natToolbarItem (click)="reload()">Refresh</button>
  </nat-table-toolbar>

  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

  <nat-table [data]="rows()" [columns]="columns" [dataStatus]="status()" [error]="error()" accessibleName="Manual positions">
    <ng-template natTableLoading>Loading positions</ng-template>
    <ng-template natTableEmpty>No positions match the current request</ng-template>
    <ng-template natTableError>Positions could not be loaded</ng-template>
  </nat-table>
</nat-table-surface>
```

```ts
protected onTableStateChange(state: Partial<NatTableState>): void {
  this.tableState.set(state);
  this.loadServerRows(state);
}

private loadServerRows(state: Partial<NatTableState>): void {
  this.status.set(NAT_TABLE_DATA_STATUS.loading);
  this.error.set(null);
  const pagination = state.pagination ?? { pageIndex: 0, pageSize: 25 };

  this.positionsApi
    .list({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting: state.sorting ?? [],
      globalFilter: state.globalFilter ?? '',
      columnFilters: state.columnFilters ?? [],
    })
    .subscribe({
      next: (result) => {
        this.rows.set(result.rows);
        this.pageCount.set(result.pageCount);
        this.status.set(NAT_TABLE_DATA_STATUS.success);
      },
      error: (error: unknown) => {
        this.error.set(error);
        this.status.set(NAT_TABLE_DATA_STATUS.error);
      },
    });
}
```

For production request flows, cancel or ignore stale requests when a newer table state arrives. Keep that policy in the container or data service.

## Custom Filter Functions

For client-side tables, define column filter functions on the relevant columns and update `columnFilters` from app-owned controls.

```ts
const statusFilter: FilterFn<PositionRow> = (row, columnId, filterValue) => {
  const selected = (filterValue ?? []) as PositionStatus[];

  if (!selected.length) {
    return true;
  }

  return selected.includes(row.getValue(columnId) as PositionStatus);
};

readonly columns: ColumnDef<PositionRow>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: statusFilter,
    meta: { label: 'Status' },
  },
];
```

```ts
protected updateStatusFilter(statuses: readonly PositionStatus[]): void {
  this.tableState.update((state) => ({
    ...state,
    columnFilters: upsertColumnFilter(state.columnFilters ?? [], 'status', statuses),
    pagination: { ...(state.pagination ?? { pageIndex: 0, pageSize: 25 }), pageIndex: 0 },
  }));
}
```

## Practical Rules

- Keep `dataStatus` as the table-owned switch for body state rows.
- Keep fetching, retries, stale request handling, and error classification outside the table.
- Use loading with existing rows for background refreshes.
- Use `natTableEmpty` for both no-data and filtered-empty messages.
- Reset `pageIndex` when a user changes global search or column filters.
- Use rows with stable string or number `id` values, or provide `getRowId` when identity is custom.
