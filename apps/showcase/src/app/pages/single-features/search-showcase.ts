import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CellContext, type ColumnDef } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, NatTableSearch, withNatTableHeaderActions } from 'ng-advanced-table-ui';

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
];

@Component({
  selector: 'app-search-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTableSearch],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Global Search & Filter</h1>
        <p class="description">
          Demonstrates real-time fuzzy search filtering against all columns.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Searchable Grid</h2>

          <div class="search-panel">
            <nat-table-search
              [for]="grid"
              label="Fuzzy search symbol, name, status, or category"
              placeholder="Search e.g. Analytics, Active, Delta..."
            />
          </div>

          <nat-table-surface>
            <nat-table
              #grid="natTable"
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              [enableGlobalFilter]="true"
              ariaLabel="Search demo table"
              (globalFilterChange)="onGlobalFilterChange($event)"
            />
          </nat-table-surface>
        </div>
      </div>
    </div>
  `,
})
export class SearchShowcasePage {
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
    globalFilter: '',
  });

  onGlobalFilterChange(globalFilter: string): void {
    this.tableState.update((current) => ({ ...current, globalFilter }));
  }
}
