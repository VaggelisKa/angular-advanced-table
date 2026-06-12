# Declarative Table API Example

The following showcase demonstrates the simplified, context-aware API implemented for the `ng-advanced-table` components.

```html
<nat-table-surface
  [stickyHeader]="true"
  mode="manual"
  [(state)]="tableState"
  [manualPageCount]="pageCount"
>
  <nat-table-toolbar>
    <!-- Content projected into the left-aligned section (align-left) -->
    <div align-left class="toolbar-left">
      <nat-table-search placeholder="Search e.g. Analytics, Active, Delta..." />
    </div>

    <!-- Metrics projected internally into the top metrics row -->
    <nat-render-metrics-filter />
    <nat-render-metrics-panel />

    <!-- Actions projected into the bottom-right toolbar section -->
    <nat-table-column-visibility />
    <nat-table-scroll-control />
    <button class="btn btn-primary" (click)="refreshData()">Refresh</button>
  </nat-table-toolbar>

  <!-- Core table component consuming data and columns -->
  <nat-table
    [data]="data()"
    [columns]="columns"
    accessibleName="Search demo table"
  />

  <!-- Unified pagination toolbar combining page sizes and page controls -->
  <nat-table-pagination [pageSizeOptions]="[10, 25, 50, 100]" />
</nat-table-surface>
```
