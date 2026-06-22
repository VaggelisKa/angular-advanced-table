# Declarative Table API Example

The following showcase demonstrates the simplified, context-aware API implemented for the `ng-advanced-table` components.

```html
<nat-table-surface
  mode="manual"
  [(state)]="tableState"
  [stickyHeader]="true"
  [manualPageCount]="pageCount()"
>
  <nat-table-toolbar accessibleName="Render metrics toolbar">
    <nat-render-metrics-filter />
    <nat-render-metrics-panel />
  </nat-table-toolbar>

  <nat-table-toolbar accessibleName="Table controls">
    <input
      natToolbarItem="search"
      type="search"
      aria-label="Search table"
      placeholder="Search e.g. Analytics, Active, Delta..."
      [value]="tableState().globalFilter ?? ''"
      (input)="setGlobalFilter($event)"
    />

    <nat-table-column-visibility />

    <button natToolbarItem="refresh" natToolbarItemPosition="end" (click)="serverResponse.reload()">
      Refresh
    </button>
  </nat-table-toolbar>

  <nat-table [data]="data()" [columns]="columns" accessibleName="Search demo table" />

  <nat-table-pagination [pageSizeOptions]="[10, 25, 50, 100]" />
</nat-table-surface>
```

### Component Script Code

Below is the corresponding component class implementation demonstrating standalone setup, declarative data loading with `resource()`, and derived state using `computed()`:

```typescript
import { Component, computed, resource, signal } from '@angular/core';
import { type ColumnDef } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableSurface,
  NatTableToolbar,
  NatToolbarItem,
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
  imports: [
    NatTableSurface,
    NatTableToolbar,
    NatToolbarItem,
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

  setGlobalFilter(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    this.tableState.update((state) => ({
      ...state,
      pagination: { ...(state.pagination ?? { pageIndex: 0, pageSize: 10 }), pageIndex: 0 },
      globalFilter: target.value,
    }));
  }

  // Reactively fetch data from the server whenever the tableState changes
  readonly serverResponse = resource({
    request: () => this.tableState(),
    loader: async ({ request: state }) => {
      const page = state.pagination?.pageIndex ?? 0;
      const size = state.pagination?.pageSize ?? 10;
      const search = state.globalFilter ?? '';

      const res = await fetch(`/api/nodes?page=${page}&size=${size}&search=${search}`);
      if (!res.ok) {
        throw new Error('Failed to load nodes data');
      }
      return res.json() as Promise<{ items: DemoItem[]; totalPages: number }>;
    },
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
