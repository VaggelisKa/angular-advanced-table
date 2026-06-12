# Declarative Table API Example

The following showcase demonstrates the simplified, context-aware API implemented for the `ng-advanced-table` components.

```html
<nat-table-surface
  mode="manual"
  [(state)]="tableState"
  [stickyHeader]="true"
  [manualPageCount]="pageCount"
>
  <nat-table-toolbar>
    <nat-render-metrics-filter />
    <nat-render-metrics-panel />
  </nat-table-toolbar>

  <nat-table-toolbar>
    <div align-left>
      <nat-table-search placeholder="Search e.g. Analytics, Active, Delta..." />
    </div>

    <nat-table-column-visibility />
    <nat-table-scroll-control />
    <button class="btn btn-primary" (click)="refreshData()">Refresh</button>
  </nat-table-toolbar>

  <nat-table [data]="data()" [columns]="columns" accessibleName="Search demo table" />

  <nat-table-pagination [pageSizeOptions]="[10, 25, 50, 100]" />
</nat-table-surface>
```

### Component Script Code

Below is the corresponding component class implementation demonstrating standalone setup, signal-based state synchronization, and manual data fetching:

```typescript
import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableSurface,
  NatTableToolbar,
  NatTableSearch,
  NatTablePagination,
  NatTableColumnVisibility,
  NatTableScrollControl,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
}

@Component({
  selector: 'app-declarative-table-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NatTableSurface,
    NatTableToolbar,
    NatTableSearch,
    NatTableColumnVisibility,
    NatTableScrollControl,
    NatTable,
    NatTablePagination,
  ],
  templateUrl: './declarative-table-demo.html',
})
export class DeclarativeTableDemoComponent {
  // Underlying table data signal
  readonly data = signal<DemoItem[]>([
    { id: '1', name: 'Server Node A', category: 'Infrastructure', status: 'Active' },
    { id: '2', name: 'Server Node B', category: 'Security', status: 'Alert' },
  ]);

  // Two-way bindable table state
  readonly tableState = signal<Partial<NatTableState>>({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'name', desc: false }],
  });

  // Total page count for manual pagination
  readonly pageCount = signal(5);

  // Column definitions with header actions menu
  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
    },
  ]);

  constructor() {
    // Reactively trigger API calls when state changes (under manual mode)
    effect(() => {
      const currentState = this.tableState();
      this.fetchData(currentState);
    });
  }

  private fetchData(state: Partial<NatTableState>): void {
    console.log('Fetching manual page data with state:', state);
    // Fetch/filtering logic goes here...
  }

  protected refreshData(): void {
    this.fetchData(this.tableState());
  }
}
```

