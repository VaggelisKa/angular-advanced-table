## Search Is App-Owned

Search copy, matching rules, filter menus, and request timing are product concerns. Use consumer-owned controls that patch table state rather than expecting the library to ship a generic search box for every workflow.

## Global Filters

Use `globalFilter` when one input should narrow rows across the table. Reset `pagination.pageIndex` when a filter changes so users do not stay on an empty later page.

```ts
this.tableState.update((state) => ({
  ...state,
  globalFilter: value,
  pagination: { ...(state.pagination ?? { pageIndex: 0, pageSize: 25 }), pageIndex: 0 }
}));
```

## Column Filters

Use `columnFilters` when a control targets a specific column. Define the column's filter function near the column definition so the matching rule stays close to the field it interprets.

## Manual Data Handling

When filtering happens outside the table, set filtering to manual mode and pass already-filtered rows into `NatTable`. The external pipeline may be a backend, local cache, worker, or store.

```html
<nat-table-surface [mode]="{ filtering: 'manual', pagination: 'manual' }" [(state)]="tableState">
  <nat-table [data]="rows()" [columns]="columns" accessibleName="Filtered results" />
</nat-table-surface>
```
