import { Component, computed, signal } from '@angular/core';
import { type CellContext, type ColumnDef, type PaginationState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTablePagination,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800,
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
  { id: 'item-7', name: 'Eta Watchdog', category: 'Security', status: 'Active', value: 3300 },
  { id: 'item-8', name: 'Theta Analyzer', category: 'Analytics', status: 'Paused', value: 6200 },
  { id: 'item-9', name: 'Iota Aggregator', category: 'Analytics', status: 'Active', value: 5100 },
];

@Component({
  selector: 'app-pagination-showcase',
  imports: [NatTable, NatTableSurface, NatTablePagination],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Table Pagination</h1>
        <p class="description">
          Demonstrates client-side pagination row models driven by pager and page-size switches, as
          well as server-side/manual configurations.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Paginated Grid (Client-Side)</h2>

          <nat-table-surface [(state)]="tableState">
            <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />

            <nat-table [data]="data" [columns]="columns" accessibleName="Pagination demo table" />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Manual / Server-Side Pagination (Mixed Mode)</h2>
          <p class="description" style="margin-bottom: 1rem;">
            Pagination is handled externally (simulated server-side slicing), while sorting remains
            automatic client-side.
          </p>

          <nat-table-surface
            [mode]="{ pagination: 'manual', sorting: 'auto' }"
            [manualPageCount]="manualPageCount()"
            [(state)]="manualTableState"
          >
            <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />

            <nat-table
              [data]="manualData()"
              [columns]="columns"
              accessibleName="Manual pagination demo table"
            />
          </nat-table-surface>
        </div>
      </div>
    </div>
  `,
})
export class PaginationShowcasePage {
  readonly data = DEMO_DATA;

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
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
  ]);

  readonly tableState = signal<Partial<NatTableState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 3,
    },
  });

  // Mixed Mode State & Computing
  readonly manualTableState = signal<Partial<NatTableState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 3,
    },
  });

  readonly manualData = computed(() => {
    const pageState = this.manualTableState().pagination ?? { pageIndex: 0, pageSize: 3 };
    const start = pageState.pageIndex * pageState.pageSize;
    return DEMO_DATA.slice(start, start + pageState.pageSize);
  });

  readonly manualPageCount = computed(() => {
    const pageState = this.manualTableState().pagination ?? { pageIndex: 0, pageSize: 3 };
    return Math.ceil(DEMO_DATA.length / pageState.pageSize);
  });
}
