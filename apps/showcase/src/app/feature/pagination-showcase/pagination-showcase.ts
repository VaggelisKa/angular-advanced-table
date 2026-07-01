import { Component, computed, signal } from '@angular/core';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import { NatTablePagination, NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
  { id: 'item-7', name: 'Eta Watchdog', category: 'Security', status: 'Active', value: 3300 },
  { id: 'item-8', name: 'Theta Analyzer', category: 'Analytics', status: 'Paused', value: 6200 },
  { id: 'item-9', name: 'Iota Aggregator', category: 'Analytics', status: 'Active', value: 5100 }
];

@Component({
  selector: 'app-pagination-showcase',
  imports: [NatTable, NatTableSurface, NatTablePagination],
  styles: `
    .description-spaced {
      margin-bottom: 1rem;
    }
  `,
  template: `
    <div class="grid-layout">
      <div class="card">
        <h2 class="card-title">Paginated Grid (Client-Side)</h2>

        <nat-table-surface [(state)]="tableState">
          <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />

          <nat-table [columns]="columns" [data]="data" accessibleName="Pagination demo table" />
        </nat-table-surface>
      </div>

      <div class="card">
        <h2 class="card-title">Manual Data Handling (Mixed Mode)</h2>
        <p class="description description-spaced">Pagination is handled externally, while sorting remains automatic client-side.</p>

        <nat-table-surface
          [manualPageCount]="manualPageCount()"
          [mode]="{ pagination: 'manual', sorting: 'auto' }"
          [(state)]="manualTableState">
          <nat-table-pagination [pageSizeOptions]="[3, 5, 10]" />

          <nat-table [columns]="columns" [data]="manualData()" accessibleName="Manual pagination demo table" />
        </nat-table-surface>
      </div>
    </div>
  `
})
export class PaginationShowcasePage {
  protected readonly data = DEMO_DATA;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' }
    },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
    }
  ]);

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 3
    }
  });

  // Mixed Mode State & Computing
  protected readonly manualTableState = signal<Partial<NatTableUserState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 3
    }
  });

  protected readonly manualData = computed(() => {
    const pageState = this.manualTableState().pagination ?? { pageIndex: 0, pageSize: 3 };
    const start = pageState.pageIndex * pageState.pageSize;

    return DEMO_DATA.slice(start, start + pageState.pageSize);
  });

  protected readonly manualPageCount = computed(() => {
    const pageState = this.manualTableState().pagination ?? { pageIndex: 0, pageSize: 3 };

    return Math.ceil(DEMO_DATA.length / pageState.pageSize);
  });
}
