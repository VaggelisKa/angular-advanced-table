import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CellContext, type ColumnDef } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableSurface,
  NatTableSearch,
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
  { id: 'item-3', name: 'Gamma Processor', category: 'Data Science', status: 'Paused', value: 7800 },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-search-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTableSearch],
  styles: `
    .showcase-container {
      display: grid;
      gap: 24px;
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-section {
      border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
      padding-bottom: 16px;
    }
    .title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1f6feb, #ff4500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 8px;
    }
    .description {
      color: #657786;
      font-size: 1rem;
      margin: 0;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: start;
    }
    .card {
      background: var(--card-bg, #ffffff);
      border-radius: 12px;
      border: 1px solid var(--card-border, rgba(0, 0, 0, 0.06));
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
    }
    .card-title {
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0 0 16px;
    }
    .search-panel {
      margin-bottom: 24px;
    }
    :host-context([data-theme="dark"]) {
      --card-bg: #14171c;
      --card-border: #262b33;
      .description {
        color: #9aa4b1;
      }
    }
  `,
  template: `
    <div class="showcase-container">
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
