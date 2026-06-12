# Declarative Table API Example

The following showcase demonstrates the simplified, context-aware API implemented for the `ng-advanced-table` components.

```html
<nat-table-surface
  mode="manual"
  [(state)]="tableState"
  [stickyHeader]="true"
  [manualPageCount]="pageCount()"
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
    <button class="btn btn-primary" (click)="serverResponse.reload()">Refresh</button>
  </nat-table-toolbar>

  <nat-table [data]="data()" [columns]="columns" accessibleName="Search demo table" />

  <nat-table-pagination [pageSizeOptions]="[10, 25, 50, 100]" />
</nat-table-surface>
```

### Component Script Code

Below is the corresponding component class implementation demonstrating standalone setup, declarative data loading with `resource()`, and derived state using `computed()`:

```typescript
import { ChangeDetectionStrategy, Component, computed, resource, signal } from '@angular/core';
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
  // Two-way bindable table state signal
  readonly tableState = signal<Partial<NatTableState>>({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'name', desc: false }],
  });

  // Reactively fetch data from the server whenever the tableState changes
  readonly serverResponse = resource({
    request: () => this.tableState(),
    loader: async ({ request: state }) => {
      const params = new URLSearchParams();
      if (state.pagination) {
        params.set('page', String(state.pagination.pageIndex + 1));
        params.set('limit', String(state.pagination.pageSize));
      }
      if (state.sorting?.length) {
        const sort = state.sorting[0]!;
        params.set('sortBy', sort.id);
        params.set('order', sort.desc ? 'desc' : 'asc');
      }
      if (state.globalFilter) {
        params.set('search', state.globalFilter);
      }

      const res = await fetch(`/api/nodes?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load nodes data');
      }
      return res.json() as Promise<{ items: DemoItem[]; totalPages: number }>;
    }
  });

  // Derived signals reactively updated by the resource value
  readonly data = computed(() => this.serverResponse.value()?.items ?? []);
  readonly pageCount = computed(() => this.serverResponse.value()?.totalPages ?? 1);

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
}
```

