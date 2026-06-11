# Table API Suggestions

```html
<nat-table-surface mode="manual" [(state)]="tableState">
  <nat-table-toolbar>
    <nat-table-search placeholder="Search e.g. Analytics, Active, Delta..." />

    <nat-actions> </nat-actions>
  </nat-table-toolbar>

  <nat-pagination />
  <nat-loader />

  <nat-table [data]="data" [columns]="columns" accessibleName="Search demo table" />
</nat-table-surface>
```
