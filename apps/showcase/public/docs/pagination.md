## When To Use Pagination

Use pagination when the user needs a smaller visible working set or when data is naturally handled in pages. Prefer no pagination when the row count is small and scanning the whole table is faster.

## Client Pagination

`NatTablePagination` enables the pagination row model and patches the `pagination` state slice. Provide page-size options that match the density and workflow of the table.

```html
<nat-table-surface [(state)]="tableState">
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />
</nat-table-surface>
```

## Split Page-Size And Pager Controls

Use `NatTablePagination` when the page-size chips and previous/next buttons should render as one toolbar. Use `NatTablePageSize` and `NatTablePager` separately when the layout needs them in different regions, such as page size near table filters and paging controls near the table footer.

```html
<nat-table-surface [(state)]="tableState">
  <div class="table-controls">
    <nat-table-page-size [pageSizeOptions]="[25, 50, 100]" groupAriaLabel="Rows per page" />
  </div>

  <nat-table [data]="rows()" [columns]="columns" accessibleName="Open positions" />

  <nat-table-pager groupAriaLabel="Position pages" />
</nat-table-surface>
```

Both split controls register pagination with the table surface, update the same `pagination` state slice, and use the active UI locale for generated labels. Pass `pageSizeOptions` to `NatTablePageSize`; pass pager label overrides to `NatTablePager` only when the default locale copy is not specific enough for the table.

## Manual Pagination

Use manual pagination when your app prepares the visible rows outside the table. Pass `manualPageCount` so the pager knows how many pages exist in the external row pipeline.

```html
<nat-table-surface [manualPageCount]="pageCount()" [mode]="{ pagination: 'manual' }" [(state)]="tableState">
  <nat-table-pagination [pageSizeOptions]="[25, 50, 100]" />
  <nat-table [data]="pageRows()" [columns]="columns" accessibleName="Paged results" />
</nat-table-surface>
```

Manual pagination is often combined with manual filtering or sorting, but it is not limited to server requests.
