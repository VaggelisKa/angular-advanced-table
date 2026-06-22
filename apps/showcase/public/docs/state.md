`NatTable` can own all table state, or your app can control only the slices it cares about. The most important rule is simple: a state slice is controlled only when its property is present in `[state]`. Omitted slices stay internal.

## State Slices

`NatTableState` contains the serializable view state exposed by the table and companion surface.

| Slice              | Use it for                                 |
| ------------------ | ------------------------------------------ |
| `sorting`          | Active sort entries                        |
| `globalFilter`     | Current global search query                |
| `columnFilters`    | Column-specific filters keyed by column id |
| `pagination`       | `pageIndex` and `pageSize`                 |
| `columnVisibility` | Hideable column visibility map             |
| `columnOrder`      | Leaf-column order                          |
| `columnPinning`    | Left and right pinned column ids           |
| `columnSizing`     | Resized column widths in pixels            |
| `rowSelection`     | Selected row ids keyed by `getRowId`       |

The `pagination` slice always exists in emitted state. Pagination affects rendered rows only when pagination is enabled by a pagination companion control or a table setup that registers pagination.

## Start Uncontrolled

Most tables should start uncontrolled. Pass `[initialState]` for defaults and let the table manage updates internally.

```ts
readonly initialState: Partial<NatTableState> = {
  pagination: { pageIndex: 0, pageSize: 25 },
  sorting: [{ id: 'symbol', desc: false }],
  columnPinning: { left: ['symbol'], right: [] },
};
```

```html
<nat-table-surface [initialState]="initialState">
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />

  <nat-table
    [data]="rows()"
    [columns]="columns"
    [getRowId]="getRowId"
    accessibleName="Open positions"
  />
</nat-table-surface>
```

`initialState` is read as a seed. It is not a live binding for subsequent resets. If a slice also appears in `[state]`, the controlled value wins.

## Own One Slice

When your application needs to persist, synchronize, or inspect one state slice, control only that slice and listen to the matching granular output.

```ts
import { Component, computed, signal } from '@angular/core';
import type { SortingState } from '@tanstack/angular-table';

import type { NatTableState } from 'ng-advanced-table';

export class PositionsTable {
  readonly sorting = signal<SortingState>([]);

  readonly tableState = computed<Partial<NatTableState>>(() => ({
    sorting: this.sorting(),
  }));

  protected onSortingChange(sorting: SortingState): void {
    this.sorting.set(sorting);
  }
}
```

```html
<nat-table-surface [state]="tableState()" (sortingChange)="onSortingChange($event)">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

This keeps sorting controlled and leaves filters, pagination, pinning, sizing, order, visibility, and selection internal.

## Own Multiple Slices

Use one signal when several slices belong to the same workflow, such as URL persistence or a saved table view.

```ts
readonly viewState = signal<Partial<NatTableState>>({
  sorting: [{ id: 'symbol', desc: false }],
  columnVisibility: { desk: true, exchange: false },
  pagination: { pageIndex: 0, pageSize: 25 },
});

protected onPaginationChange(pagination: PaginationState): void {
  this.viewState.update((state) => ({ ...state, pagination }));
}

protected onColumnVisibilityChange(columnVisibility: VisibilityState): void {
  this.viewState.update((state) => ({ ...state, columnVisibility }));
}
```

```html
<nat-table-surface
  [state]="viewState()"
  (paginationChange)="onPaginationChange($event)"
  (columnVisibilityChange)="onColumnVisibilityChange($event)"
>
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />
  <nat-table-column-visibility />
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

Prefer granular outputs when the app controls known slices. Use `(stateChange)` when you intentionally need a broad table state snapshot.

## Full State Snapshots

`(stateChange)` is typed as `Partial<NatTableState>` because it pairs with the partial `[state]` input. The emitted value is useful for telemetry, local storage, or "save current view" commands.

```ts
readonly latestState = signal<Partial<NatTableState> | null>(null);

protected rememberState(state: Partial<NatTableState>): void {
  this.latestState.set(state);
}
```

```html
<nat-table-surface (stateChange)="rememberState($event)">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

Be careful with two-way full-state binding:

```html
<nat-table-surface [(state)]="tableState">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

After the first emitted state is assigned back into `[state]`, every slice is present and therefore every slice becomes controlled. Use this only when that is what you want.

## URL Persistence

For URL-backed views, store only the slices that should survive reloads. Keep volatile slices such as `columnSizing` or `rowSelection` out unless the product specifically needs them.

```ts
readonly stateFromUrl = signal<Partial<NatTableState>>({
  sorting: [{ id: 'price', desc: true }],
  pagination: { pageIndex: 0, pageSize: 50 },
});

protected onSortingChange(sorting: SortingState): void {
  this.stateFromUrl.update((state) => ({ ...state, sorting, pagination: firstPage(state) }));
  this.writeUrl();
}

protected onPaginationChange(pagination: PaginationState): void {
  this.stateFromUrl.update((state) => ({ ...state, pagination }));
  this.writeUrl();
}

private writeUrl(): void {
  const state = this.stateFromUrl();
  // Serialize only the slices that are part of the route contract.
}

function firstPage(state: Partial<NatTableState>): PaginationState {
  const pagination = state.pagination ?? { pageIndex: 0, pageSize: 25 };

  return { ...pagination, pageIndex: 0 };
}
```

Global filter and column-filter updates reset `pagination.pageIndex` to `0` inside the table. If your app owns filter slices and pagination together, mirror that behavior when updating your signal.

## Manual Modes

Use manual mode when the server owns sorting, filtering, or pagination. The table still emits state changes; your container fetches data and passes back the current page of rows.

```html
<nat-table-surface
  [mode]="{ pagination: 'manual', sorting: 'manual', filtering: 'manual' }"
  [manualPageCount]="pageCount()"
  [state]="tableState()"
  (stateChange)="loadPage($event)"
>
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />
  <nat-table
    [data]="rows()"
    [columns]="columns"
    [dataStatus]="status()"
    [error]="error()"
    accessibleName="Server-side positions"
  />
</nat-table-surface>
```

```ts
protected loadPage(state: Partial<NatTableState>): void {
  this.tableState.set(state);
  this.status.set(NAT_TABLE_DATA_STATUS.loading);
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

You can also mix modes. For example, `{ pagination: 'manual', sorting: 'auto' }` fetches pages externally while sorting the rows currently held by the client.

## Stable Row IDs

Always provide `getRowId` when selection, live updates, pagination, or server-backed data are involved.

```ts
readonly getRowId = (row: PositionRow) => row.id;
```

Without stable IDs, TanStack falls back to row positions. Selection, row activation, and per-row instrumentation can then follow indexes instead of the underlying data after sorting, filtering, paging, or refreshes.
