import { Component, signal } from '@angular/core';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import { TableSearch } from '../../components/table-search/table-search';

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
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

@Component({
  selector: 'app-search-showcase',
  imports: [NatTable, NatTableSurface, TableSearch],
  template: `
    <div class="grid-layout">
      <div class="card">
        <h2 class="card-title">Searchable Grid</h2>

        <nat-table-surface [(state)]="tableState">
          <div class="search-panel">
            <app-table-search
              label="Fuzzy search symbol, name, status, or category"
              placeholder="Search e.g. Analytics, Active, Delta..." />
          </div>

          <nat-table [columns]="columns" [data]="data" accessibleName="Search demo table" />
        </nat-table-surface>
      </div>
    </div>
  `
})
export class SearchShowcasePage {
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

  protected readonly tableState = signal<Partial<NatTableState>>({
    globalFilter: ''
  });
}
