import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { type CellContext, type ColumnDef, type SortingState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

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
  selector: 'app-sorting-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Sorting Feature</h1>
        <p class="description">
          Demonstrates single-column sorting configuration and state handling in the table.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Interactive Sorting Grid</h2>
          <nat-table-surface [(state)]="tableState">
            <nat-table
              [data]="data"
              [columns]="columns"
              accessibleName="Sorting demo table"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Programmatic Sort Actions</h2>
          <div class="actions-panel">
            <button type="button" class="btn btn-outline" (click)="sortBy('value', 'asc')">
              Sort by Value (Asc)
            </button>
            <button type="button" class="btn btn-outline" (click)="sortBy('name', 'desc')">
              Sort by Name (Desc)
            </button>
            <button type="button" class="btn btn-secondary" (click)="clearSort()">
              Clear Sorting
            </button>
          </div>

          <div class="info-tag">Current state: {{ currentSortLabel() }}</div>
        </div>
      </div>
    </div>
  `,
})
export class SortingShowcasePage {
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
    sorting: [{ id: 'name', desc: false }],
  });

  readonly currentSortLabel = computed(() => {
    const sorting = this.tableState().sorting;
    if (!sorting?.length) {
      return 'None';
    }
    const entry = sorting[0]!;
    return `${entry.id} (${entry.desc ? 'desc' : 'asc'})`;
  });

  onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  sortBy(id: string, dir: 'asc' | 'desc'): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [{ id, desc: dir === 'desc' }],
    }));
  }

  clearSort(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [],
    }));
  }
}
