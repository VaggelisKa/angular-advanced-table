# Manual Data Workflows

Use manual mode when the server handles sorting, filtering, pagination, or refresh.

## Ownership

- Keep API calls, query construction, cancellation, retries, errors, and optimistic updates in the app.
- Use `NatTableUserState` as the table/view contract.
- Let table interactions update state, then derive the server request from that state.
- Use `dataStatus` for loading, empty, and error rows.
- During background refresh, either keep current rows visible or show loading based on the product flow.

## State Shape

Track the table state and request state separately.

```ts
readonly tableState = signal<Partial<NatTableUserState>>({
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 25 }
});

readonly requestStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.loading);
readonly rows = signal<readonly InvoiceRow[]>([]);
readonly error = signal<unknown>(undefined);
readonly manualPageCount = signal<number | undefined>(undefined);
```

Use manual mode when the server controls row models.

```html
<nat-table-surface [(state)]="tableState" mode="manual" [manualPageCount]="manualPageCount()">
  <nat-table [columns]="columns" [data]="rows()" [dataStatus]="requestStatus()" [error]="error()" accessibleName="Invoices">
    <ng-template natTableLoading>Loading invoices</ng-template>
    <ng-template natTableEmpty let-filtered>
      {{ filtered ? 'No invoices match the active filters.' : 'There are no invoices.' }}
    </ng-template>
    <ng-template natTableError>Invoices could not be loaded</ng-template>
  </nat-table>
</nat-table-surface>
```

## Request Derivation

Derive requests from table state. Do not keep duplicate sort/filter/page fields.

```ts
readonly invoiceQuery = computed(() => {
  const state = this.tableState();

  return {
    search: state.globalFilter ?? '',
    sorting: state.sorting ?? [],
    columnFilters: state.columnFilters ?? [],
    pageIndex: state.pagination?.pageIndex ?? 0,
    pageSize: state.pagination?.pageSize ?? 25
  };
});
```

When search or filters change, reset pagination to page one before fetching.

```ts
setSearch(value: string): void {
  this.tableState.update((state) => ({
    ...state,
    globalFilter: value,
    pagination: { ...(state.pagination ?? { pageSize: 25 }), pageIndex: 0 }
  }));
}
```

## Fetching Rules

- Cancel or ignore stale requests.
- Set loading before the first request.
- On success, set rows, clear error, update `manualPageCount`, and set empty status when needed.
- On failure, keep retry context and set `dataStatus` to error.
- Retry by rerunning the current derived query.

## Sorting And Filtering

- Translate `sorting` and `columnFilters` to the server contract in the app.
- Keep column ids stable and aligned with server field names or an explicit mapping.
- Use product labels, not raw server field names.
- Disable unsupported sorting/filtering per column.

## Pagination

- Use `manualPageCount` when the server provides total pages or total row count.
- Reset to page one when filters, search, or page size change.
- Clamp or refetch when deletes or remote changes make the current page index invalid.
- Choose page size options for the product flow.
