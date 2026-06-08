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
  { id: 'item-3', name: 'Gamma Processor', category: 'Data Science', status: 'Paused', value: 7800 },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-sorting-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
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
      background: linear-gradient(135deg, #1f6feb, #8a2be2);
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
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }
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
    .actions-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn {
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
      text-align: center;
      border: 1px solid transparent;
    }
    .btn-outline {
      background: transparent;
      border-color: #1f6feb;
      color: #1f6feb;
    }
    .btn-outline:hover {
      background: rgba(31, 111, 235, 0.04);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #f1f3f5;
      color: #495057;
    }
    .btn-secondary:hover {
      background: #e9ecef;
    }
    .info-tag {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(31, 111, 235, 0.1);
      color: #1f6feb;
      margin-top: 12px;
    }
    :host-context([data-theme="dark"]) {
      --card-bg: #14171c;
      --card-border: #262b33;
      .description {
        color: #9aa4b1;
      }
      .btn-secondary {
        background: #212529;
        color: #dee2e6;
      }
      .btn-secondary:hover {
        background: #2b3035;
      }
    }
  `,
  template: `
    <div class="showcase-container">
      <header class="header-section">
        <h1 class="title">Sorting Feature</h1>
        <p class="description">
          Demonstrates single-column sorting configuration and state handling in the table.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Interactive Sorting Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              ariaLabel="Sorting demo table"
              (sortingChange)="onSortingChange($event)"
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

          <div class="info-tag">
            Current state: {{ currentSortLabel() }}
          </div>
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
