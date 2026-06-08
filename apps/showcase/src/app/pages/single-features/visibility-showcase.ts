import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type ColumnDef, type VisibilityState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableSurface,
  NatTableColumnVisibility,
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
  selector: 'app-visibility-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTableColumnVisibility],
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
      background: linear-gradient(135deg, #1f6feb, #32cd32);
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
    .visibility-panel {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--card-contrast, #fafbfc);
      border-radius: 8px;
      border: 1px solid var(--card-border, rgba(0,0,0,0.06));
    }
    :host-context([data-theme="dark"]) {
      --card-bg: #14171c;
      --card-border: #262b33;
      --card-contrast: #1a1e24;
      .description {
        color: #9aa4b1;
      }
    }
  `,
  template: `
    <div class="showcase-container">
      <header class="header-section">
        <h1 class="title">Column Visibility</h1>
        <p class="description">
          Demonstrates how columns can be dynamically shown or hidden by the user.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Visibility Grid Control</h2>

          <div class="visibility-panel">
            <nat-table-column-visibility [for]="grid" />
          </div>

          <nat-table-surface>
            <nat-table
              #grid="natTable"
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              ariaLabel="Visibility demo table"
              (columnVisibilityChange)="onColumnVisibilityChange($event)"
            />
          </nat-table-surface>
        </div>
      </div>
    </div>
  `,
})
export class VisibilityShowcasePage {
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
      cell: (context) => `$${context.getValue<number>().toLocaleString()}`,
    },
  ]);

  readonly tableState = signal<Partial<NatTableState>>({
    columnVisibility: {
      category: true,
      status: true,
      value: true,
    },
  });

  onColumnVisibilityChange(columnVisibility: VisibilityState): void {
    this.tableState.update((current) => ({ ...current, columnVisibility }));
  }
}
